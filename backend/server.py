import os
import json
import shutil
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from google import genai
from google.genai import types
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
import supabase

# Load environment variables (force override of cached shell variables)
load_dotenv(override=True)

# Fallback: if keys are not loaded, try loading from parent directory .env
if not os.environ.get("GEMINI_API_KEY") and not os.environ.get("GOOGLE_API_KEY"):
    parent_env_path = os.path.join("..", ".env")
    if os.path.exists(parent_env_path):
        load_dotenv(dotenv_path=parent_env_path, override=True)

print("[INFO] Diagnostics on Startup:")
print(" - GEMINI_API_KEY / GOOGLE_API_KEY loaded:", bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")))
print(" - SUPABASE_URL loaded:", bool(os.environ.get("SUPABASE_URL")))
print(" - SUPABASE_SERVICE_ROLE_KEY loaded:", bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY")))

# Import PDF processing logic from ingest.py
from ingest import process_pdf 

app = FastAPI(title="CivicSync AI Gateway")

# Allow the React Native app to send requests to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client (from environment variables)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY) if (SUPABASE_URL and SUPABASE_KEY) else None

# Initialize Google Generative AI Embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    output_dimensionality=1536
) if (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")) else None

class ChatRequest(BaseModel):
    message_text: str
    user_id: str

def fetch_rag_context(query: str) -> str:
    """
    Converts query to embeddings and queries match_documents RPC in Supabase.
    """
    if not supabase_client or not embeddings:
        print("[WARN] Supabase client or embeddings model not initialized. Skipping RAG search.")
        return ""
    try:
        print("[INFO] Creating search embeddings for query...")
        query_vector = embeddings.embed_query(query)
        
        print("[INFO] Performing semantic search in Supabase...")
        response = supabase_client.rpc(
            'match_documents', 
            {
                'query_embedding': query_vector,
                'match_threshold': 0.3,   # Minimum similarity score required
                'match_count': 3          # Return top 3 best matches
            }
        ).execute()
        
        if response.data:
            print(f"[SUCCESS] RAG retrieved {len(response.data)} document chunks.")
            context = "\n".join([match['content'] for match in response.data if match.get('content')])
            return f"\nRetrieved Context/Laws:\n{context}"
        else:
            print("[INFO] Semantic search returned no matches. Using default AI knowledge.")
    except Exception as e:
        print("[ERROR] Error during RAG retrieval (falling back to default knowledge):", str(e))
    return ""

@app.post("/api/ingest")
async def ingest_document(
    file: UploadFile = File(...), 
    title: str = Form(...) # Expect title string in the form data
):
    print(f"[INFO] Received file upload request for: {file.filename} with title: {title}")
    
    # Create a temporary location to save the uploaded PDF
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # Save the incoming file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print("[INFO] Handing file over to the AI Ingestion Pipeline...")
        
        # Trigger pipeline from ingest.py
        process_pdf(temp_file_path, title) 
        
        return {"status": "success", "message": f"Successfully ingested {title}."}
        
    except Exception as e:
        print("[ERROR] Error during ingestion:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Clean up temporary files
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print("[INFO] Cleaned up temporary files.")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not gemini_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY or GOOGLE_API_KEY environment variable is not set."
        )

    # Initialize the new Google GenAI Client
    client = genai.Client(api_key=gemini_key)

    # 1. Retrieve semantic document matches (RAG)
    context = fetch_rag_context(request.message_text)

    # 2. Build strict system instructions
    system_instruction = (
        "You are CivicSync, an expert legal assistant for Sri Lankan citizens. "
        "You must only provide advice based on the retrieved documents or your knowledge of Sri Lankan laws. "
        "You must be polite, concise, and structured.\n\n"
        "If the user asks how to perform a civic process (e.g. register a business, replace an NIC, get a license, etc.), "
        "you MUST include a 'roadmap_trigger' in your JSON response containing a title, description, and steps "
        "so the app can generate an interactive checklist.\n\n"
        "If they are just chatting or no process checklist is required, set 'roadmap_trigger' to null.\n\n"
        "You MUST respond ONLY in the following JSON format:\n"
        "{\n"
        "  \"chat_reply\": \"Your conversational answer to the user\",\n"
        "  \"roadmap_trigger\": {\n"
        "    \"title\": \"Checklist Title (e.g. Small Business Registration)\",\n"
        "    \"description\": \"A brief summary of the checklist purpose\",\n"
        "    \"steps\": [\n"
        "      {\n"
        "        \"step_order\": 1,\n"
        "        \"title\": \"Step Title (e.g. Name Approval)\",\n"
        "        \"detail\": \"Explanation of what to do (e.g. Submit names to DS)\"\n"
        "      }\n"
        "    ]\n"
        "  }\n"
        "}"
    )

    try:
        # Generate content using the new SDK syntax and gemini-3.1-flash-lite
        prompt = f"User Question: {request.message_text}\n{context}"
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json"
            )
        )
        
        # Clean up any potential markdown code fences from the response
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result

    except Exception as e:
        print("[ERROR] Error calling Gemini API:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI model error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

class GeneratePDFRequest(BaseModel):
    user_id: str
    form_type: str

@app.post("/api/generate-pdf")
async def generate_pdf(payload: GeneratePDFRequest):
    try:
        # 1. Fetch user profile data 
        profile_res = supabase.table("Profiles").select("full_name", "nic_number").eq("id", payload.user_id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="User profile not found. Please complete profile details first.")
        
        user_info = profile_res.data[0]
        full_name = user_info.get("full_name")
        nic_number = user_info.get("nic_number")
        
        if not full_name or not nic_number:
            raise HTTPException(status_code=400, detail="Missing Name or NIC in secure profile.")   

        # 2. Download the blank template from template bucket
        template_filename = f"{payload.form_type}_blank.pdf"
        try:
            blank_pdf_bytes = supabase.storage.from_("templates").download(template_filename)
        except Exception:
            raise HTTPException(status_code=404, detail="Blank form template not found in vault templates.")

        # 3. Create an overlay PDF layer with coordinates using ReportLab
        packet = io.BytesIO()
        can = canvas.Canvas(packet)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
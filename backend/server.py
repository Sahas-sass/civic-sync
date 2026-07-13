from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import traceback

# Import your exact process_pdf function from your ingest.py file
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

@app.post("/api/ingest")
async def ingest_document(
    file: UploadFile = File(...), 
    title: str = Form(...) # Explicitly expect the 'title' string in the form data
):
    print(f"📥 Received file upload request for: {file.filename} with title: {title}")
    
    # 1. Create a temporary location to save the uploaded PDF
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # 2. Save the incoming file to your computer
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print("⚙️ Handing file over to the AI Ingestion Pipeline...")
        
        # 3. Trigger your exact pipeline from ingest.py!
        # Pass the temp file path and the title to the processing function
        process_pdf(temp_file_path, title) 
        
        return {"status": "success", "message": f"Successfully ingested {title}."}
        
    except Exception as e:
        print("🚨 Error during ingestion:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # 4. Clean up: Delete the temporary file so it doesn't clog up your hard drive
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print("🧹 Cleaned up temporary files.")
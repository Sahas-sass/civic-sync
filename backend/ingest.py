import os
from dotenv import load_dotenv
from supabase import create_client
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Swap the OpenAI import for the Google GenAI import
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

# Fallback: if keys are not loaded, try loading from parent directory .env
if not os.environ.get("SUPABASE_URL"):
    import os
    parent_env_path = os.path.join("..", ".env")
    if os.path.exists(parent_env_path):
        load_dotenv(dotenv_path=parent_env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") 
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Swap the embedding model to the free Gemini model
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    output_dimensionality=1536
)

def process_pdf(file_path, doc_title):
    print(f"🔄 Loading document: {file_path}...")
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.split_documents(pages)
    print(f"✂️ Split document into {len(chunks)} individual chunks.")
    
    for i, chunk in enumerate(chunks):
        page_num = chunk.metadata.get("page", 0) + 1
        
        # Generates the vector using Gemini
        vector = embeddings.embed_query(chunk.page_content)
        
        data = {
            "content": chunk.page_content,
            "metadata": {
                "source": doc_title,
                "page": page_num
            },
            "embedding": vector
        }
        
        supabase.table("legal_documents").insert(data).execute()
        print(f"✅ Uploaded chunk {i+1}/{len(chunks)} (Page {page_num})")

if __name__ == "__main__":
    # Make sure you have your test PDF ready!
    process_pdf("test_law.pdf", "Business Registration Guidelines")
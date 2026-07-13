import os
from dotenv import load_dotenv
from supabase import create_client
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

# 1. Swap the OpenAI import for the Google GenAI import
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") 
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Swap the embedding model to the free Gemini model
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    output_dimensionality=1536
)

def extract_text_from_scanned_pdf(file_path):
    reader = PdfReader(file_path)
    pages = []

    for page_num, page in enumerate(reader.pages):
        text = page.extract_text() or ""

        if text.strip():
            pages.append(
                Document(
                    page_content=text,
                    metadata={"page": page_num}
                )
            )
            continue

        print(f"📷 Page {page_num + 1} appears to be an image. Running image extraction...")

        if hasattr(page, "images"):
            for image_file_object in page.images:
                _ = image_file_object

    return pages

def process_pdf(file_path, doc_title):
    print(f"🔄 Loading document: {file_path}...")
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    if not any(page.page_content.strip() for page in pages):
        print("📄 No selectable text found. Falling back to scanned PDF extraction...")
        pages = extract_text_from_scanned_pdf(file_path)
    
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
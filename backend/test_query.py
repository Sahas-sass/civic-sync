import os
from dotenv import load_dotenv
from supabase import create_client
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load variables from your .env file
load_dotenv()

# Initialize the Supabase Client
supabase = create_client(
    os.environ.get("SUPABASE_URL"), 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Initialize the Gemini embedding model (matching your ingestion script exactly)
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    output_dimensionality=1536
)

def run_diagnostic(user_question):
    print(f"🔍 Question Asked: '{user_question}'")
    print("🧠 Converting question to vector embeddings via Gemini...")
    
    # 1. Convert the user's natural language question into a coordinate vector
    query_vector = embeddings.embed_query(user_question)
    
    print("⚡ Executing similarity search in Supabase (RPC)...")
    
    # 2. Match the vector against your legal_documents table rows
    response = supabase.rpc(
        'match_documents', 
        {
            'query_embedding': query_vector,
            'match_threshold': 0.3,   # Minimum similarity score required
            'match_count': 1          # Return the top single best match
        }
    ).execute()
    
    # 3. Process and display the output
    if not response.data:
        print("❌ Search Failed: No records found matching the semantic meaning.")
        return
        
    match = response.data[0]
    similarity_score = round(match['similarity'] * 100, 2)
    
    print(f"\n🎉 SUCCESS! Database retrieved the correct law details:")
    print(f"📈 Match Confidence: {similarity_score}%")
    print(f"📄 Source Document: {match['metadata']['source']} (Page {match['metadata']['page']})")
    print(f"📝 Retextured Content: \"{match['content']}\"")

if __name__ == "__main__":
    # Test query using completely different vocabulary than the PDF text to ensure semantic matching works
    run_diagnostic("How much cash do I need to register a individual business?")
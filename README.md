# 🇱🇰 CivicSync AI
### AI-Powered Citizen Assistance Platform for Sri Lankan Government Services

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Google_Gemini_3.1_Flash_Lite-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge"/>
</p>

---

## 📖 Overview

Navigating government administrative procedures is often challenging due to dense legal documents, complex bureaucracies, and fragmented information across different departments. 

**CivicSync AI** is a mobile-first intelligent assistant platform designed to simplify public services for Sri Lankan citizens. By combining **Retrieval-Augmented Generation (RAG)**, secure digital vaults, and generative AI models, the platform turns complex official guidelines into conversational support, custom actionable checklists, and auto-populated PDF application forms.

---

## ✨ Key Features & Modules

### 🤖 Conversational AI Assistant
Ask questions in natural language and receive context-aware, structured answers strictly derived from official Sri Lankan regulations and laws.
* **Powered by Gemini**: Driven by `gemini-3.1-flash-lite` for fast, cost-effective, and accurate responses.
* **Strict Guardrails**: Prevents hallucination by matching queries directly against verified legal text.

### 📚 Semantic RAG Database
* **Vector Similarity Search**: Converts documents into vector representations to fetch the most relevant rules before replying.
* **Scanned PDF Fallback**: Ingestion pipeline automatically detects and processes scanned images/PDFs to extract text.

### 🗺️ Dynamic Roadmap Engine
* **Interactive Checklists**: If a citizen asks about a multi-step process (e.g., registering a business, replacing an NIC, or renewing a passport), the AI generates a customized step-by-step roadmap.
* **Progress Tracking**: Steps are saved in Supabase and can be toggled by the user to monitor progress.

### 🔐 Secure Document Vault
* **Private Cloud Storage**: Encrypted cloud storage for sensitive files (National ID scans, certificates, passports).
* **Row-Level Security (RLS)**: Enforces strict data isolation, ensuring users only see their own files.

### 📄 Smart Form Auto-Filling
* **Automated PDF Overlays**: Select user details (name, NIC, address) from a secure profile, and the system dynamically paints them onto official government PDF forms (using ReportLab coordinates and PyPDF merging), uploading the generated document directly to the private vault.

---

## 🧠 AI Features Deep-Dive

### 🤖 Summary of AI Capabilities: What, How & Implementation

| AI Feature (What it can do) | Underlying Mechanism (How it does it) | Tech Stack & Code Implementation (How it is implemented) |
| :--- | :--- | :--- |
| **Conversational Legal Assistance** | Uses retrieval-augmented search to match user prompts against active legal documents, passing the context to Gemini for hallucination-free guidance. | Configured with `gemini-3.1-flash-lite` via the official `google-genai` Python SDK. Handled in `fetch_rag_context` and `chat_endpoint` inside [server.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/server.py). |
| **Legal Document Vectorization** | Parses official PDFs, chunks them, and generates semantic vector embeddings to represent the knowledge base. | Uses LangChain's `PyPDFLoader` and `RecursiveCharacterTextSplitter` chunking, generating 1536-dimensional embeddings with `gemini-embedding-001`. Handled in `process_pdf` inside [ingest.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/ingest.py). |
| **Semantic Similarity Search** | Translates the user's natural language question into an embedding and runs a cosine distance match against database documents. | Stored in PostgreSQL with `pgvector`. A custom database RPC function `match_documents` is triggered via the Supabase client inside [server.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/server.py). |
| **Dynamic Checklist Generation** | Recognizes if a civic process is requested and structures steps as JSON (title, description, details). | Handled via Gemini system instructions forcing a strict JSON schema (`response_mime_type="application/json"`). Stored via the database RPC function `create_roadmap_from_json` inside [AgentScreen.js](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/src/screens/AgentScreen.js). |
| **Smart PDF Form Filling** | Automatically extracts personal identifier data and dynamically overlays details onto blank governmental forms. | Implemented using ReportLab `canvas.Canvas` to draw strings at coordinate overlays, merging pages using PyPDF `PdfReader`/`PdfWriter`. Handled in the `/api/generate-pdf` endpoint inside [server.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/server.py). |

### 1. The RAG Retrieval Pipeline
To eliminate hallucinations, CivicSync uses a specialized Retrieval-Augmented Generation pipeline:
* **Ingestion ([ingest.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/ingest.py))**:
  * Loads documents using LangChain's `PyPDFLoader`.
  * If no selectable text is found, it runs fallback image/scanned PDF extraction.
  * Splitting: Uses `RecursiveCharacterTextSplitter` with a `chunk_size` of `1000` characters and `chunk_overlap` of `200` characters.
  * Embeddings: Generates 1536-dimensional embeddings utilizing `gemini-embedding-001`.
  * Storage: Chunks are stored in the `legal_documents` table in Supabase.

  ```python
  # Code Snippet from ingest.py (Text Chunking and Embedding generation)
  text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
  chunks = text_splitter.split_documents(pages)
  
  for chunk in chunks:
      vector = embeddings.embed_query(chunk.page_content)
      data = {
          "content": chunk.page_content,
          "metadata": {"source": doc_title, "page": page_num},
          "embedding": vector
      }
      supabase.table("legal_documents").insert(data).execute()
  ```

* **Retrieval ([server.py](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/backend/server.py))**:
  * The user's query is converted to a vector embedding using `gemini-embedding-001`.
  * The vector is queried against Supabase via a PostgreSQL RPC function named `match_documents`, returning the top 3 best matching document chunks with a similarity score of at least `0.3`.

  ```python
  # Code Snippet from server.py (Semantic Similarity RPC Query)
  query_vector = embeddings.embed_query(query)
  response = supabase_client.rpc(
      'match_documents', 
      {
          'query_embedding': query_vector,
          'match_threshold': 0.3,
          'match_count': 3
      }
  ).execute()
  ```

### 2. Google Gemini 3.1 Flash Lite Integration
* **Structured Output Model**: The API is configured using the official `google-genai` SDK and queries `gemini-3.1-flash-lite`.
* **JSON Schema Enforcement**: The system prompts Gemini to enforce a strict JSON output matching this structure:
  ```json
  {
    "chat_reply": "Conversational explanation answering the user's question...",
    "roadmap_trigger": {
      "title": "Checklist Title (e.g. Small Business Registration)",
      "description": "Brief description of the process",
      "steps": [
        {
          "step_order": 1,
          "title": "Step Title (e.g. Name Approval)",
          "detail": "Actionable explanation of what to do"
        }
      ]
    }
  }
  ```
  *(If the query is a simple conversational message and does not represent a civic process, `roadmap_trigger` is returned as `null`.)*

  ```python
  # Code Snippet from server.py (Calling Gemini Client with Structured Response Output)
  client = genai.Client(api_key=gemini_key)
  response = client.models.generate_content(
      model="gemini-3.1-flash-lite",
      contents=f"User Question: {message_text}\n{context}",
      config=types.GenerateContentConfig(
          system_instruction=system_instruction,
          response_mime_type="application/json"
      )
  )
  ```

### 3. Dynamic Checklist Generation
* When the React Native app ([AgentScreen.js](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/src/screens/AgentScreen.js)) receives a response containing `roadmap_trigger`, it invokes a Supabase Database RPC function `create_roadmap_from_json`.
* This function automatically splits and saves the roadmap and its individual steps, immediately alerting the user and populating the interactive checklists in the Roadmaps screen ([RoadmapsScreen.js](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/src/screens/RoadmapsScreen.js)).

### 4. ReportLab PDF Canvas Filling
* When the user requests a completed government form ([VaultScreen.js](file:///d:/OneDrive/Desktop/civic-sync/civic-sync/src/screens/VaultScreen.js)), the backend fetches the user's profile details (`Profiles` table) and downloads a blank template from Supabase Storage.
* An overlay PDF page is dynamically created in-memory using ReportLab `canvas.Canvas`.
* PyPDF `merge_page` overlays the printed values onto the blank template. The combined PDF is then saved in the private `user_vault` storage bucket under the user's specific path (`{user_id}/{form_type}_completed.pdf`).

  ```python
  # Code Snippet from server.py (Generating and Merging Form Coordinates)
  packet = io.BytesIO()
  can = canvas.Canvas(packet)
  can.drawString(150, 650, f"{full_name}")
  can.drawString(150, 600, f"{nic_number}")
  can.save()
  
  packet.seek(0)
  overlay_pdf = PdfReader(packet)
  existing_pdf = PdfReader(io.BytesIO(blank_pdf_bytes))
  
  output = PdfWriter()
  page = existing_pdf.pages[0]
  page.merge_page(overlay_pdf.pages[0])
  output.add_page(page)
  ```

---

## 🏗️ System Architecture

```
                Government PDFs
                       │
                       ▼
               Document Processing (ingest.py)
                       │
                       ▼
          Recursive Text Chunking (LangChain)
                       │
                       ▼
         Gemini Embedding Model (gemini-embedding-001)
                       │
                       ▼
       Supabase PostgreSQL + pgvector Database
                       │
                       ▼
       Similarity Search (Relevant Legal Chunks)
                       │
                       ▼
             Google Gemini 3.1 Flash Lite
                       │
           ┌────────────┴────────────┐
           ▼                         ▼
     Chat Response             Action Roadmap
```

---

## 📂 Project Structure

```
CivicSync-AI/
│
├── backend/                  # Python FastAPI Backend
│   ├── server.py             # Main entry point & API endpoints
│   ├── ingest.py             # Document parser, chunker & embedding pipeline
│   ├── requirements.txt      # Backend Python dependencies
│   └── test_law.pdf          # Test file for parsing guidelines
│
├── src/                      # React Native Expo Frontend
│   ├── components/           # Reusable UI elements (MessageItem, ChatInput, etc.)
│   ├── global.css            # Global Tailwind/NativeWind style configurations
│   ├── navigation/
│   │   └── AppNavigator.js   # Bottom Tab navigation & central AI floating button
│   ├── screens/
│   │   ├── WelcomeScreen.js  # Introduction splash screen
│   │   ├── LoginScreen.js    # Authentication sign-in
│   │   ├── RegisterScreen.js # Authentication signup
│   │   ├── HomeScreen.js     # Home dashboard
│   │   ├── AgentScreen.js    # AI Chat Assistant interface
│   │   ├── RoadmapsScreen.js # Interactive checklist tracker
│   │   ├── VaultScreen.js    # Secure personal file scanner and uploader
│   │   ├── ProfileScreen.js  # Personal data management (NIC, Full name, etc.)
│   │   └── AdminScreen.js    # Knowledge base document upload dashboard
│   ├── services/
│   │   ├── apiConfig.js      # Global backend gateway URL config
│   │   └── supabaseClient.js # Supabase client configurations with AsyncStorage
│   └── theme/                # Global color schemes
│
├── App.js                    # Mobile application entry point
├── package.json              # Frontend Node dependencies & scripts
├── babel.config.js           # Babel and Tailwind configurations
├── tailwind.config.js        # NativeWind configuration
└── tsconfig.json             # TypeScript configurations
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/civic-sync.git
cd civic-sync
```

### 2. Backend Setup
Set up a Python virtual environment and install the required dependencies:
```bash
cd backend
python -m venv venv

# Activate Virtual Env (Windows)
.\venv\Scripts\activate
# Activate Virtual Env (macOS/Linux)
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the root `civic-sync` folder or inside the `backend` folder:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
```

Run the backend development server:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
The API gateway will run on `http://localhost:8000`.

### 3. Frontend Setup
Install npm packages:
```bash
cd ..
npm install
```

Configure `src/services/apiConfig.js`:
Change `BACKEND_URL` to match your local IP address (so your physical mobile device/simulator can connect):
```javascript
export const BACKEND_URL = 'http://192.168.x.x:8000';
```

Launch the Expo CLI server:
```bash
npx expo start
```
* Press `a` for Android Emulator.
* Press `i` for iOS Simulator.
* Scan the QR Code using the Expo Go app on a physical device.

---

## 🗄️ Database & Supabase Configuration

### 1. SQL Initialization Script
Run the following SQL commands in your Supabase **SQL Editor** to create the necessary extensions, tables, policies, and database functions:

```sql
-- 1. Enable the vector database extension
create extension if not exists vector;

-- 2. Legal Documents Table (Used for RAG context storage)
create table public.legal_documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Profiles Table (Holds secure citizen metadata)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  nic_number text,
  phone text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Chat Messages History Table
create table public."ChatMessages" (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  sender text not null, -- 'user' or 'ai'
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. User Private Vault Files Table
create table public.user_private_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_path text not null,
  document_type text,
  extracted_data jsonb default '{}'::jsonb,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Documents Table (Used for backend completed forms tracking)
create table public."Documents" (
  id bigserial primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_path text not null,
  document_type text,
  is_ready boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Roadmaps Table
create table public."Roadmaps" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Roadmap Steps Table
create table public."Roadmap_Steps" (
  id uuid default gen_random_uuid() primary key,
  roadmap_id uuid references public."Roadmaps" on delete cascade not null,
  step_order integer not null,
  title text not null,
  detail text,
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2. Database RPC Functions

Run these additional queries to register the necessary database RPC functions:

#### A. RAG Match Documents (`match_documents`)
```sql
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    legal_documents.id,
    legal_documents.content,
    legal_documents.metadata,
    1 - (legal_documents.embedding <=> query_embedding) as similarity
  from legal_documents
  where 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
  order by legal_documents.embedding <=> query_embedding asc
  limit match_count;
end;
$$;
```

#### B. Parse and Store Checklists (`create_roadmap_from_json`)
```sql
create or replace function create_roadmap_from_json(
  p_user_id uuid,
  p_title text,
  p_description text,
  p_steps jsonb
)
returns void
language plpgsql
security definer
as $$
declare
  v_roadmap_id uuid;
  v_step jsonb;
begin
  -- Insert parent roadmap metadata
  insert into public."Roadmaps" (user_id, title, description)
  values (p_user_id, p_title, p_description)
  returning id into v_roadmap_id;

  -- Iterate through JSON steps list and populate individual steps
  for v_step in select * from jsonb_array_elements(p_steps)
  loop
    insert into public."Roadmap_Steps" (roadmap_id, step_order, title, detail, is_completed)
    values (
      v_roadmap_id,
      (v_step->>'step_order')::integer,
      v_step->>'title',
      v_step->>'detail',
      false
    );
  end loop;
end;
$$;
```

### 3. Supabase Storage Buckets
Ensure the following buckets exist in your Supabase project:
1. `templates` (Publicly readable): Contains blank PDF form templates (e.g. `business_registration_blank.pdf`).
2. `user_vault` (Private, authenticated access only): Secure folder structure used for storing private user documents and auto-generated PDFs.

---

## 🚀 Future Enhancements

* **Sinhala & Tamil Support**: Localizing the AI's prompts and outputs to native languages.
* **Voice Assistance**: Interactive voice chat system for enhanced accessibility.
* **OCR Ingestion**: AI document parsing of uploaded physical ID cards and application certificates.
* **Government Integration**: Live API hooks to track application statuses in real-time.

---



<p align="center">
Built with ❤️ to simplify Sri Lankan government services through Artificial Intelligence.
</p>

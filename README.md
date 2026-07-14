# 🇱🇰 CivicSync AI
### AI-Powered Citizen Assistance Platform for Sri Lankan Government Services

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Google_Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge"/>
</p>

---

## 📖 Overview

Government procedures are often difficult to understand due to lengthy legal documents, complex administrative processes, and scattered information across multiple agencies.

**CivicSync AI** is an intelligent citizen assistance platform that simplifies these challenges using **Retrieval-Augmented Generation (RAG)** and **Generative AI**. Instead of forcing citizens to navigate hundreds of pages of legal documentation, CivicSync provides personalized guidance, step-by-step roadmaps, secure document management, and trustworthy AI-powered assistance based on official Sri Lankan government regulations.

Our goal is to make government services **simpler, faster, and more accessible** for every Sri Lankan citizen.

---

# ✨ Key Features

## 🤖 AI Legal Assistant

Ask questions in natural language and receive structured, context-aware guidance based on verified Sri Lankan government documents.

- Conversational AI powered by **Google Gemini 2.5 Flash**
- Human-friendly explanations
- Personalized recommendations
- Structured responses

---

## 📚 Intelligent RAG Pipeline

Instead of relying solely on the language model, CivicSync retrieves relevant legal information directly from official government documents before generating responses.

This significantly improves:

- Accuracy
- Reliability
- Transparency
- Reduced AI hallucinations

---

## 🗺️ Dynamic Roadmap Engine

Government procedures are automatically converted into interactive roadmaps.

Features include:

- Step-by-step guidance
- Progress tracking
- Completion status
- Personalized task lists
- Clear action items

---

## 🔐 Secure Document Vault

Store important government documents securely.

Includes:

- National IDs
- Passports
- Birth certificates
- Other official documents

Additional capabilities:

- Secure cloud storage
- Auto-filled government forms
- Quick document retrieval

---

## 📄 Smart Form Assistance

Users can automatically populate government application forms using stored information, minimizing repetitive manual entry.

---

# 🏗️ System Architecture

```
                Government PDFs
                       │
                       ▼
               Document Processing
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
            Google Gemini 2.5 Flash
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    Chat Response             Action Roadmap
```

---

# 🧠 AI Workflow (RAG Pipeline)

## 1. Document Ingestion

Official government PDFs are processed using a custom ingestion pipeline.

- PDF extraction
- Cleaning
- Chunking using LangChain's `RecursiveCharacterTextSplitter`

---

## 2. Embedding Generation

Each document chunk is transformed into vector embeddings using:

**gemini-embedding-001**

These embeddings capture the semantic meaning of the legal text.

---

## 3. Vector Storage

Embeddings are stored inside Supabase PostgreSQL using the **pgvector** extension.

Each record contains:

- Document metadata
- Text chunk
- Embedding vector
- Source information

---

## 4. Intelligent Retrieval

When a citizen submits a question:

- The query is embedded
- Similarity search is performed
- Most relevant legal sections are retrieved

---

## 5. AI Response Generation

The retrieved legal context is supplied to **Google Gemini 2.5 Flash**, which produces a structured JSON response.

Example:

```json
{
  "chat_reply": "...",
  "roadmap_trigger": {
    "title": "...",
    "steps": [
      "...",
      "...",
      "..."
    ]
  }
}
```

---

# 🛠️ Technology Stack

## Frontend

- React Native
- Expo

---

## Backend

- FastAPI
- Python

Hosted on:

- Render

---

## AI & Machine Learning

- Google Gemini 2.5 Flash
- LangChain
- gemini-embedding-001

---

## Database

- Supabase PostgreSQL
- pgvector

---

## Storage

- Supabase Storage

---

## Document Processing

- Python PDF Processing
- Custom Auto-fill Scripts

---

# 📂 Project Structure

```
CivicSync-AI/
│
├── backend/
│   ├── server.py
│   ├── ingest.py
│   ├── rag_pipeline.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   └── assets/
│
├── storage/
│
├── documents/
│
├── README.md
│
└── package.json
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/civic-sync.git

cd civic-sync.git
```

---

## 2. Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn server:app --reload
```

Backend will run on:

```
http://localhost:8000
```

---

## 3. Frontend Setup

```bash
npm install

npx expo start
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_API_KEY=
```

---

# 🗄️ Database Requirements

Enable the following extension in Supabase:

```
pgvector
```

Required table:

```
legal_documents
```

Stores:

- Document chunks
- Metadata
- Embeddings

---

# 🚀 Core Modules

| Module | Description |
|---------|-------------|
| Authentication | User registration and secure login |
| AI Assistant | Conversational legal guidance |
| Roadmap Engine | Interactive task generation |
| Document Vault | Secure cloud document storage |
| Auto-fill Forms | Government application automation |
| Vector Search | Semantic legal document retrieval |
| RAG Pipeline | Retrieval-Augmented AI responses |

---

# 🔒 Security

- Secure authentication
- Protected cloud storage
- Verified government knowledge base
- Retrieval-based AI responses
- Minimized hallucinations through RAG

---

# 🎯 Future Enhancements

- Sinhala language support
- Tamil language support
- Voice-based AI assistant
- OCR for scanned government documents
- Real-time application status tracking
- Government API integrations
- Offline roadmap access
- Digital signature support

---

# 👥 Team Members

| Member | Responsibility |
|---------|----------------|
| **Chirath** | Identity & Security (Authentication & User Profile) |
| **Poojani** | Conversational AI Interface (AI Assistant) |
| **Osal** | Dynamic Roadmap Engine |
| **Rashmi** | Document Vault & Auto-fill Forms |
| **Sahas** | Vector Database & RAG Pipeline |

---

# 🌟 Why CivicSync AI?

Government services should be understandable by everyone—not just legal experts.

CivicSync AI combines **Generative AI**, **Retrieval-Augmented Generation (RAG)**, and **secure cloud technologies** to transform complex government regulations into simple, actionable guidance. By making legal information accessible, trustworthy, and personalized, CivicSync empowers Sri Lankan citizens to confidently navigate administrative processes while saving time and reducing confusion.

---

<p align="center">
Built with ❤️ to make Sri Lankan government services more accessible through Artificial Intelligence.
</p>

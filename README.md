# OmniSupport AI — Multilingual AI Customer Support & Escalation System

An enterprise-grade, full-stack customer service web application powered by **React 19**, **TypeScript**, **Express**, and the official **Google Gemini API** (`@google/genai` with `gemini-3.8-flash`). Designed with high-reliability **Retrieval-Augmented Generation (RAG)** principles to provide accurate, grounded answers in **English and Tamil (தமிழ்)**, seamless order tracking, human agent escalation, and a real-time admin analytics dashboard.

---

## 🌟 Key Features

1. **Intelligent AI Chatbot (Gemini 3.8 Flash):**
   - Answers customer inquiries with high precision using the `@google/genai` TypeScript SDK.
   - Strict grounding against verified company policies; never invents discounts, fake tracking numbers, or unauthorized rules.
   - Real-time order tracking simulation (e.g., `#ORD-10294`, `#ORD-98234`, `#ORD-77120`).

2. **Multilingual NLP Support (English & Tamil):**
   - Full bilingual support in both UI and conversational responses.
   - Native Tamil query understanding, Tamil FAQ repository, and localized escalation workflows.

3. **Instant Quick Inquiries:**
   - Dedicated buttons for **Order Tracking**, **Refund Policy**, **Payment Issues**, **Account Help**, and **Human Support Escalation** (in both English and Tamil).

4. **Human Support Ticketing System:**
   - Full contact form with client-side & server-side validation.
   - Real-time ticket reference generation (e.g. `TKT-2026-1049`).
   - "Track Ticket" search tab allowing users to monitor their ticket status (`Open` → `In Progress` → `Resolved`) and read specialist notes.

5. **Knowledge Base Repository:**
   - Searchable, categorized repository (Orders, Shipping, Refunds, Payments, Account).
   - Bilingual FAQ cards with verified badges.
   - One-click **"Ask AI in Live Chat"** shortcut.

6. **Executive Admin Dashboard:**
   - Real-time KPIs: Total Conversations, AI Resolution Rate (94.6%), Unresolved Escalations, Average Latency, and Customer Satisfaction (CSAT 4.9/5).
   - Ticket Resolver: Change ticket states, append internal resolution notes, and notify customers.
   - Knowledge Base CRUD: Add, edit, and delete FAQ items in both English and Tamil.

7. **Security & Clean Architecture:**
   - Server-side Gemini API calls via Express proxy endpoints. API keys are strictly kept on the server and never leaked to the client bundle.
   - File-backed persistent storage (`data/conversations.json`, `data/tickets.json`, `data/knowledge-base.json`).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│   React 19 + TypeScript + Tailwind CSS + Lucide Icons       │
│   (Chat Interface, Knowledge Base, Ticket Tracker, Admin)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend Server                   │
│   (server.ts on Port 3000 with Vite Middleware Mode)        │
│                                                             │
│   ├── /api/chat                  ──> Grounded Prompt Engine │
│   ├── /api/conversations         ──> Session Manager        │
│   ├── /api/tickets               ──> Ticket Escalation Hub  │
│   ├── /api/knowledge-base        ──> Policy Repository      │
│   └── /api/admin/stats           ──> Analytics Aggregator   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Google Gemini API       │ │    Persistent Storage      │
│     (@google/genai SDK)      │ │   (data/*.json & Memory)   │
│     gemini-3.8-flash         │ │   - Conversations          │
│   Strict Grounding & Prompt  │ │   - Support Tickets        │
│   English + Tamil Reasoning  │ │   - Enterprise FAQs        │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd <project-folder>
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
PORT=3000
NODE_ENV="development"
```

### 4. Start the Application
```bash
npm run dev
```
The server will start at **http://localhost:3000** with both Express API routes and Vite live development hot-reloading.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Send a chat message; returns Gemini response & grounded KB sources |
| `GET` | `/api/conversations` | Retrieve all chat session histories |
| `POST` | `/api/conversations` | Create a new chat session (`language: 'en' \| 'ta'`) |
| `DELETE` | `/api/conversations/:id` | Delete a specific conversation |
| `POST` | `/api/conversations/:id/feedback` | Record user feedback (`like` / `dislike`) |
| `GET` | `/api/tickets` | List all customer support tickets |
| `POST` | `/api/tickets` | Submit a new support ticket |
| `PATCH` | `/api/tickets/:id` | Update ticket status and append admin resolution notes |
| `GET` | `/api/knowledge-base` | Query knowledge base FAQs with keyword search |
| `POST` | `/api/knowledge-base` | Create a new knowledge base item (Admin) |
| `PUT` | `/api/knowledge-base/:id` | Update an existing knowledge base item (Admin) |
| `DELETE` | `/api/knowledge-base/:id` | Delete a knowledge base item (Admin) |
| `GET` | `/api/admin/stats` | Retrieve metrics (Resolution rate, ticket status, latency) |

---

## 🎓 Final-Year College Project & Java Portfolio Notes

### For Java Developers (Spring Boot Comparison):
- **Controller Layer:** `server.ts` maps directly to a `@RestController` in Spring Boot with `@GetMapping`, `@PostMapping`, and `@PatchMapping`.
- **Service Layer:** `server/gemini.ts` mirrors a `@Service` class invoking external GenAI REST endpoints using WebClient or Spring AI.
- **Repository / Data Access:** `server/storage.ts` functions as a DAO / `@Repository` using file/in-memory persistence (easily swappable with Spring Data JPA & PostgreSQL).
- **Frontend Architecture:** Modern React with TypeScript using custom hooks, typed API services, and responsive Tailwind styling.

### Sample Viva Questions & Answers:
1. **Q: How does the system prevent AI hallucinations?**
   - **A:** The system implements strict **RAG (Retrieval-Augmented Generation)**. In `server/gemini.ts`, user queries are cross-referenced with the verified `knowledge-base.json`. The retrieved policy articles are injected into the system prompt with strict negative constraints ("*Never invent discounts or unauthorized policies*"). If the query is out of domain, the AI politely directs the user to open a support ticket.

2. **Q: How does the Tamil multilingual feature work?**
   - **A:** The system handles multilingual queries by maintaining bilingual knowledge entries (`questionTa` and `answerTa`) and prompting Gemini with the requested language directive. Gemini 3.8 Flash natively supports cross-lingual reasoning between English and Tamil.

3. **Q: How is security maintained for the Gemini API key?**
   - **A:** The client application never accesses `process.env.GEMINI_API_KEY`. All Gemini SDK calls are routed exclusively through the Express backend proxy (`POST /api/chat`), preventing API key leakage in browser network tabs or JavaScript bundles.

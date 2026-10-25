# 🎓 StudyMate AI HUB

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-42b883?style=for-the-badge)](https://vuejs.org/) [![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge)](https://nextjs.org/) [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge)](https://tailwindcss.com/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge)](https://www.postgresql.org/) [![Vercel](https://img.shields.io/badge/Vercel-Deployments-000000?style=for-the-badge)](https://vercel.com)

**StudyMate AI HUB** is a premium, modern academic productivity web application. It transforms raw study materials—textbooks, PDFs, lecture slides, notes, and images—into highly structured, interactive, and optimized learning formats, powered by multiple LLM providers.

<p align="center">
  <img src="/public/images/home.png" width="400" alt="StudyMate AI HUB Landing Page">
</p>

---

## 🌟 Key Features

### 1. 📝 Notes Conversion
Upload lecture slides or text documents and convert them into clean, structured notes. Choose between **Detailed** and **Compact** modes. Generates headlines, summary bullet points, and key takeaways.

### 2. 🗂️ Interactive Flashcards
Convert documents into active-recall flashcard decks. Study them directly in the browser with flipping animations, flag cards as known/unknown, and track study progress.

### 3. 🧠 Collapsible Mind Maps
Visualize complex topics through interactive, zoomable, and collapsible **Left-to-Right** mind maps (powered by React Flow & Dagre). Only displays the root and level 1 nodes on start, allowing users to expand child nodes selectively.

### 4. ✍️ MCQ Practice Quizzes
Test your knowledge with AI-generated quizzes. Supports difficulty selections (Easy, Medium, Hard), custom question count, timed challenges (countdown per question), and instant detailed explanations for every answer.

### 5. 📑 Revision Cheat Sheets
Generate highly dense, exam-focused cheat sheets from your notes for last-minute prep.

### 6. 🕒 Category-Filtered History Sidebar
- Exposes a sidebar showing your past study files
- **Feature-Specific Filtering**: The history is automatically filtered; e.g., viewing Notes shows note conversion history
- **Hover Actions**: Hovering over an item reveals **View PDF**, **Download PDF**, and **Delete File** actions
- **Secure streaming**: Fetches and renders converted outputs as PDFs on the fly using `@react-pdf/renderer`
- **Clean Deletion**: Safely deletes both database records (Neon DB cascade) and physical files in cloud storage

### 7. 🎨 Personalized Color Themes
- Choose from presets: **Warm Light** (default), **Pure Light** (Sky Blue), **Warm Dark**, **Slate Dark**, **Midnight Ambient**, **Forest Ambient**
- **Custom Theme Designer**: Live color pickers let you customize Accent, Background, Card, Text, Muted Text, and Border variables
- Saved instantly to `localStorage`

---

## 🤖 LLM Provider Routing (Round Robin)

### Model Interleaving Strategy

The application implements a **round-robin interleaving** strategy across three LLM providers to ensure balanced load distribution and fallback resilience:

| Pool Position | Provider | Model Count |
| :--- | :--- | :--- |
| **0, 3** | **NVIDIA** | 2 models |
| **1, 5, 7, 8** | **OpenRouter** | 4 models |
| **2, 4, 6, 9, 10, 11** | **XKiro** | 6 models |

### Model Lists (Reordered for Desired Sequence)

```typescript
// NVIDIA models at pool positions 0, 3
DEFAULT_NVIDIA_MODELS = [..., ..., ..., nvidia-model-1, ..., ..., ..., nvidia-model-2, ...]

// OpenRouter models at pool positions 1, 5, 7, 8  
DEFAULT_OPENROUTER_MODELS = [..., openrouter-model-1, ..., ..., ..., openrouter-model-2, ..., openrouter-model-3, ..., openrouter-model-4]

// XKiro models at pool positions 2, 4, 6, 9, 10, 11
DEFAULT_XKIRO_MODELS = [..., xkiro-model-1, ..., xkiro-model-2, ..., xkiro-model-3, ..., xkiro-model-4, ..., xkiro-model-5, xkiro-model-6]
```

### How It Works

1. **Round-robin selection**: Requests are distributed across providers in a fixed interleaved sequence
2. **Error handling with model IDs**: When errors occur, the system captures and displays the specific model ID responsible (e.g., `xkiro: qwen/qwen-3.8-max:free`)
3. **CSS styling by error type**:
   - 🟧 **Orange** (`bg-orange-500/10 border-orange-500 text-orange-400`): `RATE_LIMIT` / `UNAVAILABLE`
   - 🟥 **Red** (`bg-red-500/10 border-red-500 text-red-400`): `AUTH_ERROR` / `SERVER_ERROR`
   - 🟦 **Gray** (`bg-gray-500/10 border-gray-300 text-gray-400`): `NETWORK_ERROR` / `UNKNOWN`

### Error Types & Display

```typescript
enum LLMErrorType {
  RATE_LIMIT = "rate_limit",
  UNAVAILABLE = "unavailable",
  AUTH_ERROR = "auth_error",
  SERVER_ERROR = "server_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}
```

Error panels show the model ID prominently, enabling quick debugging and provider attribution.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
*   **Styling & UI**: Tailwind CSS v4, Base UI, Lucide Icons, glassmorphism aesthetics
*   **Database & ORM**: PostgreSQL (hosted on **Neon.tech**) mapped via **Drizzle ORM**
*   **Authentication**: NextAuth.js (supporting credentials and Google OAuth)
*   **AI Integration**: Multiple LLM providers (NVIDIA, OpenRouter, XKiro) with round-robin routing
*   **Mind Map rendering**: React Flow, Dagre Graph Layouting Engine
*   **Document Generation**: `@react-pdf/renderer` for dynamic server-side PDF compilation
*   **Storage**: Vercel Blob Storage (Private) with a local storage fallback
*   **Error Tracking**: Custom `LLMErrorType` enum with colored UI feedback and model ID display

---

## 📋 Prerequisites

Before running the application, make sure you have:

*   **Node.js** (v18.0.0 or higher)
*   **npm**, **yarn**, or **pnpm** package manager
*   A **PostgreSQL** database (e.g., a free database instance on [Neon.tech](https://neon.tech/))
*   API keys for **LLM providers** (NVIDIA, OpenRouter, XKiro) configured in your Profile settings

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of your project and populate it with the following environment variables:

```env
# Database connection string (e.g., Neon.tech)
DATABASE_URL="postgres://username:password@hostname/dbname?sslmode=require"

# NextAuth authentication configurations
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_jwt_signing_secret"

# Cryptography encryption key (used for encrypting user API keys in the database)
ENCRYPTION_SECRET="32_character_cryptographic_secret_key"

# Vercel Blob Storage token (optional, falls back to public/uploads directory if omitted)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

# LLM Provider API Keys
NVIDIA_API_KEY="your_nvidia_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"  
XKIRO_API_KEY="your_xkiro_api_key"

# Google OAuth credentials (optional, for signing in with Google)
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"

# SMTP configurations (optional, for password resets)
SMTP_PASS="your_smtp_mailbox_password"
```

---

## 🚀 Setup & Local Installation

Follow these steps to set up and run the project locally:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd studymate-ai-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file based on the **Environment Configuration** instructions above.

4. **Sync database schema:**
   Deploy the tables and columns directly to your PostgreSQL database:
   ```bash
   npx drizzle-kit push
   ```

5. **Start local development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📖 How to Use

1.  **Register a New Account** or sign in.
2.  Navigate to the **Profile** section and enter your **LLM API Keys** in the API Key Manager card (this allows you to authorize AI operations under your own usage).
3.  Choose a learning tool from the Home or Navigation bar (e.g., Notes, Flashcards, MCQ Quiz, Mind Map).
4.  Upload your study material (a textbook PDF, image, docx, slide deck, or text file).
5.  Click the **Generate** button, wait for the AI to complete using the round-robin model routing, and enjoy your interactive structured layout!
6.  Export your results to PDF or PNG formats, or find them listed category-by-category in the history sidebar for later retrieval.

---

## 📡 Live Demo

- **Production**: https://studymate-ai-hub.vercel.app
- **Current Build**: https://studymate-ai-loejzytsk-real-ds.vercel.app

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ for the academic community**
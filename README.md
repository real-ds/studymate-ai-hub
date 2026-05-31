# 🎓 StudyMate AI HUB

StudyMate AI HUB is a premium, modern academic productivity web application. It transforms raw study materials—textbooks, PDFs, lecture slides, notes, and images—into highly structured, interactive, and optimized learning formats, powered by Gemini AI.

---

## 📸 Application Screenshots

### Home Page
![StudyMate AI HUB Landing Page](/public/images/home.png)

### Key Features and Services
![StudyMate AI HUB Feature Categories](/public/images/features.png)

---

## ✨ Features Walkthrough

### 1. 📝 Notes Conversion
Upload your lecture slides or text documents, and convert them into clean, structured notes. Choose between **Detailed** and **Compact** modes. Generates headlines, summary bullet points, and key takeaways.

### 2. 🗂️ Interactive Flashcards
Convert documents into active-recall flashcard decks. Study them directly in the browser with flipping animations, flag cards as known/unknown, and track study progress.

### 3. 🧠 Collapsible Mind Maps
Visualize complex topics through interactive, zoomable, and collapsible **Left-to-Right** mind maps (powered by React Flow & Dagre). Only displays the root and level 1 nodes on start, allowing users to expand child nodes selectively. Focus and zoom in smoothly on selection.

### 4. ✍️ MCQ Practice Quizzes
Test your knowledge with AI-generated quizzes. Supports difficulty selections (Easy, Medium, Hard), custom question count, timed challenges (countdown per question), and instant detailed explanations for every answer.

### 5. 📑 Revision Cheat Sheets
Generate highly dense, exam-focused cheat sheets from your notes for last-minute prep.

### 6. 🕒 Category-Filtered History Sidebar
*   Exposes a sidebar showing your past study files.
*   **Feature-Specific Filtering**: The history is automatically filtered; e.g., viewing Notes shows note conversion history, viewing Mind Maps shows mind map history.
*   **Hover Actions**: Hovering over an item reveals **View PDF** (in-browser view), **Download PDF**, and **Delete File** actions.
*   **Secure streaming**: Fetches and renders converted outputs as PDFs on the fly using `@react-pdf/renderer` to bypass 403 Forbidden cloud storage errors.
*   **Clean Deletion**: Safely deletes both database records (Neon DB cascade) and physical files in cloud storage (Vercel Blob / local fallback).

### 7. 🎨 Personalized Color Themes
Configure your workspace theme in your Profile Card:
*   Choose from presets: **Warm Light** (default), **Pure Light** (Sky Blue), **Warm Dark**, **Slate Dark**, **Midnight Ambient**, or **Forest Ambient**.
*   **Custom Theme Designer**: Live color pickers let you customize Accent, Background, Card, Text, Muted Text, and Border variables to immediately override styling application-wide. Saved instantly to `localStorage`.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
*   **Styling & UI**: Tailwind CSS v4, Base UI, Lucide Icons, glassmorphism aesthetics
*   **Database & ORM**: PostgreSQL (hosted on **Neon.tech**) mapped via **Drizzle ORM**
*   **Authentication**: NextAuth.js (supporting credentials and Google OAuth)
*   **AI Integration**: Google Gemini API via `@google/generative-ai` SDK
*   **Mind Map rendering**: React Flow, Dagre Graph Layouting Engine
*   **Document Generation**: `@react-pdf/renderer` for dynamic server-side PDF compilation
*   **Storage**: Vercel Blob Storage (Private) with a local storage fallback

---

## 📋 Prerequisites

Before running the application, make sure you have:
*   **Node.js** (v18.0.0 or higher)
*   **npm**, **yarn**, or **pnpm** package manager
*   A **PostgreSQL** database (e.g., a free database instance on [Neon.tech](https://neon.tech/))
*   A **Google Gemini API Key** (each user configures this in their Profile settings card to authorize AI generation)

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
2.  Navigate to the **Profile** section and enter your **Gemini API Key** in the API Key Manager card (this allows you to authorize AI operations under your own usage).
3.  Choose a learning tool from the Home or Navigation bar (e.g., Notes, Flashcards, MCQ Quiz, Mind Map).
4.  Upload your study material (a textbook PDF, image, docx, slide deck, or text file).
5.  Click the **Generate** button, wait for the AI to complete, and enjoy your interactive structured layout!
6.  Export your results to PDF or PNG formats, or find them listed category-by-category in the history sidebar for later retrieval.

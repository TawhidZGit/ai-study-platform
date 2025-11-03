# AI Study Platform

An AI-powered study platform that helps students learn more efficiently by generating summaries/notes, quizzes, and flashcards from uploaded documents.

## Features

- 📄 **Document Upload** - Upload PDFs and text files
- 📝 **AI Summaries** - Generate TL;DR, key points, and detailed notes
- ❓ **Quiz Generation** - AI creates custom quizzes from uploaded documents
- 🎴 **Flashcards** - Automatic flashcard generation for spaced repetition
- 📊 **Progress Tracking** - Track your study sessions and improvement

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- React Router
- Axios

**Backend:**
- Node.js + Express
- PostgreSQL (Supabase)
- JWT Authentication
- Google Gemini AI

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (or Supabase account)
- Google Gemini API key

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Run the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## Database Setup

Run the SQL commands in `backend/config/setup.sql` in your PostgreSQL database to create the necessary tables.

## Project Status

🚧 **In Development** - This project is actively being built as a portfolio piece.

## License

MIT
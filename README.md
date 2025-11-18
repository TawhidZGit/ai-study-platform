# AI Study Platform

An AI-powered study platform that helps students learn more efficiently by generating summaries/notes, quizzes, and flashcards from uploaded documents.

## Features

- 📄 **Document Upload** - Upload PDFs and text files
- 📝 **AI Summaries** - Generate TL;DR, key points, and detailed notes
- ❓ **Quiz Generation** - AI creates custom quizzes from uploaded documents
- 🎴 **Flashcards** - Automatic flashcard generation for spaced repetition
- 📊 **Progress Tracking** - Track your study sessions and improvement
- 🔥 **Study Streaks** - Daily streak tracking to build study habits
- 🏆 **Achievements** - Unlock badges for milestones
- 📈 **Analytics Dashboard** - Visualize your learning progress

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- React Router
- TipTap (Rich Text Editor)
- react-resizable-panels
- Axios
- Recharts

**Backend:**
- Node.js + Express
- PostgreSQL (Supabase)
- JWT Authentication
- Google Gemini AI
- Multer (file uploads)
- pdf-parse

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (or Supabase account)
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-study-platform.git
cd ai-study-platform
```

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
## Database Setup

Run the SQL commands in `backend/config/setup.sql` in your PostgreSQL database to create the necessary tables.

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

4. **Access the application**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## 📖 Usage

1. **Register/Login** - Create an account or log in
2. **Upload Documents** - Upload PDFs or text files
3. **Generate Content**:
   - Click "Generate Summary" for AI-powered notes
   - Click "Create Quiz" for practice questions
   - Click "Make Flashcards" for spaced repetition
4. **Track Progress** - View statistics and achievements
5. **Build Streaks** - Study daily to maintain your streak

## ✨ Features

### 📁 **Project-Based Organization**
- Create unlimited projects for different subjects/topics
- Color-coded projects for easy identification
- Track sources and notes per project

### 🖥️ **Resizable Workspace Layout**
- **Sources Panel**: Upload and manage PDFs and text files
- **Chat Panel**: Conversational AI with 4 modes (Study, Quiz, Explain, Summarize)
- **Notes Panel**: Rich text editor with auto-save
- **AI Tools**: Generate quizzes, flashcards, and summaries
- Collapsible panels with icon docks

### 🤖 **AI-Powered Features**
- **Context-Aware Chat**: AI references your uploaded sources
- **Quiz Generation**: Multiple-choice questions with explanations
- **Flashcard Creation**: Front/back cards for studying
- **Smart Summaries**: TL;DR, key points, detailed notes, ELI5
- **Multiple Chat Modes**: Study tutor, quiz master, explainer, summarizer

### 📝 **Rich Text Notes**
- Full-featured text editor
- Auto-save functionality
- Bold, italic, headings, lists
- Organize notes per project

### AI Summaries
- **TL;DR**: Quick 2-3 sentence overview
- **Key Points**: 5-8 main takeaways
- **Detailed Notes**: Comprehensive study material
- **ELI5**: Simplified explanations

### Spaced Repetition
Uses the SM-2 algorithm to optimize flashcard review timing:
- **Again**: Review in 1 day
- **Hard**: Review in 2-3 days
- **Good**: Review in 4-7 days
- **Easy**: Review in 7+ days

### Achievements System
Unlock badges for:
- Uploading documents
- Taking quizzes
- Maintaining study streaks
- Reviewing flashcards

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- SQL injection prevention
- Protected API routes
- Secure file upload handling

## 📸 Screenshots

[Insert screenshots of workspace]

## Project Status

🚧 **In Development** - This project is actively being built as a portfolio piece.

## 🤝 Contributing

Want to improve AI Study Platform?. Feel free to fork and modify for your own use!
Feel free to contribute! Pull requests are welcome.

## License

MIT License - See LICENSE file for details
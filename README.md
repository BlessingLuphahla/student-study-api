# Personal Study App (MERN + AI)

A full-stack study assistant that helps students organize notes, auto-generate practice exams with AI, and track weekly reading progress in one place.

## Why this app exists

As a student, it is easy to lose track of PDFs, images, and handwritten notes, and even harder to know whether exam prep is on schedule. This app centralizes study materials, turns them into practice exams, and shows clear progress so exam preparation becomes more structured and less stressful.

## Key features

- Upload study materials (PDF, images, text) and keep them organized.
- Auto-generate multiple-choice exams from uploaded content using Google Gemini AI.
- Take timed exams with automatic submission and instant scoring.
- Review detailed results, including wrong answers, explanations, and weak topic areas.
- Track weekly reading with a simple Mon–Sun checklist and visual progress bar.

## Tech stack

- **Frontend:** React, Context API, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose ODM
- **Database:** MongoDB (materials, questions, exams, results)
- **Storage:** Local file system (configurable path via environment variable)
- **AI:** Google Gemini API for question generation
- **File Handling:** Multer for server-side file uploads

## Environment Setup

### Prerequisites

- Node.js v20.12.2 or higher
- MongoDB connection string
- Google Gemini API key
- A local directory for file storage (or use default `./uploads`)

### Environment Variables (.env)

Copy `.env.example` to `.env` and configure the following variables:

```env
# MongoDB Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
# Get from: MongoDB Atlas (https://cloud.mongodb.com)
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_db_name

# Google Gemini API Key
# Get from: https://ai.google.dev/
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 4000)
PORT=4000

# Local File Storage Path
# This is where uploaded PDFs, images, and documents will be stored
# Examples:
#   - Windows: C:\Users\YourUsername\Documents\study-files
#   - Linux/Mac: /home/username/Documents/study-files
#   - Relative path: ./uploads
STORAGE_PATH=./uploads
```

### File Upload Configuration

The application uses **Multer** for handling file uploads locally instead of cloud storage.

**Allowed File Types:**
- PDF (`application/pdf`)
- Images: JPEG, PNG, GIF
- Documents: Word (.doc, .docx), Excel (.xls, .xlsx)
- Text files (.txt)

**Upload Limits:**
- Maximum file size: 50MB
- Maximum files per request: 1 (configurable in middleware)

**Storage Location:**
- Files are stored in the directory specified by `STORAGE_PATH` environment variable
- Default: `./uploads` (relative to project root)
- Files are renamed with timestamps to prevent conflicts

## How it works (high level)

The Express backend provides REST APIs for:
1. **Uploading study materials** - stores files locally and metadata in MongoDB
2. **Generating exams** - calls Google Gemini AI to create multiple-choice questions from content
3. **Taking exams** - records answers and automatically scores results
4. **Reviewing results** - provides detailed feedback on weak areas

The frontend (React) communicates with these APIs to handle user interactions and display results.

## Getting started (local setup)

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd student-study-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration:
   - MongoDB URI from MongoDB Atlas
   - Gemini API key from Google AI
   - Storage path for file uploads

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The API will run on `http://localhost:4000`

5. **Verify the server is running:**
   ```bash
   GET http://localhost:4000/health
   ```
   Response: `{ "status": "API is running" }`

## API Endpoints

### Materials
- `POST /api/upload` - Upload study material with optional file
- `GET /api/materials` - Get all materials (with pagination)
- `GET /api/materials/:id` - Get specific material
- `DELETE /api/materials/:id` - Delete material and associated file

### Exams
- `POST /api/exam/exams/generate` - Generate exam from material using AI

### Results
- `POST /api/results` - Submit exam result
- `GET /api/results` - Get all results (with pagination)
- `GET /api/results/stats/overview` - Get statistics
- `GET /api/results/:id` - Get specific result
- `DELETE /api/results/:id` - Delete result

## What this project demonstrates

- Building a real full-stack product that solves a practical study problem
- Integrating an external AI API (Gemini) securely for question generation
- Handling local file uploads with proper validation and error handling
- RESTful API design with comprehensive error handling
- MongoDB data modeling for complex relationships


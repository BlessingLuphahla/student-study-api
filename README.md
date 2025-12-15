# Personal Study App (MERN + AI)

A full-stack study assistant that helps students organize notes, auto-generate practice exams with AI, and track weekly reading progress in one place. [file:1]

## Why this app exists

As a student, it is easy to lose track of PDFs, images, and handwritten notes, and even harder to know whether exam prep is on schedule. [file:1] This app centralizes study materials, turns them into practice exams, and shows clear progress so exam preparation becomes more structured and less stressful. [file:1]

## Key features

- Upload study materials (PDF, images, text) and keep them organized per user. [file:1]
- Auto-generate multiple-choice exams from uploaded content using Google Gemini AI. [file:1]
- Take timed exams with automatic submission and instant scoring. [file:1]
- Review detailed results, including wrong answers, explanations, and weak topic areas. [file:1]
- Track weekly reading with a simple Mon–Sun checklist and visual progress bar. [file:1]

## Tech stack

- **Frontend:** React, Context API, Tailwind CSS. [file:1]
- **Backend:** Node.js, Express, JWT authentication, Gemini API integration. [file:1]
- **Database:** MongoDB Atlas (users, materials, questions, exams, results, schedules). [file:1]
- **Storage:** Cloudinary for images and PDFs. [file:1]
- **Deployment:** Vercel (frontend) and Render (backend). [file:1]

## How it works (high level)

The frontend React app handles authentication, file uploads, exam taking, results pages, and the weekly tracker UI. [file:1] The Express API receives uploads, stores metadata in MongoDB, calls Gemini to generate questions, and saves exams and results so users can review performance over time. [file:1]

## Getting started (local setup)

1. Clone the repository and install dependencies in both `/client` and `/server`. [file:1]  
2. Create `.env` files for backend with MongoDB URI, JWT secret, Gemini API key, and Cloudinary credentials. [file:1]  
3. Start the backend server, then run the React dev server, and open the app in your browser. [file:1]

## What this project demonstrates

- Building a real full-stack product that solves a personal study problem, not just a tutorial CRUD app. [file:1]  
- Integrating an external AI API (Gemini) securely for question generation. [file:1]  
- Handling file uploads to cloud storage, JWT-based auth, and a multi-collection MongoDB data model. [file:1]


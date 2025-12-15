const axios = require('axios');
const StudyMaterial = require('../models/StudyMaterial');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const generateExam = async (req, res) => {
  try {
    const { materialId, numQuestions = 5, difficulty = 'medium' } = req.body;

    // Validate input
    if (!materialId || !isValidObjectId(materialId)) {
      return res.status(400).json({ success: false, error: 'Invalid material ID' });
    }

    const numQuestionsInt = Math.min(20, Math.max(1, parseInt(numQuestions) || 5));
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Invalid difficulty level' });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY not configured' });
    }

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Study material not found' });
    }

    const prompt = `
Based on this study material, generate ${numQuestionsInt} multiple-choice questions at ${difficulty} difficulty level.
Each question must have exactly 4 options and specify the correct option index (0-3).
Return ONLY valid JSON array:
[
  {
    "questionText": "...",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "...",
    "topic": "topic name"
  }
]
Study material:
${material.textContent || material.content || material.title}
    `.trim();

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
        timeout: 30000
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let parsedQuestions;

    try {
      parsedQuestions = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response:', rawText);
      return res.status(500).json({ success: false, error: 'Failed to parse generated questions' });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return res.status(500).json({ success: false, error: 'No valid questions generated' });
    }

    // Validate and filter parsed questions
    const validQuestions = parsedQuestions.filter(q => 
      q.questionText && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer <= 3
    );

    if (validQuestions.length === 0) {
      return res.status(500).json({ success: false, error: 'Generated questions failed validation' });
    }

    const questionDocs = await Question.insertMany(
      validQuestions.map(q => ({
        materialId: material._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        topic: q.topic || '',
        generatedBy: 'gemini'
      }))
    );

    const exam = await Exam.create({
      materialId: material._id,
      questions: questionDocs.map(q => q._id),
      totalQuestions: questionDocs.length,
      timeLimit: 30,
      difficulty
    });

    res.status(201).json({
      success: true,
      message: 'Exam generated successfully',
      data: {
        examId: exam._id,
        materialId: material._id,
        timeLimit: exam.timeLimit,
        difficulty: exam.difficulty,
        totalQuestions: questionDocs.length,
        questions: questionDocs.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options
        }))
      }
    });
  } catch (err) {
    console.error('Exam generation error:', err);

    if (err.response?.status === 400) {
      return res.status(400).json({ success: false, error: 'Invalid request to Gemini API' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ success: false, error: 'Request timeout' });
    }

    res.status(500).json({ success: false, error: 'Could not generate exam' });
  }
};

module.exports = { generateExam };



const axios = require('axios');
const StudyMaterial = require('../models/StudyMaterial');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const generateExam = async (req, res) => {
  try {
    const { materialId, numQuestions = 5, difficulty = 'medium' } = req.body;

    // Validate materialId
    if (!materialId) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required',
        details: 'Please provide a materialId in the request body'
      });
    }

    if (!isValidObjectId(materialId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID format',
        details: 'The provided materialId is not a valid MongoDB ObjectId'
      });
    }

    // Validate numQuestions
    const numQuestionsInt = parseInt(numQuestions);
    if (isNaN(numQuestionsInt)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid numQuestions parameter',
        details: 'numQuestions must be a valid number'
      });
    }
    if (numQuestionsInt < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid numQuestions value',
        details: 'numQuestions must be at least 1'
      });
    }
    if (numQuestionsInt > 20) {
      return res.status(400).json({
        success: false,
        error: 'numQuestions exceeds limit',
        details: 'Maximum 20 questions allowed per exam'
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level',
        details: `Difficulty must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API configuration error',
        details: 'GEMINI_API_KEY is not configured on the server'
      });
    }

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Study material not found',
        details: `No material exists with ID: ${materialId}`
      });
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
      return res.status(502).json({
        success: false,
        error: 'AI response parsing failed',
        details: 'The AI generated invalid question format'
      });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        error: 'No questions generated',
        details: 'The AI failed to generate any valid questions'
      });
    }

    // Validate and filter parsed questions
    const validQuestions = parsedQuestions.filter(q => {
      if (!q.questionText || typeof q.questionText !== 'string') return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
      return true;
    });

    if (validQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        error: 'Question validation failed',
        details: 'Generated questions did not meet validation requirements'
      });
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
      return res.status(400).json({
        success: false,
        error: 'AI API request error',
        details: 'The request to the Gemini API was invalid'
      });
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({
        success: false,
        error: 'AI API authentication error',
        details: 'Invalid or expired Gemini API key'
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        details: 'The AI API took too long to respond (30 second timeout)'
      });
    }

    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: 'Unable to connect to Gemini API. Check your internet connection'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Exam generation failed',
      details: 'An unexpected error occurred while generating the exam'
    });
  }
};

module.exports = { generateExam };



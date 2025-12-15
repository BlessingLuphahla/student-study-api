const axios = require('axios');
const StudyMaterial = require('../models/StudyMaterial');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

const generateExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { materialId, numQuestions = 5, difficulty = 'medium' } = req.body;

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    const prompt = `
Based on this study material, generate ${numQuestions} multiple-choice questions.
Each question must have 4 options and specify the correct option index.
Return ONLY valid JSON: 
[
  {
    "questionText": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "..."
  }
]
Study material:
${material.textContent || material.title}
    `.trim();

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsedQuestions = JSON.parse(rawText);

    const questionDocs = await Question.insertMany(
      parsedQuestions.map(q => ({
        materialId: material._id,
        userId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        generatedBy: 'gemini'
      }))
    );

    const exam = await Exam.create({
      userId,
      questions: questionDocs.map(q => q._id),
      totalQuestions: questionDocs.length,
      timeLimit: 30 
    });

    res.status(201).json({
      examId: exam._id,
      timeLimit: exam.timeLimit,
      questions: questionDocs.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not generate exam' });
  }
};

module.exports = { generateExam };



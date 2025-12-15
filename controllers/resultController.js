// controllers/resultController.js
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// POST /api/results
// Body: { examId, userAnswers: [..], timeTaken }
const createResult = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { examId, userAnswers, timeTaken } = req.body;

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const correctAnswers = exam.questions.map(q => q.correctAnswer);

    let score = 0;
    const weakAreas = [];

    exam.questions.forEach((q, idx) => {
      if (userAnswers[idx] === correctAnswers[idx]) {
        score += 1;
      } else if (q.topic) {
        weakAreas.push(q.topic);
      }
    });

    const percentage = (score / exam.totalQuestions) * 100;

    const result = await ExamResult.create({
      userId,
      examId,
      userAnswers,
      correctAnswers,
      score,
      percentage,
      timeSpent: timeTaken,
      weakAreas
    });

    res.status(201).json({
      score: result.score,
      percentage: result.percentage,
      timeTaken: result.timeSpent,
      weakAreas: result.weakAreas
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not save exam result' });
  }
};

// GET /api/results
const getAllResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await ExamResult.find({ userId }).sort({ completedAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not fetch results' });
  }
};

// GET /api/results/:id
const getResultById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ExamResult.findOne({ _id: id, userId }).populate('examId');
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not fetch result' });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById
};



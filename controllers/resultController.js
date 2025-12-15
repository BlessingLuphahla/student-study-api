const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validate result submission
const validateResultInput = (examId, userAnswers, timeTaken) => {
  const errors = [];
  
  if (!examId || !isValidObjectId(examId)) {
    errors.push('Invalid exam ID');
  }
  if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
    errors.push('User answers must be a non-empty array');
  }
  if (typeof timeTaken !== 'number' || timeTaken < 0) {
    errors.push('Time taken must be a non-negative number');
  }

  return errors;
};

const createResult = async (req, res) => {
  try {
    const { examId, userAnswers, timeTaken } = req.body;

    // Validate input
    const errors = validateResultInput(examId, userAnswers, timeTaken);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    if (userAnswers.length !== exam.questions.length) {
      return res.status(400).json({
        success: false,
        error: `Expected ${exam.questions.length} answers, got ${userAnswers.length}`
      });
    }

    const correctAnswers = exam.questions.map(q => q.correctAnswer);
    let score = 0;
    const weakAreas = [];
    const detailedResults = [];

    exam.questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === correctAnswers[idx];
      if (isCorrect) {
        score += 1;
      } else if (q.topic) {
        weakAreas.push(q.topic);
      }
      detailedResults.push({
        questionId: q._id,
        questionText: q.questionText,
        userAnswer: userAnswers[idx],
        correctAnswer: correctAnswers[idx],
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((score / exam.totalQuestions) * 100);

    const result = await ExamResult.create({
      examId,
      userAnswers,
      correctAnswers,
      score,
      percentage,
      timeSpent: timeTaken,
      weakAreas: [...new Set(weakAreas)] // Remove duplicates
    });

    res.status(201).json({
      success: true,
      message: 'Exam result saved successfully',
      data: {
        resultId: result._id,
        score: result.score,
        totalQuestions: exam.totalQuestions,
        percentage: result.percentage,
        timeTaken: result.timeSpent,
        weakAreas: result.weakAreas,
        detailedResults
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not save exam result' });
  }
};

const getAllResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, minScore } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (minScore) {
      query.percentage = { $gte: Math.min(100, Math.max(0, parseInt(minScore))) };
    }

    const results = await ExamResult.find(query)
      .populate('examId')
      .skip(skip)
      .limit(limitNum)
      .sort({ completedAt: -1 });

    const total = await ExamResult.countDocuments(query);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not fetch results' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid result ID' });
    }

    const result = await ExamResult.findById(id).populate('examId');
    if (!result) {
      return res.status(404).json({ success: false, error: 'Result not found' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not fetch result' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid result ID' });
    }

    const result = await ExamResult.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Result not found' });
    }

    res.status(200).json({ success: true, message: 'Result deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not delete result' });
  }
};

const getStats = async (req, res) => {
  try {
    const results = await ExamResult.find({});
    
    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalExams: 0,
          averageScore: 0,
          averagePercentage: 0,
          bestScore: 0,
          worstScore: 0
        }
      });
    }

    const scores = results.map(r => r.score);
    const percentages = results.map(r => r.percentage);

    res.status(200).json({
      success: true,
      data: {
        totalExams: results.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b) / scores.length * 10) / 10,
        averagePercentage: Math.round(percentages.reduce((a, b) => a + b) / percentages.length),
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        totalTimeSpent: results.reduce((a, b) => a + b.timeSpent, 0)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not fetch statistics' });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  deleteResult,
  getStats
};



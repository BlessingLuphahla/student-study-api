const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validate result submission
const validateResultInput = (examId, userAnswers, timeTaken) => {
  const errors = [];
  
  if (!examId) {
    errors.push({ field: 'examId', message: 'Exam ID is required' });
  } else if (!isValidObjectId(examId)) {
    errors.push({ field: 'examId', message: 'Invalid exam ID format - must be a valid MongoDB ObjectId' });
  }

  if (!Array.isArray(userAnswers)) {
    errors.push({ field: 'userAnswers', message: 'User answers must be an array' });
  } else if (userAnswers.length === 0) {
    errors.push({ field: 'userAnswers', message: 'User answers array cannot be empty' });
  } else if (!userAnswers.every(ans => typeof ans === 'number' && ans >= 0 && ans <= 3)) {
    errors.push({ field: 'userAnswers', message: 'Each answer must be a number between 0-3' });
  }

  if (typeof timeTaken !== 'number') {
    errors.push({ field: 'timeTaken', message: 'Time taken must be a number' });
  } else if (timeTaken < 0) {
    errors.push({ field: 'timeTaken', message: 'Time taken cannot be negative' });
  }

  return errors;
};

const createResult = async (req, res) => {
  try {
    const { examId, userAnswers, timeTaken } = req.body;

    // Validate input
    const errors = validateResultInput(examId, userAnswers, timeTaken);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
      });
    }

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
        details: `No exam exists with ID: ${examId}`
      });
    }

    if (userAnswers.length !== exam.questions.length) {
      return res.status(400).json({
        success: false,
        error: 'Answer count mismatch',
        details: `Expected ${exam.questions.length} answers, but received ${userAnswers.length}`
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
      weakAreas: [...new Set(weakAreas)]
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
    console.error('Create result error:', err);

    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Database validation failed',
        validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save exam result',
      details: 'An unexpected error occurred while saving the result'
    });
  }
};

const getAllResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, minScore } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters',
        details: 'page and limit must be valid numbers'
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (minScore !== undefined) {
      const scoreNum = parseInt(minScore);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid minScore parameter',
          details: 'minScore must be a number between 0 and 100'
        });
      }
      query.percentage = { $gte: scoreNum };
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
    console.error('Get all results error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch results',
      details: 'An unexpected error occurred while retrieving results'
    });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Result ID is required',
        details: 'Please provide a valid result ID in the URL'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId'
      });
    }

    const result = await ExamResult.findById(id).populate('examId');
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found',
        details: `No result exists with ID: ${id}`
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch result',
      details: 'An unexpected error occurred while retrieving the result'
    });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Result ID is required',
        details: 'Please provide a valid result ID in the URL'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId'
      });
    }

    const result = await ExamResult.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found',
        details: `No result exists with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully',
      deletedResultId: id
    });
  } catch (err) {
    console.error('Delete result error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete result',
      details: 'An unexpected error occurred while deleting the result'
    });
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
          worstScore: 0,
          totalTimeSpent: 0,
          message: 'No exam results yet'
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
    console.error('Get stats error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: 'An unexpected error occurred while calculating statistics'
    });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  deleteResult,
  getStats
};

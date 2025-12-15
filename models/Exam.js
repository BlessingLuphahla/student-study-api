const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    timeLimit: {
      type: Number,
      required: true,
      default: 30
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);



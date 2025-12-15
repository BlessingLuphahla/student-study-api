const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true
    },
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 4,
        message: 'Question must have exactly 4 options'
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    generatedBy: {
      type: String,
      default: 'gemini'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);


const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },
    userAnswers: {
      type: [Number],
      required: true
    },
    correctAnswers: {
      type: [Number],
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    weakAreas: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamResult", examResultSchema);



// models/ExamResult.js
const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userAnswers: { type: [Number], required: true },
  correctAnswers: { type: [Number], required: true },
  score: { type: Number, required: true }, // e.g. 3
  percentage: { type: Number, required: true }, // e.g. 60
  timeSpent: { type: Number, required: true }, // minutes
  completedAt: { type: Date, default: Date.now },
  weakAreas: { type: [String], default: [] }, // topics user got wrong
});

module.exports = mongoose.model("ExamResult", examResultSchema);



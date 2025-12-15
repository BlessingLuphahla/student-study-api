const mongoose = require('mongoose');

const Exam = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    content: {
      type: String,     
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', Exam);



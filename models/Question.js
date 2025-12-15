const mongoose = require('mongoose');

const Question = new mongoose.Schema(
  {
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

module.exports = mongoose.model('Question', Question);


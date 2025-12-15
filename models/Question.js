const mongoose = require('mongoose');

const Question = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // which user owns this material
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

module.exports = mongoose.model('Question', Question);


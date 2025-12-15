const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    subject: {
      type: String,
      trim: true,
      required: true
    },
    content: {
      type: String,
      required: true,
      minlength: 10
    },
    textContent: {
      type: String
    },
    description: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);

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
    // File storage fields - support multiple files
    files: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number, // in bytes
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Legacy single file field (for backwards compatibility)
    file: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);

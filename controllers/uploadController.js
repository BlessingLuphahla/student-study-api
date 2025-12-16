const StudyMaterial = require('../models/StudyMaterial');
const { deleteFile } = require('../middleware/uploadMiddleware');

// Validate input
const validateMaterialInput = (title, subject, content) => {
  const errors = [];
  
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
    errors.push('Subject must be at least 2 characters long');
  }
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    errors.push('Content must be at least 10 characters long');
  }

  return errors;
};

// Create material with optional file upload
const createMaterial = async (req, res) => {
  try {
    const { title, subject, content, description } = req.body;

    // Validate input
    const errors = validateMaterialInput(title, subject, content);
    if (errors.length > 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return res.status(400).json({ success: false, errors });
    }

    const materialData = {
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      textContent: content.trim(),
      description: description ? description.trim() : ''
    };

    // Add file information if file was uploaded
    if (req.file) {
      materialData.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const material = await StudyMaterial.create(materialData);

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material
    });
  } catch (err) {
    console.error(err);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({ success: false, error: 'Could not create material' });
  }
};

// Delete material and associated file
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Delete associated file if it exists
    if (material.file && material.file.filename) {
      deleteFile(material.file.filename);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Material and associated file deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not delete material' });
  }
};

module.exports = { createMaterial, deleteMaterial };


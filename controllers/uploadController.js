const StudyMaterial = require('../models/StudyMaterial');

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

const createMaterial = async (req, res) => {
  try {
    const { title, subject, content, description } = req.body;

    // Validate input
    const errors = validateMaterialInput(title, subject, content);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const material = await StudyMaterial.create({
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim(),
      textContent: content.trim(),
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material
    });
  } catch (err) {
    console.error(err);
    
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

module.exports = { createMaterial };


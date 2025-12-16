const StudyMaterial = require('../models/StudyMaterial');
const { deleteFile } = require('../middleware/uploadMiddleware');

// Validate input
const validateMaterialInput = (title, subject, content) => {
  const errors = [];
  
  if (!title) {
    errors.push('Title is required');
  } else if (typeof title !== 'string') {
    errors.push('Title must be a string');
  } else if (title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (title.trim().length < 3) {
    errors.push(`Title must be at least 3 characters long (currently ${title.trim().length})`);
  } else if (title.trim().length > 200) {
    errors.push(`Title must not exceed 200 characters (currently ${title.trim().length})`);
  }

  if (!subject) {
    errors.push('Subject is required');
  } else if (typeof subject !== 'string') {
    errors.push('Subject must be a string');
  } else if (subject.trim().length === 0) {
    errors.push('Subject cannot be empty');
  } else if (subject.trim().length < 2) {
    errors.push(`Subject must be at least 2 characters long (currently ${subject.trim().length})`);
  }

  if (!content) {
    errors.push('Content is required');
  } else if (typeof content !== 'string') {
    errors.push('Content must be a string');
  } else if (content.trim().length === 0) {
    errors.push('Content cannot be empty');
  } else if (content.trim().length < 10) {
    errors.push(`Content must be at least 10 characters long (currently ${content.trim().length})`);
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
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
      });
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
    console.error('Create material error:', err);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Database validation failed',
        validationErrors
      });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `Duplicate entry`,
        details: `A material with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create material',
      details: 'An unexpected error occurred while saving the material to the database'
    });
  }
};

// Delete material and associated file
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required',
        details: 'Please provide a valid material ID in the URL'
      });
    }

    const material = await StudyMaterial.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
        details: `No material exists with ID: ${id}`
      });
    }

    // Delete associated file if it exists
    if (material.file && material.file.filename) {
      const deleteSuccess = deleteFile(material.file.filename);
      if (!deleteSuccess) {
        console.warn(`Warning: Could not delete file ${material.file.filename} from storage`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Material and associated file deleted successfully',
      deletedMaterialId: id
    });
  } catch (err) {
    console.error('Delete material error:', err);

    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete material',
      details: 'An unexpected error occurred while deleting the material'
    });

  }
};

module.exports = {
  createMaterial,
  deleteMaterial
};
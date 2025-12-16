const StudyMaterial = require("../models/StudyMaterial");
const mongoose = require("mongoose");

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all materials with pagination
const getAllMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    
    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters',
        details: 'page and limit must be valid numbers'
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const query = subject ? { subject: { $regex: subject, $options: "i" } } : {};

    const materials = await StudyMaterial.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await StudyMaterial.countDocuments(query);

    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Get all materials error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch materials',
      details: 'An unexpected error occurred while retrieving materials'
    });
  }
};

// Get material by ID
const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required',
        details: 'Please provide a valid material ID in the URL'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId'
      });
    }

    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
        details: `No material exists with ID: ${id}`
      });
    }

    res.status(200).json({ success: true, data: material });
  } catch (err) {
    console.error('Get material error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch material',
      details: 'An unexpected error occurred while retrieving the material'
    });
  }
};

// Delete material
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId'
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

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
      deletedMaterialId: id
    });
  } catch (err) {
    console.error('Delete material error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete material',
      details: 'An unexpected error occurred while deleting the material'
    });
  }
};

module.exports = { getAllMaterials, getMaterial, deleteMaterial };

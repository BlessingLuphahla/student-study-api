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

    // map files to publicly accessible URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const mapped = materials.map(m => {
      const obj = m.toObject();
      obj.images = (m.files || []).map(f => {
        const rel = f.path || f.filename || '';
        const urlPath = rel ? `${baseUrl}/uploads/${rel}` : null;
        return urlPath;
      }).filter(Boolean);
      return obj;
    });

    res.status(200).json({
      success: true,
      data: mapped,
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

    // attach image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const matObj = material.toObject();
    matObj.images = (material.files || []).map(f => {
      const rel = f.path || f.filename || '';
      return rel ? `${baseUrl}/uploads/${rel}` : null;
    }).filter(Boolean);

    res.status(200).json({ success: true, data: matObj });
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

    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
        details: `No material exists with ID: ${id}`
      });
    }

    // Delete associated files from disk
    try {
      const { files } = material;
      if (files && files.length > 0) {
        const { STORAGE_PATH } = require('../middleware/uploadMiddleware');
        const path = require('path');
        const fs = require('fs');

        // delete each file
        for (const f of files) {
          const rel = f.path || f.filename;
          if (!rel) continue;
          const fullPath = path.join(STORAGE_PATH, rel);
          if (fs.existsSync(fullPath)) {
            try { fs.unlinkSync(fullPath); } catch (err) { console.warn('Failed to unlink', fullPath, err); }
          }
        }

        // attempt to remove the containing folder (use first file's folder)
        const firstRel = files[0] && (files[0].path || files[0].filename);
        if (firstRel && firstRel.includes('/')) {
          const folder = firstRel.split('/')[0];
          const folderPath = path.join(STORAGE_PATH, folder);
          if (fs.existsSync(folderPath)) {
            try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch (err) { console.warn('Failed to remove folder', folderPath, err); }
          }
        }
      }
    } catch (fileErr) {
      console.error('Error deleting associated files:', fileErr);
    }

    await StudyMaterial.findByIdAndDelete(id);

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

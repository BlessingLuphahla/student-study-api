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
    console.error(err);
    res.status(500).json({ success: false, error: "Could not fetch materials" });
  }
};

// Get material by ID
const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const material = await StudyMaterial.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, error: "Material not found" });
    }

    res.status(200).json({ success: true, data: material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Could not fetch material" });
  }
};

// Delete material
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const material = await StudyMaterial.findByIdAndDelete(id);

    if (!material) {
      return res.status(404).json({ success: false, error: "Material not found" });
    }

    res.status(200).json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Could not delete material" });
  }
};

module.exports = { getAllMaterials, getMaterial, deleteMaterial };

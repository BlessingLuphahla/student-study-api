const express = require('express');
const router = express.Router();
const { createMaterial, deleteMaterial } = require('../controllers/uploadController');
const { uploadMultipleImages } = require('../middleware/uploadMiddleware');

// POST - Create material with optional file upload (using 'images' field from frontend)
router.post('/', uploadMultipleImages, createMaterial);

// DELETE - Delete material and associated file
router.delete('/:id', deleteMaterial);

module.exports = router;





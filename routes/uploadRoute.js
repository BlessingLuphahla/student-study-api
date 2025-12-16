const express = require('express');
const router = express.Router();
const { createMaterial, deleteMaterial } = require('../controllers/uploadController');
const { uploadImages } = require('../middleware/uploadMiddleware');

// POST - Create material with optional file upload (using 'images' field from frontend)
router.post('/', uploadImages, createMaterial);

// DELETE - Delete material and associated file
router.delete('/:id', deleteMaterial);

module.exports = router;





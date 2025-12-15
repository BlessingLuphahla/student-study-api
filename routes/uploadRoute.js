const express = require('express');
const router = express.Router();
const { createMaterial } = require('../controllers/uploadController');

router.post('/', createMaterial);

module.exports = router;





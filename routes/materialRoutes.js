const express = require('express');
const router = express.Router();
const { createMaterial } = require('../controllers/materialController');

router.post('/', createMaterial);

module.exports = router;



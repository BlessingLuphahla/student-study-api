// routes/resultRoutes.js
const express = require('express');
const {
  createResult,
  getAllResults,
  getResultById
} = require('../controllers/resultController');
const auth = require('../middleware/auth'); // JWT middleware

const router = express.Router();

router.post('/results', auth, createResult);
router.get('/results', auth, getAllResults);
router.get('/results/:id', auth, getResultById);

module.exports = router;



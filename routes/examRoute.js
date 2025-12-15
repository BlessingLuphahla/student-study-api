// routes/examRoutes.js
const express = require('express');
const { generateExam } = require('../controllers/examController');
// const auth = require('../middleware/auth');

const router = express.Router();

router.post('/exams/generate', generateExam);

module.exports = router;



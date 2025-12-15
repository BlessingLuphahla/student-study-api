const express = require('express');
const { generateExam } = require('../controllers/examController');

const router = express.Router();

router.post('/exams/generate', generateExam);

module.exports = router;



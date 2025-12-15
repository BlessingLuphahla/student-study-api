const express = require('express');
const {
  createResult,
  getAllResults,
  getResultById
} = require('../controllers/resultController');

const router = express.Router();

router.post('/results', createResult);
router.get('/results', getAllResults);
router.get('/results/:id', getResultById);

module.exports = router;



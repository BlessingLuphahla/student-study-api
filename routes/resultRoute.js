const express = require('express');
const {
  createResult,
  getAllResults,
  getResultById,
  deleteResult,
  getStats
} = require('../controllers/resultController');

const router = express.Router();

router.post('/', createResult);
router.get('/stats/overview', getStats);
router.get('/', getAllResults);
router.get('/:id', getResultById);
router.delete('/:id', deleteResult);

module.exports = router;



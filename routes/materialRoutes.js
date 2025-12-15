const express = require('express');
const router = express.Router();
const { getAllMaterials, getMaterial, deleteMaterial } = require('../controllers/materialController');

router.get('/', getAllMaterials);
router.get('/:id', getMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;



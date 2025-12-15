const express = require('express');
const router = express.Router();
const { getMaterial } = require('../controllers/materialController');

router.get('/:id', getMaterial);

module.exports = router;



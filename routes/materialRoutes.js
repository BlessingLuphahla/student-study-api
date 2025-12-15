const express = require('express');
const router = express.Router();
const { getMaterial } = require('../controllers/materialController');

router.get('/', getMaterial);

module.exports = router;



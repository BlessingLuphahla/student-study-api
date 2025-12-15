const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/', async (req, res) => {
    res.json({ message: 'get it' });
    console.log("something")
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, createGuest, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuest);
router.get('/me', protect, getMe);

module.exports = router;

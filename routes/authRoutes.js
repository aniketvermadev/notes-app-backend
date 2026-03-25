const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');
const auth = require('../middleware/authMiddleware'); // import

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, getMe);

module.exports = router;
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyUser, resendVerificationCode, changePassword } = require('../controllers/auth.controller');

router.post('/login', loginUser);
router.post('/register', registerUser);

router.post('/verify', verifyUser);
router.post('/resend-verification', resendVerificationCode); 

router.put('/change-password', changePassword);

module.exports = router;

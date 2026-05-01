const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, resendOtp, updateProfile, deleteProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);

// Explicit endpoints for admin for clarity
router.post('/admin/register', registerUser);
router.post('/admin/login', loginUser);

module.exports = router;

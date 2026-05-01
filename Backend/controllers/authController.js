const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const getEmailTemplate = (title, code) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <div style="background-color: #2563eb; padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">ShopEZ</h1>
    </div>
    <div style="padding: 40px 30px; background-color: white;">
      <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Here is your secure verification code. Please use this to complete your request. This code is valid for a limited time.</p>
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 5px;">${code}</span>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ShopEZ. All rights reserved.</p>
    </div>
  </div>
`;

const maybeIncludeOtpPreview = (emailResult, otp) => {
  if (emailResult?.skipped) {
    return {
      otpPreview: otp,
      deliveryMode: 'preview',
      message: 'Email could not be sent or is not configured, so the OTP is shown in preview mode.',
    };
  }

  return {
    deliveryMode: 'email',
  };
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Account already exists. Please sign in.' });
    }

    const userRole = role === 'admin' ? 'admin' : 'user';
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({ name, email, password, role: userRole, phone, otp, otpExpires });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    const emailResult = await sendEmail({
      email: user.email,
      subject: 'ShopEZ - Verify Your Email',
      message: `Your verification OTP is ${otp}. It expires in 5 minutes.`,
      html: getEmailTemplate('Verify Your Email Account', otp),
    });

    sendSms({
      phone: user.phone,
      message: `ShopEZ Code: ${otp}. Valid for 5 mins.`,
    }).catch((err) => console.log('Background SMS failed:', err.message));

    return res.status(201).json({
      message: emailResult?.skipped
        ? 'Account created. Email is not configured on this machine, so use the preview OTP below.'
        : 'User registered. Please check your email for the OTP to verify your account.',
      ...maybeIncludeOtpPreview(emailResult, otp),
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email first.' });
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otp !== String(otp) || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired Email OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      role: user.role,
      token: generateToken(user._id),
      message: 'Email verified successfully. You are now logged in.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const emailResult = await sendEmail({
      email: user.email,
      subject: 'ShopEZ - Resend OTP',
      message: `Your new verification OTP is ${otp}. It expires in 5 minutes.`,
      html: getEmailTemplate('Your New Verification Code', otp),
    });

    return res.json({
      message: emailResult?.skipped
        ? 'Email is not configured on this machine, so use the preview OTP below.'
        : 'New OTP has been sent to your email.',
      ...maybeIncludeOtpPreview(emailResult, otp),
    });
  } catch (error) {
    console.error('Resend OTP Error:', error.message);
    return res.status(500).json({ message: 'Server error while resending OTP.' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, profilePicture } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      role: user.role,
      token: generateToken(user._id),
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    return res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete Profile Error:', error.message);
    return res.status(500).json({ message: 'Server error while deleting account.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendEmail({
      email: user.email,
      subject: 'ShopEZ - Password Reset Code',
      message: `Your password reset code is ${otp}. It expires in 10 minutes.`,
      html: getEmailTemplate('Password Reset Request', otp),
    });

    return res.json({
      message: emailResult?.skipped
        ? 'Email is not configured on this machine, so use the preview reset code below.'
        : 'Password reset code sent to your email.',
      ...maybeIncludeOtpPreview(emailResult, otp),
    });
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.status(500).json({ message: 'Server error during forgot password.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== String(otp) || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    return res.status(500).json({ message: 'Server error during password reset.' });
  }
};

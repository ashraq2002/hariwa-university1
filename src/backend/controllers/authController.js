import { db } from '../models/db.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { validateEmailFormat, hashPassword, verifyPassword, generateOTP } from '../utils/authUtils.js';
import { sendEmailJSOTP } from '../utils/emailService.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields (name, email, password) are strictly required' });
  }

  // 1. Email format validation
  if (!validateEmailFormat(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. user@domain.com).' });
  }

  // 2. Duplicate email check in database
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account is already registered with this email address. Please log in or use another email.' });
  }

  const userRole = role === 'admin' ? 'admin' : 'student';
  const hashedPassword = hashPassword(password);
  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes expiry

  const newUser = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role: userRole,
    password: hashedPassword,
    isEmailVerified: false,
    otpCode,
    otpExpiresAt,
  };

  db.users.push(newUser);
  
  // Create active notification for admin users about new registration
  db.addNotification({
    recipientRole: 'admin',
    title: '🎓 New Student Registered',
    message: `New student ${newUser.name} (${newUser.email}) registered on the portal.`,
    type: 'registration',
    studentName: newUser.name,
    studentEmail: newUser.email,
  });

  db.save();

  // Dispatch real EmailJS verification email
  const emailResult = await sendEmailJSOTP({ email: newUser.email, name: newUser.name, otpCode });

  let msg = 'Registration successful! A 6-digit verification code has been sent to your email address.';
  if (!emailResult.success) {
    console.warn(`[Auth Warning] EmailJS dispatch issue: ${emailResult.error}`);
    msg += ` (Note: EmailJS service status: ${emailResult.error || 'Pending Gmail Connection'}. Your verification code is: ${otpCode})`;
  }

  res.status(201).json({
    success: true,
    requireVerification: true,
    email: newUser.email,
    message: msg,
    otpCode: !emailResult.success ? otpCode : undefined,
  });
};

export const verifyOTP = (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Both email address and 6-digit verification code are required.' });
  }

  if (!validateEmailFormat(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address format.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'No user account found associated with this email address.' });
  }

  if (user.isEmailVerified) {
    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
      message: 'Email address is already verified.',
    });
  }

  // Check code expiration
  if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
    return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code to receive a new code.' });
  }

  // Check code match
  if (String(user.otpCode).trim() !== String(otpCode).trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please double-check the 6-digit code and try again.' });
  }

  // Activate email verification status in DB
  user.isEmailVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  db.save();

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
    },
    message: 'Email address successfully verified! Welcome to Hariwa University Portal.',
  });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required to resend verification code.' });
  }

  if (!validateEmailFormat(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address format.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'No registered user account found for this email address.' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ error: 'This email address is already verified. You can log in directly.' });
  }

  // Generate new OTP
  const newOtp = generateOTP();
  user.otpCode = newOtp;
  user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  db.save();

  // Dispatch real EmailJS email
  const emailRes = await sendEmailJSOTP({ email: user.email, name: user.name, otpCode: newOtp });

  res.json({
    success: true,
    email: user.email,
    message: emailRes.success
      ? 'A new 6-digit verification code has been dispatched to your email address.'
      : `New verification code: ${newOtp}. (${emailRes.error ? `EmailJS status: ${emailRes.error}` : 'Email dispatch pending'})`,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password credentials are required.' });
  }

  if (!validateEmailFormat(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address format.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password credentials.' });
  }

  // Reject login if email is unverified
  if (user.isEmailVerified === false) {
    // Generate code if missing or expired
    let emailRes = { success: true };
    if (!user.otpCode || new Date() > new Date(user.otpExpiresAt)) {
      user.otpCode = generateOTP();
      user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      db.save();
      emailRes = await sendEmailJSOTP({ email: user.email, name: user.name, otpCode: user.otpCode });
    }

    return res.status(403).json({
      error: emailRes.success
        ? 'Your email address is not verified yet. A 6-digit code has been dispatched to your email.'
        : `Your email is unverified. Verification code: ${user.otpCode}. (${emailRes.error ? `EmailJS status: ${emailRes.error}` : 'Email dispatch pending'})`,
      requireVerification: true,
      email: user.email,
    });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: true,
    },
  });
};


export const getMe = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified !== false,
  });
};

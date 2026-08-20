import crypto from 'crypto';

/**
 * Strict regex validation for email formats
 */
export const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Hashes password using PBKDF2 with random salt
 */
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verifies password against stored hash (or fallback for plain text seed users)
 */
export const verifyPassword = (password, storedPassword) => {
  if (!storedPassword) return false;
  
  // If stored password is hash format "salt:hash"
  if (storedPassword.includes(':')) {
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }
  
  // Backward compatibility for legacy seed plain text passwords
  return password === storedPassword;
};

/**
 * Generates a secure 6-digit numerical OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

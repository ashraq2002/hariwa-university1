import { db } from '../models/db.js';

// Simple token generator: Token structure: "tk_<userId>_<role>_session"
export const generateToken = (user) => {
  const raw = `tk_${user.id}_${user.role}_uniport`;
  return Buffer.from(raw).toString('base64');
};

export const decodeToken = (token) => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('_');
    if (parts[0] === 'tk' && parts[3] === 'uniport') {
      return {
        userId: parts[1],
        role: parts[2],
      };
    }
  } catch (e) {
    // Parse failure
  }
  return null;
};

// Auth Middleware
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  const credentials = decodeToken(token);
  if (!credentials) {
    return res.status(401).json({ error: 'Malformed or expired credential token' });
  }

  const user = db.users.find((u) => u.id === credentials.userId);
  if (!user) {
    return res.status(401).json({ error: 'User does not exist in the active registry' });
  }

  // Attach user information to request
  req.user = user;
  next();
};

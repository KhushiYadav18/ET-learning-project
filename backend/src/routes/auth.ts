import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1, max: 100 }),
  body('lastName').trim().isLength({ min: 1, max: 100 })
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register new user
router.post('/register', validateRegistration, async (req: Request, res: Response, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const { email, password, firstName, lastName } = req.body;
    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return next(createError('User with this email already exists', 409));
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [userId, email, passwordHash, firstName, lastName]
    );

    // Generate JWT token
    const token = generateToken(userId, email, 'learner');

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'learner'
      },
      token
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// Login user
router.post('/login', validateLogin, async (req: Request, res: Response, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const { email, password } = req.body;
    const db = await getDatabase();

    // Find user
    const users = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return next(createError('Invalid email or password', 401));
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return next(createError('Account is deactivated', 403));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return next(createError('Invalid email or password', 401));
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      token
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('User not found', 404));
    }

    const db = await getDatabase();
    const users = await db.query(
      'SELECT id, email, first_name, last_name, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return next(createError('User not found', 404));
    }

    const user = users[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a blacklist for tokens if needed
  res.json({ message: 'Logout successful' });
});

// Helper function to generate JWT token
function generateToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn }
  );
}

export default router;

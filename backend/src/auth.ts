import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import pool from './database';
import bcrypt from 'bcrypt';

// Extend session type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// Session configuration
export const sessionConfig = {
  secret: 'tamagotchi-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Middleware to check if user is authenticated
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// User registration
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const connection = await pool.getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      connection.release();
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    
    connection.release();
    return result;
  } catch (error) {
    throw error;
  }
};

// User login
export const loginUser = async (username: string, password: string) => {
  try {
    const connection = await pool.getConnection();
    
    // Find user
    const [users] = await connection.execute(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      connection.release();
      throw new Error('Invalid username or password');
    }
    
    const user = users[0] as any;
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      connection.release();
      throw new Error('Invalid username or password');
    }
    
    connection.release();
    return { id: user.id, username: user.username };
  } catch (error) {
    throw error;
  }
};

// Get user info
export const getUserInfo = async (userId: number) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    connection.release();
    
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('User not found');
    }
    
    return users[0];
  } catch (error) {
    throw error;
  }
};

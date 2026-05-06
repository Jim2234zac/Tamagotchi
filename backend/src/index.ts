import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tamagotchi_db'
};

// Session configuration
const sessionConfig = {
  secret: 'tamagotchi-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
};

// Extend session type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// Initialize database
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.query('CREATE DATABASE IF NOT EXISTS tamagotchi_db');
    await connection.query('USE tamagotchi_db');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tamagotchis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        animal_type VARCHAR(20) DEFAULT 'cat',
        hunger INT DEFAULT 50,
        happiness INT DEFAULT 50,
        energy INT DEFAULT 50,
        cleanliness INT DEFAULT 50,
        age INT DEFAULT 0,
        is_alive BOOLEAN DEFAULT TRUE,
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Initialize database
initDatabase().catch(console.error);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(session(sessionConfig));

interface Tamagotchi {
  id: string;
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  age: number;
  isAlive: boolean;
  lastUpdate: Date;
  animalType?: string;
}

// Authentication middleware
const authenticateUser = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
};

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// User registration
const registerUser = async (username: string, email: string, password: string) => {
  try {
    const connection = await pool.getConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      connection.release();
      throw new Error('Username or email already exists');
    }
    
    const passwordHash = await hashPassword(password);
    
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
const loginUser = async (username: string, password: string) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      connection.release();
      throw new Error('Invalid username or password');
    }
    
    const user = users[0] as any;
    
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
const getUserInfo = async (userId: number) => {
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

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const result = await registerUser(username, email, password);
    res.status(201).json({ message: 'User registered successfully', userId: (result as any).insertId });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await loginUser(username, password);
    
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', authenticateUser, async (req, res) => {
  try {
    const userInfo = await getUserInfo(req.session.userId!);
    res.json(userInfo);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Tamagotchi routes (protected)
app.get('/api/tamagotchi/:id', authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [tamagotchis] = await connection.execute(
      'SELECT * FROM tamagotchis WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    
    connection.release();
    
    if (!Array.isArray(tamagotchis) || tamagotchis.length === 0) {
      return res.status(404).json({ error: 'Tamagotchi not found' });
    }
    
    res.json(tamagotchis[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/tamagotchi', authenticateUser, async (req, res) => {
  try {
    const { name, animalType } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO tamagotchis (user_id, name, animal_type) VALUES (?, ?, ?)',
      [req.session.userId, name || 'Tamagotchi', animalType || 'cat']
    );
    
    connection.release();
    
    const [newTamagotchi] = await pool.execute(
      'SELECT * FROM tamagotchis WHERE id = ?',
      [(result as any).insertId]
    );
    
    res.status(201).json(newTamagotchi[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tamagotchi' });
  }
});

app.put('/api/tamagotchi/:id', authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [tamagotchis] = await connection.execute(
      'SELECT * FROM tamagotchis WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    
    if (!Array.isArray(tamagotchis) || tamagotchis.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tamagotchi not found' });
    }
    
    const tamagotchi = tamagotchis[0] as any;
    const { action } = req.body;
    
    switch (action) {
      case 'feed':
        await connection.execute(
          'UPDATE tamagotchis SET hunger = GREATEST(0, hunger - 20), happiness = LEAST(100, happiness + 10) WHERE id = ? AND user_id = ?',
          [req.params.id, req.session.userId]
        );
        break;
      case 'play':
        await connection.execute(
          'UPDATE tamagotchis SET happiness = LEAST(100, happiness + 20), energy = GREATEST(0, energy - 15), hunger = LEAST(100, hunger + 10) WHERE id = ? AND user_id = ?',
          [req.params.id, req.session.userId]
        );
        break;
      case 'sleep':
        await connection.execute(
          'UPDATE tamagotchis SET energy = LEAST(100, energy + 30), hunger = LEAST(100, hunger + 5) WHERE id = ? AND user_id = ?',
          [req.params.id, req.session.userId]
        );
        break;
      case 'clean':
        await connection.execute(
          'UPDATE tamagotchis SET cleanliness = LEAST(100, cleanliness + 25), happiness = LEAST(100, happiness + 5) WHERE id = ? AND user_id = ?',
          [req.params.id, req.session.userId]
        );
        break;
    }
    
    const [updatedTamagotchi] = await connection.execute(
      'SELECT * FROM tamagotchis WHERE id = ?',
      [req.params.id]
    );
    
    connection.release();
    
    const updated = updatedTamagotchi[0] as any;
    if (updated.hunger >= 100 || updated.energy <= 0 || updated.cleanliness <= 0) {
      await connection.execute(
        'UPDATE tamagotchis SET is_alive = FALSE WHERE id = ?',
        [req.params.id]
      );
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tamagotchi' });
  }
});

app.get('/api/tamagotchis', authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [tamagotchis] = await connection.execute(
      'SELECT * FROM tamagotchis WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );
    
    connection.release();
    res.json(tamagotchis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tamagotchis' });
  }
});

// Auto-update tamagotchis every 10 seconds
setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      UPDATE tamagotchis 
      SET 
        hunger = LEAST(100, hunger + 2),
        happiness = GREATEST(0, happiness - 1),
        energy = GREATEST(0, energy - 1),
        cleanliness = GREATEST(0, cleanliness - 1),
        age = age + 1,
        is_alive = CASE 
          WHEN hunger >= 100 OR energy <= 0 OR cleanliness <= 0 THEN FALSE 
          ELSE is_alive 
        END
      WHERE is_alive = TRUE
    `);
    
    connection.release();
  } catch (error) {
    console.error('Auto-update failed:', error);
  }
}, 10000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Database: MySQL with user authentication');
});

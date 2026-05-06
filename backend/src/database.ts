import mysql from 'mysql2';

interface DbConnection {
  host: string;
  user: string;
  password: string;
  database: string;
}

const dbConfig: DbConnection = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tamagotchi_db'
};

export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS tamagotchi_db');
    await connection.query('USE tamagotchi_db');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tamagotchis table
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

export default pool;

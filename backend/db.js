const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'bank',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(40) NOT NULL, password VARCHAR(255) NOT NULL,
      role ENUM('ADMIN','ORGANIZER','PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, last_login DATETIME NULL
    )`);
    await connection.query(`CREATE TABLE IF NOT EXISTS events (
      id CHAR(36) PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL,
      date DATE NOT NULL, registration_deadline DATETIME NULL, time VARCHAR(10) NOT NULL,
      venue VARCHAR(255) NOT NULL, category VARCHAR(40) NOT NULL, capacity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0, image LONGTEXT NULL,
      created_by CHAR(36) NOT NULL, organizer_id CHAR(36) NOT NULL,
      status ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id), FOREIGN KEY (organizer_id) REFERENCES users(id)
    )`);
    await connection.query(`CREATE TABLE IF NOT EXISTS registrations (
      id CHAR(36) PRIMARY KEY, user_id CHAR(36) NOT NULL, event_id CHAR(36) NOT NULL,
      registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_event (user_id,event_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )`);
    await connection.query(`CREATE TABLE IF NOT EXISTS feedback (
      id CHAR(36) PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  } finally { connection.release(); }
}

module.exports = { pool, initializeDatabase };

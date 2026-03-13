const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log(process.env)

// ==========================================
// MSSQL DATABASE CONNECTION
// ==========================================
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'password',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'app',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

console.log('🔌 Attempting DB Connection:', {
  ...dbConfig,
  password: dbConfig.password ? '****' : '(none)'
});

let pool;

// Initialize database table
const initializeDB = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ MSSQL Database connected successfully!');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        age INT,
        created_at DATETIME DEFAULT GETDATE()
      )
    `);

    console.log('✅ Users table ready');
  } catch (error) {
    console.error('❌ FATAL: Could not connect to database.');
    console.error('Error:', error.message);
  }
};

// ===== CRUD OPERATIONS =====

// CREATE
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('age', sql.Int, age)
      .query(`
        INSERT INTO users (name, email, age)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @age)
      `);

    res.status(201).json({
      message: 'User created successfully',
      user: result.recordset[0]
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ ALL
app.get('/users', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM users ORDER BY id ASC');

    res.json({
      count: result.recordset.length,
      users: result.recordset
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ BY ID
app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const id = req.params.id;

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const current = check.recordset[0];

    const updateName = name || current.name;
    const updateEmail = email || current.email;
    const updateAge = age !== undefined ? age : current.age;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, updateName)
      .input('email', sql.NVarChar, updateEmail)
      .input('age', sql.Int, updateAge)
      .query(`
        UPDATE users
        SET name=@name, email=@email, age=@age
        OUTPUT INSERTED.*
        WHERE id=@id
      `);

    res.json({
      message: 'User updated successfully',
      user: result.recordset[0]
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE
app.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM users WHERE id = @id');

    res.json({ message: 'User deleted successfully', id });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3000;

initializeDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await sql.close();
  process.exit(0);
});

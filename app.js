// 🌐 Core Modules
const fs = require('fs');
const path = require('path');

// 📦 External Packages
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('./generated/prisma');

// 🔧 Custom Modules
const LoggerMiddleware = require('./src/middlewares/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const authenticateToken = require('./src/middlewares/auth');
const {
  validateUser,
  validateUserUpdate,
  validateUpdatedId
} = require('./src/utils/validation');

// 📂 Config
const UsersFilePath = path.join(__dirname, 'users.json');
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware);

// 🌐 Static files (para servir index.html)
app.use(express.static('./src/public'));

// 📍 Rutas de prueba
app.get('/', (req, res) => {
  res.send(`
    <h1>express.js</h1>
    <p>This is an Express.js course</p>
    <p>PORT: ${PORT}</p>
  `);
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Show user info by ID: ${userId}`);
});

app.get('/search', (req, res) => {
  const terms = req.query.term || 'no specified';
  const category = req.query.category || 'all';
  res.send(`
    <h2>Search results:</h2>
    <p>Term: ${terms}</p>
    <p>Category: ${category}</p>
  `);
});

app.post('/form', (req, res) => {
  const { name = 'anonymous', email = 'N/A' } = req.body;
  res.json({ message: 'Data received', data: { name, email } });
});

app.post('/api/data', (req, res) => {
  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No data was received" });
  }
  res.status(201).json({ message: "JSON data received", data });
});

// 🧾 Users (JSON file)
app.get('/users', (req, res) => {
  fs.readFile(UsersFilePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading user data' });
    const users = JSON.parse(data);
    res.json(users);
  });
});

app.post('/users', (req, res) => {
  const newUser = req.body;

  fs.readFile(UsersFilePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });

    const users = JSON.parse(data);
    const errors = validateUser(newUser, users);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    users.push(newUser);
    fs.writeFile(UsersFilePath, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error saving user' });
      res.status(201).json(newUser);
    });
  });
});

app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  fs.readFile(UsersFilePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });

    let users = JSON.parse(data);
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) return res.status(404).json({ error: `User with ID ${userId} not found` });

    const idError = validateUpdatedId(updatedUser.id, userId, users);
    if (idError) return res.status(409).json({ error: idError });

    const validationErrors = validateUserUpdate(updatedUser);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    users[index] = { ...users[index], ...updatedUser };
    fs.writeFile(UsersFilePath, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error updating user' });
      res.json(users[index]);
    });
  });
});

app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  fs.readFile(UsersFilePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error connecting with data' });

    let users = JSON.parse(data);
    const userExists = users.some(user => user.id === userId);
    if (!userExists) return res.status(404).json({ error: `User with ID ${userId} not found` });

    users = users.filter(user => user.id !== userId);
    fs.writeFile(UsersFilePath, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Could not delete user' });
      res.status(204).send();
    });
  });
});

// 🧪 Error middleware test
app.get('/error', (req, res, next) => {
  next(new Error('error intencional'));
});

// 🗃️ DB Users (PostgreSQL + Prisma)
app.get('/db-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error communicating with database' });
  }
});

// 🔐 Auth routes
app.get('/protected-route', authenticateToken, (req, res) => {
  res.send('Esta es una ruta protegida.');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );

  res.json({ token });
});

// 🧹 Error handler
app.use(errorHandler);

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

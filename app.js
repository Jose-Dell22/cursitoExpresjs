// 🌐 Core Modules
const fs = require('fs');
const path = require('path');

// 📦 External Packages
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const { PrismaClient } = require('./generated/prisma');

// 🔧 Custom Modules
const LoggerMiddleware = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const {
    validateUser,
    validateUserUpdate,
    validateUpdatedId
} = require('./utils/validation');

// 📂 Config
const UsersFilePath = path.join(__dirname, 'users.json');
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(LoggerMiddleware);
app.use(errorHandler);

// 📍 Routes
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
    const name = req.body.name || 'anonymous';
    const email = req.body.email || 'N/A';
    res.json({
        message: 'Data received',
        data: { name, email }
    });
});

app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No data was received" });
    }
    res.status(201).json({
        message: "JSON data received",
        data
    });
});

// 🧾 Users (JSON file based)
app.get('/users', (req, res) => {
    fs.readFile(UsersFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading user data' });
        }
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

        if (index === -1) {
            return res.status(404).json({ error: `User with ID ${userId} not found` });
        }

        const idError = validateUpdatedId(updatedUser.id, userId, users);
        if (idError) {
            return res.status(409).json({ error: idError });
        }

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
        if (err) {
            return res.status(500).json({ error: 'Error connecting with data' });
        }

        let users = JSON.parse(data);
        const userExists = users.some(user => user.id === userId);

        if (!userExists) {
            return res.status(404).json({ error: `User with ID ${userId} not found` });
        }

        users = users.filter(user => user.id !== userId);

        fs.writeFile(UsersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Could not delete user' });
            }
            res.status(204).send(); // No content
        });
    });
});

// 🧪 Test error middleware
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

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs');
const path = require('path');
const {
    validateUser,
    validateUserUpdate,
    validateUpdatedId
} = require('./utils/validation');
const { error } = require('console');
const LoggerMiddleware = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const UsersFilePath = path.join(__dirname, 'users.json');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(LoggerMiddleware);
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

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

app.get('/error' , (req,res,next)=>{
next(new Error('error intencional'));
});
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

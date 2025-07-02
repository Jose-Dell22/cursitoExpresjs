const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());

// Rutas API
app.use('/api', routes);

// Archivos estáticos: si visitas '/', servirá 'public/index.html'
app.use(express.static('./public'));

module.exports = app;

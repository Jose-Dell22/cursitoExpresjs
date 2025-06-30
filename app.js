require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
console.log(PORT);

app.get('/', (req, res) => {
    res.send(`
        <h1>express.js </h1>
        <p>this is a express js course</p>
        <p>PORT: ${PORT}</p>`);
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

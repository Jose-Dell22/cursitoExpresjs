require('dotenv').config();

const express = require('express');
const bodyparser= require('body-parser');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));


const PORT = process.env.PORT || 3000;
console.log(PORT);

app.get('/', (req, res) => {
    res.send(`
        <h1>express.js </h1>
        <p>this is a express js course</p>
        <p>PORT: ${PORT}</p>`);
});
app.get('/user/:id', (req,res)=>{
    const userId= req.params.id;
    res.send(`Show user info by ID: ${userId}`)
})
app.get('/search',(req,res)=>{
    const terms= req.query.term || 'no específicated';
    const category =req.query.category || 'all';
    res.send(`
        <h2>search results:</h2>
        <p>term: ${terms}</p>
        <p>category: ${category}</p>`
    );
});
app.post('/form', (req,res)=>{
    const name = req.body.name || 'anonymus';
    const email = req.body.email || 'N/A';
    res.json({
        message: 'Data received',
        data: {
            name,
            email

        }
    })
});

app.post('/api/data', (req, res)=>{
    const data = req.body;
    if(!data || Object.keys(data).length===0){
        return res.status(400).json({error: "No data was received"});
    }
    res.status(201).json({
        message: "Json Data received",
        data
    })
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

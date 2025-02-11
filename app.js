const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');


// Connexion à MongoDB
mongoose.connect('mongodb+srv://cverhulle:TestOC212683@discord.hcb4b.mongodb.net/?retryWrites=true&w=majority&appName=Discord',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


// Résoudre les problèmes de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });




// Réponse du serveur
app.use((req, res) => {
    res.json({ message: 'Your request was successful!' });
})


app.use('/api/auth', userRoutes);




module.exports = app;


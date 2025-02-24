const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');

// Connexion à MongoDB
mongoose.connect('mongodb+srv://cverhulle:TestOC212683@discord.hcb4b.mongodb.net/?retryWrites=true&w=majority&appName=Discord')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


// Accéder aux paramètres res et req des requetes entrantes.
app.use(express.json());


// Résoudre les problèmes de CORS

app.use((req, res, next) => {

    // Vérifier si la requête est une requête OPTIONS
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();  // On répond immédiatement avec un status 200 pour les requêtes OPTIONS
    }
    next();  // Si ce n'est pas une requête OPTIONS, on passe à la suite
});






app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);




module.exports = app;



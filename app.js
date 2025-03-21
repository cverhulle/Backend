const express = require('express');
const app = express();
const path= require('path')
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const privateMessageRoutes = require('./routes/private-message')
require('dotenv').config()

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_CODE)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


// Accéder aux paramètres res et req des requetes entrantes.
app.use(express.json());

// Accéder aux fichiers dans le dossier images
app.use(express.static(path.join(__dirname,'images')));

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
app.use('/api/private-message', privateMessageRoutes);




module.exports = app;



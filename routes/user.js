const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');


// Route permettant si un utilisateur possède déjà l'adresse email
router.post('/register/email', userCtrl.emailExists)

// Route permettant de vérifier si un username est déjà utilisé
router.post('/register/username', userCtrl.usernameExists)

// Route permettant de créer un compte
router.post('/register', userCtrl.register);

// Route permettant de se connecter
router.post('/login', userCtrl.login);


module.exports = router;



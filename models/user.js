const mongoose = require('mongoose');


// Ce modèle est utilisé pour sauvegarder les données des utilisateurs
const userSchema = mongoose.Schema({
    
    // Nom et prénom de l'utilisateur
    personalInfo: { 
        firstName: { type: String, required: true},
        lastName: { type: String, required: true},
    },

    // Email de l'utilisateur 
    emailInfo: { 
        email: { type: String, required: true, unique: true},
        confirmEmail: { type: String, required: true},
    },

    // Pseudo et mot de passe de l'utilisateur
    loginInfo: {
        username: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        confirmPassword: { type: String, required: true},
    },

    // URL de Image de profil de l'utlisateur l'
    image: { type: String, required: true},
});




module.exports = mongoose.model('User', userSchema);
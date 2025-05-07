const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile');
const auth = require('../middleware/auth');


// Route permettant de récupérer les informations de profil de l'utilisateur
router.get('', auth, profileCtrl.getProfile);

// Route permettant de sauvegarder les informations après une modification du profil
router.put('/modify', auth, profileCtrl.modifyProfile)

// Route permettant de sauvegarder les informations après une modification du mot de passe
router.put('/modifyPassword', auth, profileCtrl.modifyPassword)

// Route permettant de vérifier si un email est déjà pris
router.post('/email', auth, profileCtrl.emailTaken)

// Route permettant de vérifier si un username est déjà pris
router.post('/username', auth, profileCtrl.usernameTaken)

// Route permettant de supprimer le compte de l'utilisateur
router.delete('/deleteAccount', auth, profileCtrl.deleteAccount)


module.exports = router;

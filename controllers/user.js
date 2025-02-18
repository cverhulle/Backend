const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


exports.register = (req, res, next) => {
    // Création d'un nouvel utilisateur dans la base de données.

    // Hashage du mot de passe
    bcrypt.hash(req.body.login['password'], 10)
    .then(hash => {

        // On remplace les mots de passe en clair par le mot de passe hashé.
        req.body.login['password'] = hash;
        req.body.login['confirmPassword'] = hash;
        
        // On initilise le modèle avant sa création pour prendre en compte le mot clé "unique" du modèle
        User.init()
        .then( async () => {
          // Création d'un nouvel utilisateur avec le modèle mongoose et le mdp hashé.
          const user = new User({
            personalInfo: req.body.personalInfo,
            emailInfo: req.body.email,
            loginInfo: req.body.login,
            image: req.body.image
          });
          
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ message: 'Erreur dans la sauvegarde sur le serveur' }));
        }
      )
      .catch(error => res.statut(400).json({message: 'Username et/ou email déjà utilisé(s)'}))
    })
      .catch(
        error => res.status(500).json({ error }));
  };



  

  

exports.login = (req, res, next) => {
    
    // Recherche de l'utilisateur dans la base de données
    User.findOne( { 'loginInfo.username' : req.body['username'] })
       .then(user => {

            // Si l'utilisateur n'est pas trouvé, on renvoie une erreur 401.
           if (!user) {
                console.log('User not found');
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
           }

           // Si l'utilisateur est trouvé, on compare les mots de passe
           bcrypt.compare(req.body['password'], user.loginInfo['password'])
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                   }

                   // Si les mots de passe correspondent, on renvoie un objet JSON avec un userId et un token.
                   res.status(200).json({
                          userId: user._id,

                          // Création d'un token avec la méthode sign de jsonwebtoken
                          token: jwt.sign(
                            { userId: user._id },
                            // Clé secrète pour crypter le token
                            'TOKEN_SECRET',
                            { expiresIn: '24h' }
                          )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};



exports.emailExists = (req,res,next) => {
  User.findOne({ 'emailInfo.email': req.body.email['email']})
    .then( user => { 
      if (user) {
        return res.status(200).json({message : 'Email déjà utilisé'}) 
      }
    })
    .catch(() => res.status(200).json({ message : "L'email n'est pas utilisé" }))
};


exports.usernameExists = (req,res,next) => {
  User.findOne({ 'loginInfo.username': req.body.login['username']})
    .then( user => { 
      if (user) {
        return res.status(200).json({message : 'Username déjà utilisé'}) 
      }
    })
    .catch(() => res.status(200).json({ message : "L'username n'est pas utilisé" }))
};
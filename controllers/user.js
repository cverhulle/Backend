const bcrypt = require('bcrypt');
const User = require('../models/user');


exports.register = (req, res, next) => {
    // Création d'un nouvel utilisateur dans la base de données.

    // Hashage du mot de passe
    bcrypt.hash(req.body.login['password'], 10)
    .then(hash => {
        // On remplace les mots de passe en clair par le mot de passe hashé.
        req.body.login['password'] = hash;
        req.body.login['confirmPassword'] = hash;
        // Création d'un nouvel utilisateur avec le modèle mongoose et le mdp  hashé.
        const user = new User({
          personalInfo: req.body.personalInfo,
          emailInfo: req.body.email,
          loginInfo: req.body.login,
          image: req.body.image
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  

  

exports.login = (req, res, next) => {

   User.findOne({ username: req.body.login['username'] })
       .then(user => {
           if (!user) {
               return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
           }
           bcrypt.compare(req.body.login['password'], user.loginInfo['password'])
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                   }
                   res.status(200).json({
                       userId: user._id,
                       token: 'TOKEN'
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};


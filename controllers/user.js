const bcrypt = require('bcrypt');
const User = require('../models/user');


exports.register = (req, res, next) => {
    console.log(req.body.login['password']);
    bcrypt.hash(req.body.login['paswword'], 10)
      .then(hash => {
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
   User.findOne({ email: req.body.email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
           }
           bcrypt.compare(req.body.password, user.password)
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


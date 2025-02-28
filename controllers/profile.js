const User = require ('../models/user')

// Cette méthode retourne les infos sur l'utilisteur à l'id fixé.
exports.getProfile = (req, res, next) => {
    User.findOne( {_id : req.auth['userId'] })
        .then( (user) =>
            res.status(200).json({user})
        )

        .catch(error => res.status(400).json({error}))
}

// Cette méthode permet de modifier les infos de l'utilisateur (hors mdp)
exports.modifyProfile = (req, res, next) => {
    
    // On sauvegarde les données de req.body dans des sous variables
    const {personalInfo, email, login, image} = req.body

    // On isole chaque champ du modèle dans une variale
    const updateData = {
        'personalInfo.firstName': personalInfo.firstName,
        'personalInfo.lastName': personalInfo.lastName,
        'emailInfo.email':email.email,
        'emailInfo.confirmEmail': email.confirmEmail,
        'loginInfo.username': login.username,
        'image': image
    }

    User.updateOne( {_id : req.auth['userId'] }, updateData)
        .then((user) => res.status(200).json({message : "L'utilisateur a été modifié"}))
        .catch(error => res.status(400).json({error}))
}

exports.emailTaken = (req,res,next) => {
  User.findOne({ 'emailInfo.email': req.body.email['email'], _id: {$ne: req.auth['userId']} })
    .then( user => { 
      if (user) {
        return res.status(400).json({message : 'Email déjà utilisé'}) 
      }
      return res.status(200).json({messsage: "L'email n'est pas utilisé"})
    })
    .catch(() => res.status(400).json({ message : "Erreur dans la recherche" }))
  
};
const User = require ('../models/user')

// Cette méthode retourne les infos sur l'utilisteur à l'id fixé.
exports.getProfile = (req, res, next) => {
    User.findOne( {_id : req.auth['userId']})
        .then( (user) =>
            res.status(200).json({user})
        )

        .catch(error => res.status(400).json({error}))
}

exports.modifyProfile = (req, res, next) => {
    console.log('test')
    res.status(200).json({message : 'ok'})
}
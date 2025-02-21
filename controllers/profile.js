const User = require ('../models/user')

// Cette méthode retourne les infos sur l'utilisteur à l'id fixé.
exports.getProfile = (req, res, next) => {
    User.findOne( {_id : '67b5d72d26a7c6922f7db32f'})
        .then( (user) =>
            res.status(200).json({user})
        )

        .catch(error => res.status(400).json({error}))
}

const User = require ('../models/user')

exports.getProfile = (req, res, next) => {
    User.findOne( {_id : '67b5d72d26a7c6922f7db32f'})
        .then( (user) =>
            res.status(200).json({user})
        )

        .catch(error => res.status(400).json({error}))
}

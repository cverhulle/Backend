const User = require ('../models/user')


exports.queryUsers = (req, res, next) => {
    // On récupère le paramètre de recherche que l'on met en minuscule.
    const searchQuery = req.query.search;
    

    User.find({'loginInfo.username' : {$regex: searchQuery, $options : 'i'} })
        .then(users => {
            console.log(users)
            res.status(200).json(users)
        })
        .catch(error => res.status(500).json({error}))

}
const User = require ('../models/user')

// Cette méthode retourne les utilisateurs en fonction de la requete formulée.
exports.queryUsers = (req, res, next) => {
    // On récupère le paramètre de recherche que l'on met en minuscule.
    const searchQuery = req.query.search;
    
    // Le $regex permet de chercher les username contenant la recherche formulée.
    // Options permet d'être insensible à la casse : Co, co et CO seront traités de la même façon.
    User.find({'loginInfo.username' : {$regex: searchQuery, $options : 'i'} })

        // On selectionne les champs à retourner
        .select('loginInfo.username image')

        .then(users => {
            
            // Avec le select seul, username est "coincé" comme paramètre d'un objet loginInfo.
            const formattedUsers = users.map(user => ({
                id : user._id.toString(),
                username : user.loginInfo.username,
                image : user.image
            }));

            console.log(formattedUsers)
            
            res.status(200).json(formattedUsers)
        })
        .catch(error => res.status(500).json({error}))

}
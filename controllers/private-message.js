const User = require ('../models/user')
const Post = require ('../models/post')

// Cette méthode retourne les utilisateurs, à l'exception de celui qui fait la requete, en fonction de l'entrée formulée.
exports.queryUsers = (req, res, next) => {
    // On récupère le paramètre de recherche que l'on met en minuscule.
    const searchQuery = req.query.search;
    
    // Le $regex permet de chercher les username contenant la recherche formulée.
    // Options permet d'être insensible à la casse : Co, co et CO seront traités de la même façon.
    User.find({'loginInfo.username' : {$regex: searchQuery, $options : 'i'}, _id: {$ne : req.auth['userId']}  })

        // On selectionne les champs à retourner
        .select('loginInfo.username image')

        .then(users => {
            
            // Avec le select seul, username est "coincé" comme paramètre d'un objet loginInfo.
            const formattedUsers = users.map(user => ({
                id : user._id.toString(),
                username : user.loginInfo.username,
                image : user.image
            }));

            res.status(200).json(formattedUsers)
        })
        .catch(error => res.status(500).json({error}))

}


exports.savePost = (req, res, next) => {
    const { currentUserId, otherUserId, username, image, content, timestamp} = req.body;
    
    // On vérifie si les données de la requete sont correctes.
    if ( !currentUserId || !otherUserId || !username || !image || !content || !timestamp) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    Post.init()
        .then( async () => {
            // Création du post
            const post = new Post({
                currentUserId : currentUserId,
                otherUserId : otherUserId,
                username : username,
                image : image,
                content: content,
                timestamp: timestamp
            })
            post.save()
                .then(() => res.status(201).json({ message: 'Post crée' }))
                .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
        })
        .catch(error => res.status(400).json( {message: "Erreur dans l'initialistion du modèle"} ))
}


exports.getPosts = (req, res, next) => {
    const otherUserId = req.query.otherUserId

    // On vérifie que otherUserId existe bien
    if( !otherUserId) {
        return res.status(400).json({ message: "L'id du destinataire est manquant" });
    }

    Post.find({currentUserId : req.auth.userId}, {otherUserId: otherUserId})
        .sort({timestamp : 1})
        .then(posts => {
            console.log(posts)
            res.status(200).json(posts);
        })
        .catch(error => res.status(500).json({ message: 'Erreur lors de la récupération des posts' }))


    
}
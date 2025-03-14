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

// Cette méthode permet de sauvegarder un message dans la base de données.
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
                .then((savedPost) => res.status(201).json({ message: 'Post crée', postId: savedPost._id }))
                .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
        })
        .catch(error => res.status(400).json( {message: "Erreur dans l'initialistion du modèle"} ))
}

// Cette méthode permet de récupérer tous les messages entre deux utilisateurs.
exports.getPosts = (req, res, next) => {
    // On récupère l'userId de l'autre personne
    const otherUserId = req.query.otherUserId

    // On vérifie que otherUserId existe bien
    if( !otherUserId) {
        return res.status(400).json({ message: "L'id du destinataire est manquant" });
    }

    // On cherche les posts contenant l'utilisateur actuel en tant qu'envoyeur ou receveur du message.
    Post.find({$or: [{currentUserId : req.auth.userId, otherUserId : otherUserId}, 
                     {currentUserId : otherUserId, otherUserId : req.auth.userId}
                    ] 
        })

        // On trie par date croissantz
        .sort({timestamp : 1})
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => res.status(500).json({ message: 'Erreur lors de la récupération des posts' }))


    
}

// Cette méthode permet de récupérer les 10 derniers messages entre deux utilisateurs.
exports.getPreviousPosts = (req, res, next) => {
    const otherUserId = req.query.otherUserId;

    // On récupère le nombre de messages à ignorer.
    const skip = parseInt(req.query.skip)

    // On vérifie que otherUserId existe bien dans la requete.
    if (!otherUserId) {
        return res.status(400).json({ message: "L'id du destinataire est manquant" });
    }

    // On cherche les posts contenant l'utilisateur actuel en tant qu'envoyeur ou receveur du message.
    Post.find({
        $or: [
            { currentUserId: req.auth.userId, otherUserId: otherUserId },
            { currentUserId: otherUserId, otherUserId: req.auth.userId }
        ]
    })

        // On trie par date décroissante.
        .sort({ timestamp: -1 })

        // On ignore le nombre de messages spécifié dans skip.
        .skip(skip) 

        // On limite le nombre de messages récupérés à 10.
        .limit(10) 

        .then(posts => {
            // On remet les messages du plus récent au plus ancien.
            res.status(200).json(posts.reverse()); 
        })
        .catch(error => res.status(500).json({ message: 'Erreur lors de la récupération des posts' }));
}


exports.deletePost = (req, res, next) => {
    try{
        const postId = req.query.postId;
        const currentUserId = req.auth.userId;
        Post.findOneAndDelete({ currentUserId: currentUserId, _id : postId })
            .then((deletePost) => {
                if (!deletePost) {
                    return res.status(404).json({ message: 'Post non trouvé' });
                }
                res.status(200).json({ message: 'Post supprimé' });
            })
            .catch((error) => {
                res.status(500).json({ error });
            });
    } catch (error) {
        res.status(500).json({ error });
    }
}
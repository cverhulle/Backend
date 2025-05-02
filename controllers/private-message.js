const User = require ('../models/user')
const Post = require ('../models/post');
const path = require('path')

// Cette méthode retourne les utilisateurs, à l'exception de celui qui fait la requete, en fonction de l'entrée formulée.
exports.queryUsers = (req, res, next) => {
    // On récupère le paramètre de recherche que l'on met en minuscule.
    const searchQuery = req.query.search;
    
    // Le $regex permet de chercher les username contenant la recherche formulée.
    // Options permet d'être insensible à la casse : Co, co et CO seront traités de la même façon.
    User.find({'loginInfo.username' : {$regex: searchQuery, $options : 'i'}, _id: {$ne : req.auth['userId']}  })

        // On selectionne les champs à retourner
        .select('loginInfo.username image')

        // On trie en ne distinguant pas les majuscules ni les accents (A = a = À = à)
        .collation({ locale: 'en', strength: 1 })

        // On trie les résultats par ordre alphabétique
        .sort({ 'loginInfo.username': 1 })

        // On limite à 10 le nombre maximal d'utilisateurs affichés
        .limit(10)

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

// Cette méthode permet de sauvegarder un Post sur le serveur.
exports.savePost = (req, res, next) => {
    const { currentUserId, otherUserId, username, content, image } = req.body;
    const fullPath = req.filePath; // Chemin de l'image, s'il y en a une

    // Vérification des champs requis
    if (!currentUserId || !otherUserId || !username || !content || !image) {
        console.log(req.body);
        return res.status(400).json({ message: 'Tous les champs doivent être remplis.' });
    }

    let imageToSend = null;

    // Si une image a été uploadée, on construit l'URL de l'image
    if (fullPath) {
        const imageName = path.basename(fullPath);
        imageToSend = `http://localhost:3000/images/${imageName}`;
    }

    Post.init()
        .then(async () => {
            // Création du post
            const post = new Post({
                postId: 'attente', // Placeholder jusqu'à la sauvegarde
                currentUserId: currentUserId,
                otherUserId: otherUserId,
                username: username,
                image: image, 
                content: content,
                timestamp: new Date(),
                imageInChat: imageToSend // URL de l'image si elle existe
            });

            post.save()
                .then((savedPost) => {
                    // Mise à jour de postId avec l'ID du post nouvellement créé
                    savedPost.postId = savedPost._id;
                    savedPost.save()
                        .then((savedPost) => res.status(201).json({ message: 'Post créé', postId: savedPost._id, imageInChat: savedPost.imageInChat }))
                        .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
                })
                .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
        })
        .catch(error => res.status(400).json({ message: "Erreur dans l'initialisation du modèle" }));
};



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

// Cette méthode permet de supprimer un post sur le serveur.
exports.deletePost = (req, res, next) => {
    try{
        // On récupère le postId.
        const postId = req.query.postId;
        const currentUserId = req.auth.userId;

        // On supprime le post en fonction du currentUserId et du postId.
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

// Cette méthode permet de modifier le contenu d'un post.
exports.updatePost = (req, res, next) => {
    // On récupère l'id du post, le nouveau contenu.
    const postId = req.body.postId;
    const newContent = req.body.content
    
    const currentUserId = req.auth.userId;

    // Vérification que postId et newContent sont présents
    if (!postId || !newContent) {
        return res.status(400).json({ message: "ID du post et contenu requis " });
    }
    

    // On récupre le chemin de la nouvelle image dans le post si elle existe.
    const fullPath = req.filePath; 
    let imageToSend = null;

    // Si une image a été uploadée, on construit l'URL de l'image
    if (fullPath) {
        const imageName = path.basename(fullPath);
        imageToSend = `http://localhost:3000/images/${imageName}`;
    }




    Post.findOneAndUpdate( 
        // Arguments pour rechercher le post.
        {currentUserId : currentUserId, _id : postId},
        // Contenu à modifier
        {content : newContent, imageInChat: imageToSend},
        // On ajoute cette ligne pour que le updatedPost dans le .then ait les modifications.
        {new : true}
    )
        .then((updatedPost) => {
            if(!updatedPost) {
                return res.status(404).json({message : "Post non trouvé"})
            } 
            res.status(200).json(updatedPost)
        })
        .catch(error => res.status(500).json({error}))
}




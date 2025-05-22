const GroupMessage = require('../models/group')
const path = require('path')
const bcrypt = require('bcrypt');
const GroupPost = require('../models/groupPost')

exports.createGroup = (req,res,next) => {
    // On récupère les données du formulaire.
    const {
        groupName,
        groupDescription,
        groupType,
        groupLanguages,
        groupCategories,
        groupPassword,
        fullPath
    } = req.body

    // On récupère l'id de l'utilisateur actuel
    const userId = req.auth.userId

    // Vérification des champs requis
    if (!groupName || !groupDescription || !groupType || !groupLanguages || !groupCategories || !fullPath || !userId) {
         return res.status(400).json({ message: 'Tous les champs doivent être remplis.' });
    }

    // On gère le chemin de l'image (pour la récupèrer depuis le serveur localhost:\\3000)
    const imageName = path.basename(fullPath);
    const groupLogo = `http://localhost:3000/images/${imageName}`;

    // On crée une variable pour stocker le mot de passe hashé (null s'il n'y en a pas)
    let hashedPassword = null;

    // On initialise le modèle pour que MongoDB prenne en compte les champs required etc..
    GroupMessage.init()
        .then( async () => {

            // Si le type de groupe est restreint, on stocke le mot de passe hashé (sinon, il reste à null)
            if (groupType === 'Restreint' && groupPassword) {
                hashedPassword = await bcrypt.hash(groupPassword, 10);
            }

            // Création du groupe avec le modèle mongoose
            const newGroup = new GroupMessage({
                groupName : groupName,
                groupDescription : groupDescription,
                groupType : groupType,
                groupPassword : hashedPassword,
                groupLanguages : groupLanguages,
                groupCategories : groupCategories,
                groupLogoPath : groupLogo,
                creator : userId,
                members : [userId]
            });

            // On sauvegarde le groupe
            newGroup.save()
                .then((savedGroup) => res.status(201).json({ message: 'groupe créé', group: savedGroup}))
                .catch( () => res.status(400).json({ message: 'Erreur lors de la sauvegarde du groupe'}))
        })
        .catch( () => res.status(500).json({ message: "Erreur lors de l'initialisation du modèle" }))
}

// Cette méthode permet de récupérer les groupes de l'utilisateur
exports.myGroup = (req,res,next) =>{

    // On récupère l'userId dans le token
    const userId = req.auth.userId

    // On cherche les groupes contenant l'userId dans les membres
    GroupMessage.find({members : userId})

        // On retire le mot de passe de la réponse au frontend
        .select('-groupPassword')

        // On récupère les informations sur le créateur
        .populate('creator', 'loginInfo.username image')

        // On récupère les informations sur les membres
        .populate('members', 'loginInfo.username image')

        .then( groups => {

            // On retourne les groupes dans un JSON
            res.status(200).json(groups)
        })
        .catch( () => res.status(500).json( { message : "Erreur lors de la recherhche"}))
}

// Cette méthode permet de récupérer les 10 derniers messages entre deux utilisateurs.
exports.getPreviousPosts = (req, res, next) => {
    const groupId = req.query.groupId;

    // On récupère le nombre de messages à ignorer.
    const skip = parseInt(req.query.skip)

    // On vérifie que otherUserId existe bien dans la requete.
    if (!groupId) {
        return res.status(400).json({ message: "L'id du groupe est manquant" });
    }

    // On cherche les posts contenant l'utilisateur actuel en tant qu'envoyeur ou receveur du message.
    GroupPost.find({ groupId })

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

// Cette méthode permet de sauvegarder un Post sur le serveur.
exports.savePost = (req, res, next) => {
    const { groupId, senderId, senderUsername, senderProfileImage, content } = req.body;

    // Chemin de l'image, s'il y en a une
    const fullPath = req.filePath; 

    // Vérification des champs requis
    if ( !groupId || !senderId || !senderUsername || !senderProfileImage || !content ) {
        return res.status(400).json({ message: 'Tous les champs doivent être remplis.' });
    }

    // On met l'image dans le message à "null" par défaut
    let imageToSend = null;

    // Si une image a été uploadée, on construit l'URL de l'image
    if (fullPath) {
        const imageName = path.basename(fullPath);
        imageToSend = `http://localhost:3000/images/${imageName}`;
    }

    GroupPost.init()
        .then(async () => {
            // Création du post
            const groupPost = new GroupPost({
                postId: 'attente', // Placeholder jusqu'à la sauvegarde
                groupId: groupId,
                senderId: senderId,
                senderUsername : senderUsername,
                senderProfileImage: senderProfileImage,
                content : content,
                timestamp: new Date(),
                imageInChat: imageToSend // URL de l'image si elle existe
            });

            groupPost.save()
                .then((savedPost) => {
                    // Mise à jour de postId avec l'ID du post nouvellement créé
                    savedPost.postId = savedPost._id;
                    savedPost.save()
                        .then((savedPost) => res.status(201).json({ message: 'GroupPost créé', postId: savedPost._id, imageInChat: savedPost.imageInChat }))
                        .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
                })
                .catch(error => res.status(400).json({ message: 'Erreur lors de la sauvegarde du post' }));
        })
        .catch(error => res.status(400).json({ message: "Erreur dans l'initialisation du modèle" }));
};

// Cette méthode permet de modifier le contenu d'un post.
exports.updatePost = (req, res, next) => {

    // On récupère l'id du post, le nouveau contenu.
    const postId = req.body.postId;
    const newContent = req.body.content

    // On récupère la varaible nous informant s'il faut supprimer l'image actuelle de l'utilisateur
    const removeImage = req.body.removeImage

    // On récupère l'image actuelle du post à modifier
    const previousImage = req.body.previousImage;
    
    // On récupère l'userId
    const senderId = req.auth.userId;

    // Vérification que postId et newContent sont présents
    if (!postId || !newContent || !senderId) {
        return res.status(400).json({ message: "ID du post et contenu requis " });
    }

    // On récupère le chemin de la nouvelle image dans le post si elle existe.
    const fullPath = req.filePath; 
    let imageToSend = null;

    // L'image est supprimée, mais une nouvelle est uploadée
    if (removeImage && fullPath) {     
        const imageName = path.basename(fullPath);
        imageToSend = `http://localhost:3000/images/${imageName}`;

    // L'image est supprimée et aucune nouvelle n'est ajoutée
    } else if (removeImage && !fullPath) {
        imageToSend = null;

    // L'image existante est remplacée sans suppression explicite
    } else if (!removeImage && fullPath) {
        const imageName = path.basename(fullPath);
        imageToSend = `http://localhost:3000/images/${imageName}`;

    // Aucun changement : on garde l'image actuelle
    } else {
        imageToSend = previousImage
    }

    // On met à jour le post
    GroupPost.findOneAndUpdate( 
        // Arguments pour rechercher le post.
        {senderId : senderId, _id : postId},
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

// Cette méthode permet de supprimer un post sur le serveur.
exports.deletePost = (req, res, next) => {
    try{
        // On récupère le postId.
        const postId = req.query.postId;

        // On récupère l'userId
        const senderId = req.auth.userId;

        // On supprime le post en fonction du currentUserId et du postId.
        GroupPost.findOneAndDelete({ senderId: senderId, _id : postId })
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

// Cette méthode permet de donner la liste des groupes à rejoindre en fonction des critères fournis
exports.joinAGroup = (req, res, next) => {

    // On récupère les données de la requête
    const {groupName, groupType, groupLanguages, groupCategories} = req.body

    // On crée la variable qui contiendra les filtres à passer à  MongoDB
    const query = {}

    // On ajoute le filtre lié au nom du groupe s'il y en a un
    if (groupName) {
        
        // On ajoute le paramètre "i" pour insensible à la casse
        query.groupName = { $regex: new RegExp(groupName, 'i') }; 
    }

    // On ajoute le filtre lié au type de groupe
    if (groupType) {
        query.groupType = groupType;
    }

    // On ajoute le filtre lié aux languages sélectionnés
    if (groupLanguages && groupLanguages.length > 0) {
        query.groupLanguages = { $all: groupLanguages };
    }

    // On ajoute le filtre lié aux catégories sélectionnées
    if (groupCategories && groupCategories.length > 0) {
        query.groupCategories = { $all: groupCategories };
    }

    // On recherche les groupes correspondant au filtre
    GroupMessage.find(query)

        // On ne retourne pas le mot de passe au front
        .select('-groupPassword')

        // On récupère les informations sur le créateur
        .populate('creator', 'loginInfo.username image')

        // On récupère les informations sur les membres
        .populate('members', 'loginInfo.username image')

        // On retourne les groupes correspondant au format JSON
        .then(groups =>{
            console.log(groups)
            res.status(200).json(groups)
        })

        // En cas d'erreur, on retourne une erreur
        .catch( () => res.status(500).json( {message : "Une erreur est survenue lors de la recherche"}))
}
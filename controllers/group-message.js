const GroupMessage = require('../models/group')
const path = require('path')
const bcrypt = require('bcrypt');

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
                groupLogo : groupLogo,
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
        
        .then( groups => {

            // On retourne les groupes dans un JSON
            console.log(groups)
            res.status(200).json(groups)
        })
        .catch( () => res.status(500).json( { message : "Erreur lors de la recherhche"}))
}
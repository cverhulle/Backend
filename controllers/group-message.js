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
            const newGroup = new GroupMessage({
                groupName : groupName,
                groupDescription : groupDescription,
                groupType : groupType,
                // On ajoute le mot de passe que si le groupe est restreint
                groupPassword : groupType === 'Restreint' ? groupPassword : null,
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
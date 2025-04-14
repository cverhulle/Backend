const GroupMessage = require('../models/group')
const path = require('path')

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

    GroupMessage.init()
        .then( async () => {
            const newGroup = new GroupMessage({
                groupName : groupName,
                groupDescription : groupDescription,
                groupType : groupType,
                groupPassword : groupType === 'Restreint' ? groupPassword : null,
                groupLanguages : groupLanguages,
                groupCategories : groupCategories,
                groupLogo : groupLogo,
                creator : userId,
                members : [userId]
            });

            newGroup.save()
                .then(() => res.status(201).json({ message: 'groupe créé'}))
                .catch( (savedGroup) => res.status(400).json({ message: 'Erreur lors de la sauvegarde du groupe', group: savedGroup }))
        })
        .catch( () => res.status(500).json({ message: "Erreur lors de l'initialisation du modèle" }))
}
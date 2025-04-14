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
}
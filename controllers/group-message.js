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
        groupPassword
    } = req.body

    // On récupère le chemin de l'image.
    const fullPath = req.filePath;
    
    // Vérification des champs requis
    if (!groupName || !groupDescription || !groupType || !groupLanguages || !groupCategories || !fullPath) {
         return res.status(400).json({ message: 'Tous les champs doivent être remplis.' });
    }
}
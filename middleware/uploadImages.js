const fs = require('fs');
const path = require('path');

const uploadMiddleware = (req, res, next) => {
    if (!req.headers['file-name'] || !req.pipe) {
        return res.status(400).json({ message: 'Nom de fichier manquant.' });
    }

    // On crée le chemin pour stocker l'image et, on ajoute Date.now() pour garantir l'unicité des fichiers.
    const filePath = path.join(__dirname, 'images', Date.now() + '-' + req.headers['file-name']);
    const writeStream = fs.createWriteStream(filePath);

    // Transferer les données de la requete vers un fichier.
    req.pipe(writeStream);

    writeStream.on('finish', () => {
        req.filePath = filePath; // Ajouter le chemin du fichier à la requête
        next(); // Passer au middleware suivant
    });

    writeStream.on('error', (err) => {
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
    });
};

module.exports = uploadMiddleware;
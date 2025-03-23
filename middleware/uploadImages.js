const fs = require('fs');
const path = require('path');

// Ce middleware permet de gérer le téléchargement d'images.
const uploadMiddleware = (req, res, next) => {

    // On vérifie que le contenu de la requête  est 'multipart/form-data'
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        
        // Cette variable va stocker les données de la requête.
        let body = '';

        // On écoute les données envoyées dans la requête
        req.on('data', chunk => {
            // On accumule les morceaux de données dans la variable body.
            body += chunk.toString(); 
        });

        // On écoute la fin de l'envoi des données
        req.on('end', () => {

            // On extrait la frontière utilisée pour séparer les parties dans les données multipart
            const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];

            // On sépare les différentes parties du corps de la requête en utilisant la frontière
            const parts = body.split(`--${boundary}`);
            
            // On traite chaque partie 
            parts.forEach(part => {
                // Si la partie contient un nom de fichier...
                if (part.includes('filename=')) {
                    // On extrait ce nom
                    const filename = part.match(/filename="([^"]+)"/)[1];

                    // On extrait le contenu du fichier
                    const fileContent = part.split('\r\n\r\n')[1].split('\r\n--')[0];

                    // On crée le chemin pour enregistrer le fichier (dossier images)
                    const filePath = path.join(__dirname, '../images', Date.now() + '-' + filename);

                    // On écrit le contenu du fichier dans le système de fichiers.
                    fs.writeFile(filePath, fileContent, { encoding: 'binary' }, (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
                        }
                        // On ajoute le chemin du fichier à la requête
                        req.filePath = filePath; 
                        next(); 
                    });
                }
            });
        });

        req.on('error', err => {
            return res.status(500).json({ message: 'Erreur lors de la lecture des données.' });
        });
    } else {
        return res.status(400).json({ message: 'Type de contenu non supporté.' });
    }
};

module.exports = uploadMiddleware;
const fs = require('fs');
const path = require('path');

// Middleware pour gérer le téléchargement d'images.
const uploadMiddleware = (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        const chunks = [];

        // Écoute les données envoyées dans la requête
        req.on('data', chunk => {
            chunks.push(chunk); // Stocke chaque morceau en tant que Buffer
        });

        // Écoute la fin de l'envoi des données
        req.on('end', () => {
            const body = Buffer.concat(chunks); // Concatène tous les Buffer en un seul
            const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
            const boundaryString = `--${boundary}`;
            const boundaryBuffer = Buffer.from(boundaryString);

            // Convertit le Buffer en chaîne de caractères pour la manipulation
            const bodyString = body.toString('utf-8');
            const parts = bodyString.split(boundaryString).filter(part => part.trim() !== '' && !part.trim().startsWith('--'));

            parts.forEach(part => {
                if (part.includes('filename=')) {
                    const filenameMatch = part.match(/filename="([^"]+)"/);
                    if (!filenameMatch) return; // Si aucun nom de fichier n'est trouvé

                    const filename = filenameMatch[1];
                    const start = part.indexOf('\r\n\r\n') + 4; // Commencer juste après les en-têtes
                    const end = part.lastIndexOf(`--${boundaryString}`) - 2; // Fin de la partie

                    // Extraire le contenu du fichier
                    const fileContent = Buffer.from(part.slice(start, end), 'binary');

                    // Créer le chemin pour enregistrer le fichier
                    const filePath = path.join(__dirname, '../images', Date.now() + '-' + filename);

                    console.log('Taille du contenu du fichier:', fileContent.length);
                    console.log('Nom du fichier:', filename);
                    console.log('Contenu du fichier (premiers 100 caractères):', fileContent.toString('utf-8', 0, 100));

                    // Écrire le contenu du fichier dans le système de fichiers
                    fs.writeFile(filePath, fileContent, (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
                        }
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
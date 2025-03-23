const fs = require('fs');
const path = require('path');

const uploadMiddleware = (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        let body = Buffer.alloc(0);

        req.on('data', chunk => {
            body = Buffer.concat([body, chunk]);
        });

        req.on('end', () => {
            const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
            const parts = body.toString().split(`--${boundary}`).filter(part => part && part !== '--');

            parts.forEach(part => {
                if (part.includes('filename=')) {
                    const filenameMatch = part.match(/filename="([^"]+)"/);
                    const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

                    const start = part.indexOf('\r\n\r\n') + 4;
                    const end = part.lastIndexOf(`--${boundary}`);
                    const fileContent = part.slice(start, end).trim();

                    const filePath = path.join(__dirname, '../images', Date.now() + '-' + filename);

                    console.log('Taille du contenu du fichier:', fileContent.length);
                    console.log('Nom du fichier:', filename);
                    console.log('Contenu du fichier (premiers 100 caractères):', fileContent.slice(0, 100));
                    
                    // Utilise l'encodage binaire lors de l'écriture
                    fs.writeFile(filePath, fileContent, { encoding: 'binary' }, err => {
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
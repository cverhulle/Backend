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
            const bodyString = body.toString('binary'); // Convertir le Buffer en chaîne binaire
            const parts = bodyString.split(`--${boundary}`).filter(part => part && part !== '--');

            parts.forEach(part => {
                if (part.includes('filename=')) {
                    const filenameMatch = part.match(/filename="([^"]+)"/);
                    const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

                    // Validation du type de fichier
                    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
                    const extname = path.extname(filename).toLowerCase();
                    if (!validExtensions.includes(extname)) {
                        return res.status(400).json({ message: 'Type de fichier non supporté.' });
                    }

                    const start = part.indexOf('\r\n\r\n') + 4;
                    const end = part.lastIndexOf(`--${boundary}`);
                    const fileContent = part.slice(start, end); // Ne pas utiliser trim ici

                    const filePath = path.join(__dirname, '../images', Date.now() + '-' + path.basename(filename));

                    // Écriture binaire du fichier
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
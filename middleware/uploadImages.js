const fs = require('fs');
const path = require('path');

const uploadMiddleware = (req, res, next) => {

    // On vérifie que la requête est bien de type multipart/data
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
        
        // On initialise un buffer vide pour stocker les données de la requête
        let body = Buffer.alloc(0);

        // On déclenche un évenemnt lorsqu'une nouvelle portion donnée est reçue.
        req.on('data', chunk => {
            // Ajout des données reçues au buffer.
            body = Buffer.concat([body, chunk]);
        });

        // On déclenche cette évenement lorsque toutes les données sont reçues.
        req.on('end', () => {
            // On récupère la partie de "content-type" qui nous interesse.
            const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];

            // On convertit le buffer "body" en chaine de caractères binaires.
            const bodyString = body.toString('binary'); 

            // On découpe la chaîne bodyString en parties grâce à boundary
            const parts = bodyString.split(`--${boundary}`).filter(part => part && part !== '--');

            // Pour chaque partie...
            parts.forEach(part => {

                // Si la partie contient un fichier...
                if (part.includes('filename=')) {

                    // On extrait le nom du fichier
                    const filenameMatch = part.match(/filename="([^"]+)"/);
                    const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

                    // Validation du type de fichier dans la requête
                    const validExtensions = ['.jpg', '.jpeg', '.png'];
                    const extname = path.extname(filename).toLowerCase();
                    if (!validExtensions.includes(extname)) {
                        return res.status(400).json({ message: 'Type de fichier non supporté.' });
                    }

                    // On identifie la position de début et de fin du contenu du fichier.
                    const start = part.indexOf('\r\n\r\n') + 4;
                    const end = part.lastIndexOf(`--${boundary}`);

                    // On extrait le contenu binaire crrespondant au fichier
                    const fileContent = part.slice(start, end); 

                    // On crée le chemin où le fichier sera enregistré.
                    const filePath = path.join(__dirname, '../images', Date.now() + '-' + path.basename(filename));

                    // Écriture du contenu sur le disque
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

        // On gère l'erreur lors de la réception des données
        req.on('error', err => {
            return res.status(500).json({ message: 'Erreur lors de la lecture des données.' });
        });

    // Réponse si le type de contenu n'est pas supporté.
    } else {
        return res.status(400).json({ message: 'Type de contenu non supporté.' });
    }
};

module.exports = uploadMiddleware;
const fs = require('fs');
const path = require('path');

// Middleware qui gère le parsing d’un formulaire multipart et l’enregistrement du fichier image.
const uploadMiddleware = (req, res, next) => {

  // Vérifie que la requête est bien multipart/form-data.
  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {

    // Initialise un buffer pour stocker les données brutes de la requête.
    let body = Buffer.alloc(0);

    // À chaque portion de données reçue, on les ajoute au buffer.
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk]);
    });

    // Une fois toutes les données reçues.
    req.on('end', () => {

      // Récupère le "boundary" utilisé pour séparer les parties du formulaire.
      const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];

      // Convertit le buffer en string avec encodage latin1 (préserve les accents ET les fichiers binaires : image).
      const bodyString = body.toString('latin1');

      // Découpe chaque partie du formulaire grâce au boundary.
      const parts = bodyString.split(`--${boundary}`).filter(part => part && part !== '--');

      // Variable pour stocker les champs du formulaire.
      const formData = {};

      // Variable pour savoir si un fichier est trouvé.
      let fileFound = false;

      // On parcourt chaque partie du formulaire
      parts.forEach(part => {

        // Si la partie contient un fichier
        if (part.includes('filename=')) {
          fileFound = true;

          // Extrait le nom du fichier (sinon nom par défaut).
          const filenameMatch = part.match(/filename="([^"]+)"/);
          const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';

          // Vérifie que le fichier est bien une image autorisée.
          const validExtensions = ['.jpg', '.jpeg', '.png'];
          const extname = path.extname(filename).toLowerCase();
          if (!validExtensions.includes(extname)) {
            return res.status(400).json({ message: 'Type de fichier non supporté.' });
          }

          // Trouve l’endroit où commence le contenu du fichier dans le buffer.
          const headerEnd = part.indexOf('\r\n\r\n');
          const partStartInBuffer = body.indexOf(part, 'latin1');
          const fileStart = partStartInBuffer + headerEnd + 4;

          // Trouve la fin du fichier (avant le prochain boundary).
          const fileEnd = body.indexOf(`\r\n--${boundary}`, fileStart, 'latin1');

          // Extrait les données binaires du fichier à partir du buffer brut.
          const fileContent = body.slice(fileStart, fileEnd);

          // Construit le chemin d’enregistrement du fichier.
          const filePath = path.join(__dirname, '../images', Date.now() + '-' + path.basename(filename));

          // Sauvegarde du fichier image sur le disque.
          fs.writeFile(filePath, fileContent, err => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
            }

            // Enregistre le chemin dans req.filePath et formData.
            formData.fullPath = filePath;
            req.filePath = filePath;

            // Injecte les données dans req.body pour le contrôleur suivant.
            req.body = formData;
            next();
          });

        } else {
          // Si ce n'est pas un fichier : c’est un champ texte.

          // Récupère le nom du champ (ex : groupName).
          const nameMatch = part.match(/name="([^"]+)"/);
          const name = nameMatch ? nameMatch[1] : null;

          // Récupère la valeur brute du champ.
          const headerEnd = part.indexOf('\r\n\r\n');
          const rawValue = part.slice(headerEnd + 4).trim();

          // Décode la valeur en UTF-8 pour avoir les accents corrects.
          const value = Buffer.from(rawValue, 'latin1').toString('utf8');

          // Si le champ est un tableau (géré en plusieurs parties avec le même name).
          if (name) {
            if (name === 'groupLanguages' || name === 'groupCategories') {
              if (formData[name]) {
                formData[name] = Array.isArray(formData[name])
                // Ajoute la valeur à un tableau existant
                    ? [...formData[name], value]       
                    // Transforme en tableau si 2e élément  
                    : [formData[name], value];           
              } else {
                    // Première valeur
                    formData[name] = value;                
              }
            } else {
                // Champ texte classique
                formData[name] = value;                  
            }
          }
        }
      });

      // S’assure que les champs tableaux sont bien sous forme d’array (même avec une seule valeur)
      if (typeof formData.groupLanguages === 'string') {
        formData.groupLanguages = [formData.groupLanguages];
      }

      if (typeof formData.groupCategories === 'string') {
        formData.groupCategories = [formData.groupCategories];
      }

      // Injection finale de toutes les données dans req.body
      req.body = formData;

      // S’il n’y avait pas de fichier, on passe quand même au contrôleur suivant
      if (!fileFound) {
        next();
      }
    });

    // Gestion des erreurs de réception de la requête
    req.on('error', err => {
      return res.status(500).json({ message: 'Erreur lors de la lecture des données.' });
    });

  } else {
    // Si le type de contenu n’est pas multipart/form-data
    return res.status(400).json({ message: 'Type de contenu non supporté.' });
  }
};

// On exporte le middleware
module.exports = uploadMiddleware;
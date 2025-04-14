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
      const bodyString = body.toString('latin1'); // préserve les accents + ne casse pas le binaire

      const parts = bodyString.split(`--${boundary}`).filter(part => part && part !== '--');
      const formData = {};
      let fileFound = false;

      parts.forEach(part => {
        if (part.includes('filename=')) {
          fileFound = true;

          const filenameMatch = part.match(/filename="([^"]+)"/);
          const filename = filenameMatch ? filenameMatch[1] : 'uploaded-file';
          const validExtensions = ['.jpg', '.jpeg', '.png'];
          const extname = path.extname(filename).toLowerCase();

          if (!validExtensions.includes(extname)) {
            return res.status(400).json({ message: 'Type de fichier non supporté.' });
          }

          const headerEnd = part.indexOf('\r\n\r\n');
          const partStartInBuffer = body.indexOf(part, 'latin1');
          const fileStart = partStartInBuffer + headerEnd + 4;
          const fileEnd = body.indexOf(`\r\n--${boundary}`, fileStart, 'latin1');
          const fileContent = body.slice(fileStart, fileEnd);

          const filePath = path.join(__dirname, '../images', Date.now() + '-' + path.basename(filename));
          fs.writeFile(filePath, fileContent, err => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
            }
            formData.fullPath = filePath;
            req.filePath = filePath;
            req.body = formData;
            next();
          });
        } else {
          const nameMatch = part.match(/name="([^"]+)"/);
          const name = nameMatch ? nameMatch[1] : null;
          const headerEnd = part.indexOf('\r\n\r\n');
          const rawValue = part.slice(headerEnd + 4).trim();
          const value = Buffer.from(rawValue, 'latin1').toString('utf8'); // ❤️ accents

          if (name) {
            if (name === 'groupLanguages' || name === 'groupCategories') {
              if (formData[name]) {
                formData[name] = Array.isArray(formData[name])
                  ? [...formData[name], value]
                  : [formData[name], value];
              } else {
                formData[name] = value;
              }
            } else {
              formData[name] = value;
            }
          }
        }
      });

      // Transforme les champs uniques en tableau si nécessaire
      if (typeof formData.groupLanguages === 'string') {
        formData.groupLanguages = [formData.groupLanguages];
      }

      if (typeof formData.groupCategories === 'string') {
        formData.groupCategories = [formData.groupCategories];
      }

      req.body = formData;
      if (!fileFound) next(); // on continue même s'il n'y a pas d'image
    });

    req.on('error', err => {
      return res.status(500).json({ message: 'Erreur lors de la lecture des données.' });
    });
  } else {
    return res.status(400).json({ message: 'Type de contenu non supporté.' });
  }
};

module.exports = uploadMiddleware;

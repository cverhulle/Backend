const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
        // On extrait le token du header Authorization de la requête entrante (en enlevant le mot-clé Bearer).
         const token = req.headers.authorization.split(' ')[1];
        
        // On vérifie le token de la requete avec la méthode verify de jsonwebtoken.
        const decodedToken = jwt.verify(token, 'TOKEN_SECRET');
        
        // On extraie l'ID du token décodé pour pouvoir l'exploiter dans nos routes.
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();

   } catch(error) {
       res.status(401).json({ error });
   }
};


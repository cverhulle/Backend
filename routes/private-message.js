const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const privateMessageCtrl = require('../controllers/private-message') ;
const uploadImages = require('../middleware/uploadImages')



// Route permettant de chercher les utilisateurs sur la homepage
router.get('/queryUsers', auth, privateMessageCtrl.queryUsers)

// Route permettant de récupérer les posts d'une discussion
router.get('/getPosts', auth, privateMessageCtrl.getPosts)

// Route permettant de récupérer des posts à l'appui sur le bouton "Plus de messages"
router.get('/getPosts/previous', auth, privateMessageCtrl.getPreviousPosts)

// Route permettant de sauvegarder le nouveau Post
router.post('/send-message', auth, uploadImages, privateMessageCtrl.savePost)

// Route permettant de supprimer un post
router.delete('/deletePost', auth, privateMessageCtrl.deletePost)

// Route permettant de mettre à jour un post
router.put('/updatePost', auth, uploadImages, privateMessageCtrl.updatePost)


module.exports = router;
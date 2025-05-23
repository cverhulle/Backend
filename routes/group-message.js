const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadImages = require('../middleware/uploadImages')
const groupMessageCtrl = require('../controllers/group-message')

// Route qui permet de créer un groupe
router.post('/create-group', auth, uploadImages, groupMessageCtrl.createGroup);

// Route permettant de récupérer les groupes de l'utilisateur
router.get('/my-group', auth, groupMessageCtrl.myGroup);

// Route permettant de récupérer les messages d'une discussion
router.get('/getPreviousPosts', auth, groupMessageCtrl.getPreviousPosts)

// Route permettant d'envoyer un message dans le chat
router.post('/send-message', auth, uploadImages, groupMessageCtrl.savePost)

// Route permettant de mettre à jour un GroupPost
router.put('/updatePost', auth, uploadImages, groupMessageCtrl.updatePost)

// Route permettant de supprimer un GroupPost
router.delete('/deletePost', auth, groupMessageCtrl.deletePost)

// Route permettant de chercher les groupes à rejoindre
router.post('/join-a-group', auth, groupMessageCtrl.joinAGroup)

// Route permettant d'ajouter un utilisateur à un groupe
router.post('/add-user', auth, groupMessageCtrl.addUserToAGroup)

module.exports = router;
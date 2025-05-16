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
router.put('/updateGroupPost', auth, uploadImages, groupMessageCtrl.updatePost)

// Route permettant de supprimer un GroupPost
router.delete('/deleteGroupPost', auth, groupMessageCtrl.deletePost)

module.exports = router;
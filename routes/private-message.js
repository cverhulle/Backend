const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const privateMessageCtrl = require('../controllers/private-message') ;
const uploadImages = require('../middleware/uploadImages')




router.get('/queryUsers', auth, privateMessageCtrl.queryUsers)
router.get('/getPosts', auth, privateMessageCtrl.getPosts)
router.get('/getPosts/previous', auth, privateMessageCtrl.getPreviousPosts)
router.post('/send-message', auth, uploadImages, privateMessageCtrl.savePostImageTest)
router.delete('/deletePost', auth, privateMessageCtrl.deletePost)
router.put('/updatePost', auth, privateMessageCtrl.updatePost)


module.exports = router;
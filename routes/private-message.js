const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const privateMessageCtrl = require('../controllers/private-message') ;



router.get('/queryUsers', auth, privateMessageCtrl.queryUsers)
router.get('/getPosts', auth, privateMessageCtrl.getPosts)
router.post('/post', auth, privateMessageCtrl.savePost)


module.exports = router;
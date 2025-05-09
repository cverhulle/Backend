const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadImages = require('../middleware/uploadImages')
const groupMessageCtrl = require('../controllers/group-message')

// Route qui permet de créer un groupe
router.post('/create-group', auth, uploadImages, groupMessageCtrl.createGroup)

router.get('/my-group', auth, groupMessageCtrl.myGroup)


module.exports = router;
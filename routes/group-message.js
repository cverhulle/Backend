const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadImages = require('../middleware/uploadImages')
const groupMessageCtrl = require('../controllers/group-message')

router.post('/create-group', auth, uploadImages, groupMessageCtrl.createGroup)


module.exports = router;
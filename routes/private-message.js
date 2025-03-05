const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const privateMessageCtrl = require('../controllers/private-message') ;



router.get('/queryUsers', auth, privateMessageCtrl.queryUsers)


module.exports = router;
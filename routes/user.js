const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');



router.post('/register/email', userCtrl.emailExists)
router.post('/register/username', userCtrl.usernameExists)
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);


module.exports = router;



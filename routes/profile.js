const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile');
const auth = require('../middleware/auth');



router.use('/:id', profileCtrl.getProfile);



module.exports = router;

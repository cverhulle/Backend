const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile');
const auth = require('../middleware/auth');



router.get('', auth, profileCtrl.getProfile);
router.put('/modify', auth, profileCtrl.modifyProfile)


module.exports = router;

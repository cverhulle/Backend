const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile');
const auth = require('../middleware/auth');



router.get('', auth, profileCtrl.getProfile);
router.put('/modify', auth, profileCtrl.modifyProfile)
router.put('/modifyPassword', auth, profileCtrl.modifyPassword)
router.post('/email', auth, profileCtrl.emailTaken)
router.post('/username', auth, profileCtrl.usernameTaken)
router.delete('/deleteAccount', auth, profileCtrl.deleteAccount)


module.exports = router;

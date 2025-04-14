const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


router.post('/create-group', auth, uploadImages)


module.exports = router;
const express = require('express');
const mainCtrl = require('../controllers/main');
const router = express.Router();

/* GET homepage */
router.get('/', mainCtrl.index);

module.exports = router;

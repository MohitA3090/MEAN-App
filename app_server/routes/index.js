const express = require('express');
const locationsCtrl = require('../controllers/locations');
const othersCtrl = require('../controllers/others');

const router = express.Router();

/* Location Pages */
router.get('/', locationsCtrl.homeList);
router.get('/location', locationsCtrl.locationInfo);
router.get('/location/review/new', locationsCtrl.addReview);

/* Other Pages */
router.get('/about', othersCtrl.about);

module.exports = router;

const express = require('express');
const locationsCtrl = require('../controllers/locations');
const othersCtrl = require('../controllers/others');

const router = express.Router();

/* Location Pages */
router.get('/', locationsCtrl.homeList);
router.get('/location/:locationId', locationsCtrl.locationInfo);

/* Review Pages */
router
    .get('/location/:locationId/review/new', locationsCtrl.addReview)
    .post('/location/:locationId/review/new', locationsCtrl.doAddReview);

/* Other Pages */
router.get('/about', othersCtrl.about);

module.exports = router;

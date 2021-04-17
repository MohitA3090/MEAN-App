const express = require('express');
const locationsCtrl = require('../controllers/locations');
const reviewsCtrl = require('../controllers/reviews');

const router = express.Router();

/* Location Apis */
router.route('/locations')
    .get(locationsCtrl.locationsListByDistance)
    .post(locationsCtrl.locationsCreate);
router.route('/locations/:locationId')
    .get(locationsCtrl.locationsReadOne)
    .put(locationsCtrl.locationsUpdateOne)
    .delete(locationsCtrl.locationsDeleteOne);

/* Review Apis */
router.route('/locations/:locationId/reviews')
    .post(reviewsCtrl.reviewsCreate);
router.route('/locations/:locationId/reviews/:reviewId')
    .get(reviewsCtrl.reviewsReadOne)
    .put(reviewsCtrl.reviewsUpdateOne)
    .delete(reviewsCtrl.reviewsDeleteOne);
    
module.exports = router;

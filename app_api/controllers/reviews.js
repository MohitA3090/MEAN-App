const mongoose = require('mongoose');
const Location = mongoose.model('Location');

const doSetAverageRating = (location) => {
    if(location.reviews && location.reviews.length > 0) {
        const count = location.reviews.length;
        const total = location.reviews.reduce((acc, {rating}) => {
            return acc + rating;
        },0);
        location.rating = parseInt(total/count);
        location.save(err => {
            if(err) {
                console.log(err);
            }
            else {
                console.log(`Average rating of ${location.name} updated to ${location.rating}`);
            }
        });
    }
}

const updateAverageRating = (locationId) => {
    Location
        .findById(locationId)
        .select('rating reviews')
        .exec((err, location) => {
            if(!err) {
                doSetAverageRating(location);
            }
    });
}

const doAddReview = (req, res, location) => {
    if(!location) {
        return res
            .status(404)
            .json({"message": "Location not found"})
    }
    else {
        const { author, rating, reviewText } = req.body;
        location.reviews.push({
            author, rating, reviewText
        });
        location.save((err, location1) => {
            if(err) {
                return res
                    .status(400)
                    .json(err);
            }
            else {
                updateAverageRating(location1._id);
                const thisReview = location1.reviews.slice(-1).pop();
                return res
                    .status(201)
                    .json(thisReview);
            }
        });
    }
}

const reviewsCreate = (req, res) => {
    const locationId = req.params.locationId;
    if(locationId) {
        Location
            .findById(locationId)
            .select('reviews')
            .exec((err, location) => {
                if(err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    return doAddReview(req, res, location);
                }
            });
    } else {
        res
            .status(404)
            .json({"message": "Location not found"});
    }
};

const reviewsReadOne = (req, res) => {
    Location.findById(req.params.locationId)
        .select('name reviews')
        .exec((err, location) => {
            if(!location) {
                return res
                    .status(404)
                    .json({
                        "message": "location not found"
                    });
            }
            else if(err) {
                return res
                    .status(400)
                    .json(err);
            }
            else if (location.reviews && location.reviews.length > 0) {
                const review = location.reviews.id(req.params.reviewId);
                if(!review) {
                    return res
                        .status(404)
                        .json({
                            "message": "Review not found for given reviewId"
                        });
                }
                else {
                    const response = {
                        location: {
                            name: location.name,
                            id: req.params.locationId
                        },
                        review
                    };
                    return res
                        .status(200)
                        .json(response);
                }     
            }
            else {
                return res
                    .status(404)
                    .json({
                        "message": "No Review found"
                    })
            }
    });
};
const reviewsUpdateOne = (req, res) => {
    const { locationId, reviewId } = req.params;
    if(!locationId || !reviewId) {
        return res
            .status(404)
            .json({
                "message": "Not found, both locationId and reviewId are required"
            });
    }
    else {
        Location
            .findById(locationId)
            .select('reviews')
            .exec((err, location) => {
                if(!location) {
                    return res
                        .status(404)
                        .json({
                            "message": "Location not found for given locationId"
                        });
                }
                else if (err) {
                    return res
                        .status(400)
                        .json(err);
                }

                if(location.reviews && location.reviews.length > 0) {
                    const thisReview = location.reviews.id(reviewId);
                    if(!thisReview) {
                        return res
                            .status(404)
                            .json({
                                "message": "Review not found for given reviewId"
                            });
                    }
                    else {
                        thisReview.author = req.body.author;
                        thisReview.rating = req.body.review;
                        thisReview.reviewText = req.body.reviewText;
                        location.save((err1, location1) => {
                            if(err1) {
                                return res
                                    .status(404)
                                    .json(err1);
                            }
                            else {
                                updateAverageRating(location1);
                                return res
                                    .status(200)
                                    .json(thisReview);
                            }
                        });
                    }
                }
        });
    }
};
const reviewsDeleteOne = (req, res) => {
    const { locationId, reviewId } = req.params;
    if(!locationId || !reviewId) {
        return res
            .status(404)
            .json({
                "message": "Not found, both locationId and reviewId are required"
            });
    }
    else {
        Location
            .findById(locationId)
            .select('reviews')
            .exec((err, location) => {
                if(!location) {
                    return res
                        .status(404)
                        .json({
                            "message": "Location not found for given locationId"
                        });
                }
                else if (err) {
                    return res
                        .status(400)
                        .json(err);
                }

                if(location.reviews && location.reviews.length > 0) {
                    if(!location.reviews.id(reviewId)) {
                        return res
                            .status(404)
                            .json({
                                "message": "Review not found for given reviewId"
                            });
                    }
                    else {
                        location.reviews.id(reviewId).remove();
                        location.save( err1 => {
                            if(err1) {
                                return res
                                    .status(404)
                                    .json(err1);
                            }
                            else {
                                updateAverageRating(location);
                                return res
                                    .status(204)
                                    .json({
                                        "message": "Review deleted successfully"
                                    });
                            }
                        });
                    }
                }
        });
    }
};

module.exports = { reviewsCreate, reviewsReadOne, 
    reviewsUpdateOne, reviewsDeleteOne };
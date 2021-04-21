const mongoose = require('mongoose')
const Location = mongoose.model('Location');

const locationsListByDistance = async (req, res) => {
	const lng = parseFloat(req.query.lng);
	const lat = parseFloat(req.query.lat);
	const near = {
		type: "Point",
		coordinates : [
			lng, lat
		]
	};
	const geoOptions = {
		distanceField: "distance.calculated",
		spherical: true,
		maxDistance: 20000,
		limit: 10
	}

	try {
		const results = await Location.aggregate([
			{
				$geoNear: {
					near,
					...geoOptions
				}
			}
		]);

		const locations = results.map(result => {
			return {
				id: result._id,
				name: result.name,
				address: result.address,
				rating: result.rating,
				facilities: result.facilities,
				distance: `${result.distance.calculated.toFixed()}`
			}
		});
		return res
			.status(200)
			.json(locations);
	} catch(err) {
		console.log(err);
		return res
			.status(404)
			.json(err);
	} 
};

const locationsCreate = (req, res) => {
	Location.create({
		name: req.body.name,
		address: req.body.address,
		facilities: 
			req.body.facilities.split(","),
		coords: {
			type: "Point",
			coordinates: [
				parseFloat(req.body.lng),
				parseFloat(req.body.lat)
			]
		},
		openingTimes: [
			{
				days: req.body.days1,
				opening: req.body.opening1,
				closing: req.body.closing1,
				closed: req.body.closed1
			},
			{
				days: req.body.days2,
				opening: req.body.opening2,
				closing: req.body.closing2,
				closed: req.body.closed2 
			}
		]
	}, (err, location) => {
		if(err) {
			res
				.status(400)
				.json(err);
        } 
        else {
            res
                .status(201)
                .json(location);
        }
	})
};
const locationsReadOne = (req, res) => {
	console.log(req.params.locationId);
	console.log(Location)
	Location.findById(req.params.locationId)
		.exec((err, location) => {
			if(!location) {
				return res
					.status(404)
					.json({"message": "location not found"})
			}
			else if(err) {
				return res
					.status(400)
					.json(err);
			}
			else {
				return res
					.status(200)
					.json(location);
			}
	});
};
const locationsUpdateOne = (req, res) => {
    if(!req.params.locationId) {
        return res
            .status(404)
            .json({
                "message": "Not found, locationId is required"
            });
    }
    Location   
        .findById(req.params.locationId)
        .select('-reviews -rating')
        .exec((err, location) => {
            if(!location) {
                return res
                    .status(404)
                    .json({
                        "message": "Location not found for given locationId"
                    });
            }
            else if(err) {
                return res
                    .status(400)
                    .json(err);
            }
            else {
                location.name = req.body.name;
                location.address = req.body.address;
                location.facilities = req.body.facilities.split(",");
                location.coords = [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1,
                  }, 
                  {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2,
                }];
                location.save((err1, location1) => {
                    if(err1) {
                        return res
                            .status(404)
                            .json(err1);
                    }
                    else {
                        return res
                            .status(200)
                            .json(location1);
                    }
                });
            }
    });
};

const locationsDeleteOne = (req, res) => {
    const { locationId } = req.params;
    if(locationId) {
       Location
        .findByIdAndRemove(locationId)
        .exec((err, location) => {
            if(err) {
                return res
                    .status(404)
                    .json(err);
            }
            else {
                return res
                    .status(204)
                    .json({"message": "Location deleted successfully"});
            }
        }); 
    } 
    else {
        return res  
            .status(404)
            .json({"message": "Location not found for given locationId"});
    }
};

module.exports = { locationsListByDistance, locationsCreate, 
	locationsReadOne, locationsUpdateOne, locationsDeleteOne };

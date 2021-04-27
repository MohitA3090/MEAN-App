const request = require('request');
const apiOptions = {
  server: 'http://localhost:3000'
};

if(process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://pure-temple-67771.herokuapp.com';
}

const showError = (req, res, status) => {
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, Page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  }
  else {
    title = `${status}, Something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if(distance > 1000) {
    thisDistance = parseFloat(distance/1000).toFixed(1);
    unit = 'km';
  } 
  else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

const renderHomepage = (req, res, responseBody) => {
  let message = null;
  if(!(responseBody instanceof Array)) {
    message = 'API Lookup error';
    responseBody = [];
  }
  else {
    if(!responseBody.length) {
      message = 'No places found nearby';
    }
  }
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapLine: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
    locations: responseBody,
    message
  });
}

// lng: -0.9690884,
// lat: 51.455041,
// maxDistance: 20

const homeList = (req, res) => {
  const path = '/api/locations';
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {},
    qs: {
      lng: -0.9690884,
      lat: 51.455041,
      maxDistance: 20
    }
  };
  request(requestOptions, (err, { statusCode }, body) => {
    let data = []
    console.log(body);
    if(statusCode === 200 && body.length) {
      data = body.map( (item) => {
        item.distance = formatDistance(item.distance);
        return item;
      });  
    }
    renderHomepage(req, res, data);
  });
};

const renderDetailPage = (req, res, location) => {
  res.render('location-info',{
    title: location.name,
    pageHeader: {
      title: location.name
    },
    sidebar: {
      context: `is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: "If you've been and you like it - or if you don't - please leave a review to help other people just like you.`
    },
    location
  });
};

const renderReviewForm = (req, res, location) => {
  res.render('add-review',{
    title: `Review ${location.name} on Loc8r` ,
    pageHeader: { title: `Review ${location.name}` }, 
    error: req.query.err
  });
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationId}`
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {}
  };

  request(requestOptions, (err, { statusCode }, body) => {
    const data = body;
    if(statusCode === 200) {
      data.coords = {
        lat: body.coords[0],
        lng: body.coords[1]
      }
      callback(req, res, data);
    }
    else {
      showError(req, res, statusCode);
    }
  });
};

const locationInfo = (req, res) => {
  getLocationInfo(req, res, 
    (req1, res1, responseData) => renderDetailPage(req1, res1, responseData));
};

const addReview = (req, res) => {
  getLocationInfo(req, res, 
    (req1, res1, responseData) => renderReviewForm(req1, res1, responseData));
};

const doAddReview = (req, res) => {
  const locationId = req.params.locationId;
  const path = `/api/locations/${locationId}/reviews`;
  const postData = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postData
  };

  if( !postData.author || !postData.rating || !postData.reviewText) {
    res.redirect(`/location/${locationId}/review/new?err=val`);
  }
  else {
    request(
      requestOptions, (err, { statusCode },{ name }) => {
        if(statusCode === 201) {
          res.redirect(`/location/${locationId}/`);
        } 
        else if(statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationId}/review/new?err=val`);
        }
        else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};

module.exports = {
  homeList,
  locationInfo,
  addReview,
  doAddReview
};
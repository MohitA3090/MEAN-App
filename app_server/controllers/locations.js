/* GET Home List page. */
const homeList = (req, res) => {
  res.render('locations-list', { title: 'Home List'} );
};

/* GET Location Info page. */
const locationInfo = (req, res) => {
  res.render('location-info', { title: 'Location Info'} );
};

/* GET Add Review page. */
const addReview = (req, res) => {
  res.render('add-review', { title: 'Add Review'} );
};

module.exports = { homeList, locationInfo, addReview };
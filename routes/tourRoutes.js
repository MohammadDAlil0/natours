const express = require('express');

const reviewRoutes = require("./reviewRoutes");
const tourControllers = require('../controllers/tourController');
const authControllers = require('../controllers/authController');

const router = express.Router();

router.route('/top-5-cheap')
    .get(tourControllers.aliasTopTour, tourControllers.getAllTours);

router.route('/tour-stats')
    .get(tourControllers.getTourStats);

router.route('/monthly-plan/:year')
    .get(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide', 'guide'), tourControllers.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourControllers.getTourWithin);

router.route('/distances/:latlng/unit/:unit')
    .get(tourControllers.getDistances);

//Post /:idTour/reviews/

router.use('/:idTour/reviews', reviewRoutes);

router.route('/')
    .post(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'), tourControllers.createTour)
    .get(tourControllers.getAllTours);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'), tourControllers.updateTour)
    .delete(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'), tourControllers.deleteTour);

module.exports = router;
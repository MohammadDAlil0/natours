const express = require('express');

const tourControllers = require('../controllers/tourController');
const authControllers = require('../controllers/authController');

const router = express.Router();

router.route('/top-5-cheap')
    .get(tourControllers.aliasTopTour, tourControllers.getAllTours);

router.route('/tour-stats')
    .get(tourControllers.getTourStats);

router.route('/monthly-plan/:year')
    .get(tourControllers.getMonthlyPlan);



router.route('/')
    .post(tourControllers.createTour)
    .get(authControllers.protect, tourControllers.getAllTours);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.updateTour)
    .delete(authControllers.protect, authControllers.restrictTo('admin', 'lead-guid'), tourControllers.deleteTour);

module.exports = router;
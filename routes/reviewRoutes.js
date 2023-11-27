const express = require('express');
const reviewControllers = require('../controllers/reviewController');
const authControllers = require('../controllers/authController');

const router = express.Router({ mergeParams: true});

router.use(authControllers.protect);

router.route('/')
.get(reviewControllers.getAllReviews)
.post(authControllers.restrictTo('user'), reviewControllers.setTourUserIds, reviewControllers.createReview);

router.route('/:id')
.delete(reviewControllers.deleteReview)
.patch(authControllers.restrictTo('user', 'admin'), reviewControllers.updateReview)
.get(authControllers.restrictTo('user', 'admin'), reviewControllers.getReview);


module.exports = router;
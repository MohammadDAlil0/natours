const express = require('express');
const authControllers = require('../controllers/authController');
const userControllers = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

//protect all routes after this midleware
router.use(authControllers.protect);

router.patch('/updatePassword', authControllers.updatePassword);

router.get('/me', userControllers.getMe, userControllers.getUser);

router.patch('/updateMe', userControllers.updateMe);
router.delete('/deleteMe', userControllers.deleteMe);

router.use(authControllers.restrictTo('admin'));

router.get('/', userControllers.getAllUsers);

router.route('/:id')
.delete(userControllers.deleteUser)
.patch(userControllers.updateUser)
.get(userControllers.getUser);

module.exports = router;
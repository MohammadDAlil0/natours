const express = require('express');
const authControllers = require('../controllers/authController');
const userControllers = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authControllers.signup);

router.post('/login', authControllers.login);

router.post('/forgotPassword', authControllers.forgotPassword);

router.patch('/resetPassword/:token', authControllers.resetPassword);

router.get('/', userControllers.getAllUsers);

module.exports = router;
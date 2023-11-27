const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => jwt.sign({id: id}, process.env.JWT_Secret, {
        expiresIn: process.env.EXPIRES_IN
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return next(new AppError('Please privide email and password', 400));
    }
    const curUser = await User.findOne({email: email}).select('+password');

    if (!curUser || !await bcrypt.compare(password, curUser.password)) {
        return next(new AppError('Incorrect email or password!', 401));
    }
    createSendToken(curUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) veify if there is a token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    // 2) verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_Secret);


    // 3) check if user still exists
    const curUser = await User.findById(decoded.id);
    if (!curUser) {
        return next(new AppError('The user belonging to this token does no longer exist!', 401));
    }

    // 4) check if the passwrd was changed
    if (curUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! please login again', 401));
    }
    req.user = curUser;
    next();
})


exports.restrictTo = (...roles) => (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(new AppError('You don\'t have permission to perform this action', 403));
        }

        next();
    }

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    if (!user) {
        return next(new AppError('there is no user with this email address', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false} );

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with a newPassword and confirm password 
    to: ${resetURL}.\nIf your didn't forgot your password. Please ignore thie email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token is valid for 10 min',
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to the email'
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false} );
        next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashToken, passwordResetExpires: {$gt: Date.now()}});

    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    createSendToken(user, 201, res);
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!await bcrypt.compare(req.body.passwordCurrent, user.password)) {
        return next(new AppError('Your current password is wrong!', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user, 200, res);
});
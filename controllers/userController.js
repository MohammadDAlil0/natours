const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);

const filterObject = (curObject, ...filters) => {
  const newObject = {};
  Object.keys(curObject).forEach(el => {
    if (filters.includes(el)) newObject[el] = curObject[el];
  });
  return newObject;
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Use updatePassword for updating password', 400));
  }
  const filteredBody = filterObject(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: updatedUser
  })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});
  
  res.status(204).json({
    status: "success",
    data: null
  })
})


const AppError = require('../utils/appError');

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Input data. ${errors.join(' .')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token, please login again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expaired, please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorPro = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  //Programing pr other unknown error: don't leak error details
  else {
    // 1) Log error
    console.log('Error!!!', err);
    // 2) send message
    res.status(500).json({
      status: 'error',
      message: 'something wents wrong!'
    });
  }
}


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  else if (process.env.NODE_ENV === 'production') {
    let error = {message: err.message, ...err};
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    else if(err.code === 11000) error = handleDuplicateFieldsDB(error);
    else if(err.name === 'ValidationError') error = handleValidationError(error);
    else if (err.name === 'JsonWebTokenError') error = handleJWTError();
    else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorPro(error, res);
  }
}
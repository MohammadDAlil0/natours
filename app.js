const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// this for serve static folders
app.use(express.static(`${__dirname}/public`));

//Set security HTTP headers
app.use(helmet());
//Limit request from same IP
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try after one houre'
});
app.use('/api', limiter);

//body parser
app.use(express.json({limit: '10KB'}));

//Data sanitizaion NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//Test middlware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError('page not found', 404));
});

app.use(errorController);


module.exports = app;

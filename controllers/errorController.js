const AppError = require("../utils/appError");

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack
  }
)};

const sendErrorProd = (res, err) => {
  if (err.isOperational) { // Error has message from developer
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error ❌: ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong...',
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(400, message);
}

const handleJSONWebTokenError = () => new AppError(401, 'Invalid token. Please log in again.');

const handleJWTExpiredError = () => new AppError(401, 'Your token has expired. Please log in again.');

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // Matches duplicate key in quotations in error message
  const message = `Duplicate field value: ${value}`;
  return new AppError(400, message);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    if (error.name === 'CastError') err = handleCastErrorDB(error);
    if (error.code === 11000) err = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') err = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') err = handleJSONWebTokenError();
    if (error.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(res, err);
  }
};
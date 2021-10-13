const express = require('express');
const morgan = require('morgan');
var cors = require('cors');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const questionsRouter = require('./routes/questionsRoutes');
const slotsRouter = require('./routes/slotsRoutes');
const topicsRouter = require('./routes/topicsRoutes');
const usersRouter = require('./routes/usersRoutes');
const settingsRouter = require('./routes/settingsRoutes');

const app = express();

// MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 3rd party logging middleware
}

app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
req.requestTime = new Date().toISOString;
  next();
});

// ROUTES

app.use('/api/v1/questions', questionsRouter);
app.use('/api/v1/slots', slotsRouter);
app.use('/api/v1/topics', topicsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/settings', settingsRouter);

// Custom 404 response when route not matched
app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});


// Handles errors
app.use(globalErrorHandler) 

module.exports = app;

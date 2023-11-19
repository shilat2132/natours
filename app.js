//packeges
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./handlers/errHandler')
const app = express();

//routers
const toursRouter = require('./routes/toursRouter');
const usersRouter = require('./routes/usersRouter')
const reviewRouter = require('./routes/reviewRouter')
const viewsRouter = require('./routes/viewsRouter')


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//global middlewares
app.use(helmet())

const limiter = rateLimit({
  max: 100,
  windoMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour"
})

app.use('/', limiter)


app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Data sanitization against NoSQL query injection - removes $ and others from req.body/params
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss()); //prevents inserting html syntax

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


//routes
app.use('/api/tours', toursRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewRouter)
app.use('/', viewsRouter )




app.all('*', (req,res, next)=>{
  next(new AppError (`couldn't reach ${req.originalUrl} on the server`, 404)) 
  //while calling next with an argument, it goes to the global err handling func
})

app.use(globalErrorHandler)


module.exports = app;

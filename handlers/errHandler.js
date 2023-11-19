const AppError = require("../utils/appError")

//operational errors handlers
const handleCastErrorDB = error =>{
    const message = `Invalid ${error.path} : ${error.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = error =>{
    const value = error.keyValue.name
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400)
 
}

const handleValidationErrorDB = error =>{
    const errors = Object.values(error.errors).map(el=> el.message)
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('invalid token, please login again', 401)
const handleJWTExpiredError = () => new AppError('your token has expired, please login again', 401)

//production and development errors
const sendErrorDev = (err, req, res)=>{
  // console.log(err)
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error : err,
      message: err.message,
      stack: err.stack
    })
  } else{
    res.status(err.statusCode).render('error', {title: 'something went wrong', msg: err.message})
  }
   
}

const sendErrorProd = (err, req, res)=>{
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
  
}

module.exports = (err, req, res, next) => {  
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
     
      let error = { ...err };
      error.name = err.name
      error.message = err.message

      //handling operational errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')  error = handleValidationErrorDB(error)
    if(error.name === 'JsonWebTokenError') error = handleJWTError()
    if(error.name ==='TokenExpiredError') error = handleJWTExpiredError()
    sendErrorDev(error, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.name = err.name
        error.message = err.message

        //handling operational errors
      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if(error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')  error = handleValidationErrorDB(error)
      if(error.name === 'JsonWebTokenError') error = handleJWTError()
      if(error.name ==='TokenExpiredError') error = handleJWTExpiredError()

      sendErrorProd(error, req, res);
    }
  };

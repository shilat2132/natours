class AppError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

        this.isOperational = true

        Error.captureStackTrace(this, this.constructor) //would gain the info of the error and where it occured each time new obj is created
    }
}

module.exports = AppError
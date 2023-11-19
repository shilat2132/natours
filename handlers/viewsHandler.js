const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.overview = catchAsync(async (req, res)=>{
  const tours = await Tour.find()
    res.status(200).render('overview', {
     title: 'the overview page',
     tours
    })
  })

  exports.getTour = catchAsync(async(req, res, next)=>{
    const tour = await Tour.findOne({slug: req.params.slug}).populate({path: 'reviews', fields: 'review rating user'})
    if(!tour){
      return next(new AppError('no tour with that id', 404))
    }
    res.status(200).render('tour', {
     title: 'the tour page',
     tour
    })
  })

  exports.login = catchAsync(async (req, res)=>{
    res.status(200).render('login')
  })

  exports.getAccount = (req, res)=>{
    res.status(200).render('account')
  }
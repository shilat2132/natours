const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");
const factory = require('./factoryHandler')



exports.setTourUserIds = (req, res, next)=>{
    if(!req.body.user) req.body.user = req.user.id
    if(!req.body.tour) req.body.tour = req.params.tourId 
    next()
}

exports.getAllReviews = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.getReview = factory.getOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
const mongoose = require ('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "review can't be empty"]

    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']

    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

//static model fuction
reviewSchema.statics.calculateRatingsStats = async function(tourId){
    const stats = await this.aggregate(
      [ { $match: {tour: tourId}}, //only the reviews of the given tour
        {$group:{
            _id: '$tour',
            reviewsNum: {$sum: 1},
            ratingsAvg: {$avg: '$rating'}
        }}]
    )
   if(stats.length >0){
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].reviewsNum,
        ratingsAverage: stats[0].ratingsAvg 
    })
   } else{
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5 
    })
   }
}

reviewSchema.index({tour: 1, user: 1}, {unique: true}) //ensures that a user wouldn't be able to rate the same tour twice, 
//the combination is unique

//doccument middleware
reviewSchema.post('save', async function(){
   await this.constructor.calculateRatingsStats(this.tour) //this.constructor refers the doc model = Review
})

//query middleware
reviewSchema.pre(/^findOneAnd/ , async function(next){
    this.r = await this.clone().findOne() //executing the query in order to acces the review doc 
    next()
})

    //after the query was executed and the review was updated
reviewSchema.post(/^findOneAnd/ , async function(){
    await this.r.constructor.calculateRatingsStats(this.r.tour) 
        //this.r = a review doc that was saved as a prop of the query
})


reviewSchema.pre(/^find/, function(next){
    this.populate({path: 'user', select: 'name photo'})
        next()
})
const Review =  mongoose.model('Review', reviewSchema)

module.exports = Review
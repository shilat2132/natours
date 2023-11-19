const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a tour is required'],
        unique: true,
        minLength: [4, 'should have at least 4 characters'],
        maxLength: [30, 'should have no more than 30 characters']
    },
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number,
        required: [true, "duration are required"]
    },
    maxGroupSize:  {
        type: Number,
        required: [true, 'a max is required']
    },
    difficulty:  {
        type: String,
        required: [true, 'a difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'not a value of difficulty'
        }
    },
    price:  {
        type: Number,
        required: [true, 'a price is required']
    },
    priceDiscount: {
        type: Number,
        validate:{
            validator: function (val){
                return this.price > val
            },
            message: 'discount ({VALUE}) should be lower than the price'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'min rating is 1'],
        max: [5, 'max rating is 5'],
        set: val => Math.round(val*10)/10 //returns a decimal num with 2 digits after the point
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        trim: true, 
        required: [true, 'a summary is required']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'a cover is required']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], //horizontal and vertical line
        address: String,
        description: String
    },
    locations: [{
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number], 
            address: String,
            description: String,
            day: Number
        
    }],
    guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ]
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})


//indexes
tourSchema.index({price: 1, ratingsAverage: -1}) //1 for ascending
tourSchema.index({slug: 1})
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration /7
})

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review', //what model would the virtual field refer to
    foreignField: 'tour', //the field in the reffered model in which the current model is reffered
    localField: '_id' //the field in current model that the reffered model is storing
})

//middleware document
//runs before save and create
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

// //embed guides in a tour model
tourSchema.pre('save', async function(next){
    const guidesPromises = this.guides.map(async id=> await User.findById(id)) //we insert an array of id of guides 
    // and then embbed the users themselves in the array
    this.guides = await Promise.all(guidesPromises)
    next()
})

//query middleware

tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}})
    next()
})

//adds the info of the refered guide
tourSchema.pre(/^find/ , function(next){
    this.populate({
        path: 'guides', select: '-__v -passwordChangedAt'
      }) 
      next()
})



//aggregation middleware
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
//     next()
// })


const Tour = new mongoose.model('Tour', tourSchema)

module.exports = Tour
const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./factoryHandler')
const multer = require('multer');
const sharp = require('sharp');


//UPLOADING PICS
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});


//middleware
exports.aliasTopTours = (req, res, next)=>{
  req.query.limit = "5"
  req.query.sort= "-ratingsAverage,price"
  req.query.fields = 'name,price,ratingsAverage,difficulty'
  next()
}



exports.getAllTours = factory.getAll(Tour)


exports.createTour = factory.createOne(Tour)


exports.showTour = factory.getOne(Tour, {path: 'reviews'})

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)

exports.getToursStats = catchAsync(async (req, res, next)=>{
  const stats = await Tour.aggregate([
    {
      $match: {ratingsAverage: {$gte: 4.5} } //works only with the the matching documents
    },
    {
      $group: {
        _id: '$difficulty', //what we group by
        numTours: {$sum: 1}, //adds 1 on each doc that matches
        numRatings: {$sum: '$ratingsQuantity'}, //sums up the specified field of each doc
        avgRatings: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'}
      }
    },
    {
      $sort: {avgPrice: 1} //sort by the given field. 1 for ascending
    }
  ])

  res.status(200).json({status: 'success', stats})
})

exports.getMonthlyPlan = catchAsync(async (req, res, next)=>{
  const year = req.params.year *1
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //seperated docs by that field of array. output a document for each element in the arr
    },
    {
      $match: { startDates:
        {$gte: new Date(`${year}-01-01`), $lte:new Date(`${year}-12-31`) } //gives only the tours in given year
      }
    },
    {
      $group: {
        _id: {$month: '$startDates'}, //groups them by the mounth of tour
        numTours: {$sum: 1},
        tours: {$push: '$name'} //gives an array of the specified field
      }
    },
    {
      $addFields: {month: '$_id'}
    },
    {
      $project: {
        _id: 0  //excludes the field
      }
    }, 
    {
      $sort: {
        numTours: -1
      }
    }
  ])
  res.status(200).json({status: 'success', plan})
})


// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400))
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }});

  res.status(200).json({
    status: 'success',
    results: tours.length,
    tours
  });
});


exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
  }

  const distances = await Tour.aggregate([
    {
      //this has to be the first stats in the pipeline
      //the model ought to have a geo indexS
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance', //the name of the field which stores the diatance from current doc to given coordinates
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
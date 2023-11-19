const express = require('express');
const reviewsRouter = require('../routes/reviewRouter')

const tourHandler =require('../handlers/tourHandlers')

const authHandler = require('../handlers/authHandlers')

const router = express.Router();

//if comes across the following route use the reviews router
router.use('/:tourId/reviews', reviewsRouter)

router.route('/monthly-plane/:year').get(authHandler.protect,
      authHandler.restrictTo('admin', 'lead-guide', 'guide'),
      tourHandler.getMonthlyPlan)
router.route('/tours-stats').get(tourHandler.getToursStats)

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourHandler.getToursWithin);

  router.route('/distances/:latlng/unit/:unit').get(tourHandler.getDistances);

router.route('/top-5-cheap').get(tourHandler.aliasTopTours, tourHandler.getAllTours)
router.route('/').get(tourHandler.getAllTours).post(tourHandler.createTour);
router.route('/:id')
      .get(tourHandler.showTour)
      .patch(authHandler.protect,
            authHandler.restrictTo('admin', 'lead-guide'),
            tourHandler.uploadTourImages,
            tourHandler.resizeTourImages,
            tourHandler.updateTour)
      .delete(authHandler.protect,
             authHandler.restrictTo('admin', 'lead-guide'),
              tourHandler.deleteTour)

module.exports = router;

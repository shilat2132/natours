const express = require('express')
const authHandler = require('../handlers/authHandlers')
const reviewHandler = require('../handlers/reviewHandler')
const router = express.Router({mergeParams: true})


router.use(authHandler.protect)

router.route('/')
.get(reviewHandler.getAllReviews)
.post(authHandler.restrictTo('user'), 
        reviewHandler.setTourUserIds,
        reviewHandler.createReview)

router.route('/:id')
    .patch(authHandler.restrictTo('user', 'admin'), reviewHandler.updateReview)
    .delete(authHandler.restrictTo('user', 'admin'), reviewHandler.deleteReview)
    .get(reviewHandler.getReview)

module.exports = router
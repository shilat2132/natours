const express = require('express')
const viewsHandler = require('../handlers/viewsHandler')
const router = express.Router()
const authHandler = require('../handlers/authHandlers')


router.get('/',authHandler.isLoggedIn, viewsHandler.overview)
router.get('/tour/:slug',authHandler.isLoggedIn, viewsHandler.getTour)
router.get('/login',authHandler.isLoggedIn, viewsHandler.login)
router.get('/me',authHandler.protect, viewsHandler.getAccount)

module.exports = router
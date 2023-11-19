const express = require('express')
const authHandler = require('../handlers/authHandlers')
const userHandler = require('../handlers/userHandler')

const router = express.Router()
//no need of auth
router.post('/signup', authHandler.signup)
router.post('/login', authHandler.login)
router.get('/logout', authHandler.logout)
router.post('/forgotPassword', authHandler.forgotPassword )
router.patch('/resetPassword/:token', authHandler.resetPassword)


router.use(authHandler.protect) //protects all routes after that line
//need of auth
router.patch('/updateMyPassword', authHandler.updatePassword )
router.get('/me', userHandler.getMe, userHandler.getUser)
router.patch('/updateMe', userHandler.uploadUserPhoto, userHandler.resizeUserPhoto, userHandler.updateMe)
router.delete('/deleteMe', userHandler.deleteMe)

router.use(authHandler.restrictTo('admin'))

//routes restricted to admin
router.get('/', userHandler.getAllusers)
router.route('/:id')
        .delete(userHandler.deleteUser)
        .patch(userHandler.updateUser)
        .get(userHandler.getUser)



module.exports = router
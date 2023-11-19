const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a name is required']
    },
    email: {
        type: String,
        required: [true, 'an email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide valid email']
    },
    photo: {type: String, default: 'default.jpg'},
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'a password is required'],
        minLength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: [true, 'confirm password'],
        validate: {
            validator: function(el){
                return this.password === el
            },
            message: 'passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

})

//documents middleware
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 1000; //sometimes it takes time for the token to be issued
    next()
})

//query middleware
userSchema.pre(/^find/, function(next){
    //this refers to the query
    this.find({active: {$ne: false}})
    next()
})
//instant model methods
userSchema.methods.correctPassword = async function(candiddatePass, userPass){
    return await bcrypt.compare(candiddatePass, userPass)
}

userSchema.methods.changedPasswordAfter= function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000) //converts the time the password was changed to timestamp
        return changedTimestamp> JWTTimestamp // returns true if password was changed agter the token eas issued
    }

    
    return false //password wasn't changed after token was issued
}

userSchema.methods.createPasswordResetToken = function(){
    //crypto is required but it's from node modules
    const resetToken = crypto.randomBytes(32).toString('hex') //creates an unencrypted long string
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex') //encrypts the token, the token shouldn't be saved in the db
    this.passwordResetExpires =Date.now() + 10 * 60 * 1000 //converts to miliseconds
    return resetToken; //we send to user the unencrypted token
}

const User = new mongoose.model('User', userSchema)

module.exports = User
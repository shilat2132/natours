const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(con => console.log("connected to db")).catch(err=> console.log(err))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

const importData = async ()=>{
    try {
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews)

        console.log('data added')
        process.exit()
    } catch (error) {
        console.log(error)
    }
    process.exit()

}

const deleteData = async ()=>{
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()

        console.log('data deleted')

    } catch (error) {
        console.log(error)
    }
    process.exit()

}

if(process.argv[2] === '--import'){
    importData()
}
else if(process.argv[2]==='--delete'){
    deleteData()
}
console.log(process.argv)

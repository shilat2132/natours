const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(con => console.log("connected to db")).catch(err=> console.log(err))





const port =  8000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});


process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
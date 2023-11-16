const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION', "Shutting down...");
  process.exit(1);    
});

dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
  console.log('connected to database successfuly!');
});


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION', "Shutting down...");
  server.close(() => {
    process.exit(1);
  });
})
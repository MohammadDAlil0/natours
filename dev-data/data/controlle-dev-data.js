const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const Tour = require('./../../models/tourModel');

mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
  console.log('connected to database successfuly!');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);    
        console.log('Data loaded successfuly!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted successfuly!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();    
}

if (process.argv[2] === '--delete') {
    deleteData();
}

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const fs = require('fs');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');


mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
  console.log('connected to database successfuly!');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);    
        console.log('Data loaded successfuly!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
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

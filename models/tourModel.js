const mongoose = require('mongoose');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour must have less or equal than 40 characters!'],
    minlength: [10, 'A tour must have more or equal than 10 characters!'],
    validate: [validator.isAlpha, 'A tour\'s name must have characters only!']
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maximum group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'difficulty is either: easy, medium, or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        //this points to the current object; so it doesn't work for updating
        return val < this.price;
      },
      message: 'Price discount must be less the current price'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a imageCover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }

}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

tourSchema.virtual('durationweeks').get(function() {
  return this.duration / 7;
});

//Documnets middleware: run before .save() and .create()
tourSchema.pre('save', (next) => {
  //this run before save
  next();
});

//Query middleware: run before .find(), .findOne() ...
//"this" is the query here
tourSchema.pre(/^find/, function(next) {  // the way I wirte find is a way to write a reguler expression 
  this.find({
    secretTour: {$ne: true}
  });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`it takes ${Date.now() - this.start} milieseconds`);

  next();
});

//Aggregation middleware: here "this" is the aggregation
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: {secretTour: {$ne: true}}});
  next();
})

module.exports =  mongoose.model('Tour', tourSchema);

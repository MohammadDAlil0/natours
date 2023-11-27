const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must have a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must have a user.']
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: "name"
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
};

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    //await findOne; does not work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

module.exports  = mongoose.model('Review', reviewSchema);
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const express = require("express");
const router = express.Router({mergeParams: true});
const {reviewSchema } = require("../schemas");

const validateReview = (req,res,next ) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

router.post("/", async(req,res,next) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created a new review!");
    res.redirect(`/campgrounds/${req.params.id}`);
});

router.delete("/:reviewId", catchAsync(async (req,res,next) =>{
    await Review.findByIdAndDelete(req.params.reviewId);
    await Campground.findByIdAndUpdate(req.params.campId, {
        $pull: {
            reviews: req.params.reviewId
        }
    });
    req.flash("success", "Successfully deleted review.");
    res.redirect(`/campgrounds/${req.params.campId}`)
}));

module.exports = router
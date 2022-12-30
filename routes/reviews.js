const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const express = require("express");
const router = express.Router({mergeParams: true});
const {isLoggedIn,validateReview,isReviewAuthor} = require("../middleware");
const Review = require("../models/review");


router.post("/",isLoggedIn,validateReview, async(req,res,next) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created a new review!");
    res.redirect(`/campgrounds/${req.params.id}`);
});

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(async (req,res,next) =>{
    await Campground.findByIdAndUpdate(req.params.id, {
        $pull: {
            reviews: req.params.reviewId
        }
    });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash("success", "Successfully deleted review.");
    res.redirect(`/campgrounds/${req.params.id}`)
}));

module.exports = router
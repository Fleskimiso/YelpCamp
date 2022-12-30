const { campgroundSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const {reviewSchema } = require("./schemas");

module.exports.isLoggedIn = (req,res,next) =>{
    req.session.returnTo = String(req.originalUrl);
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be authenticated!");
        return res.redirect("/login");
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req,res,next) =>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash("error", "The campground of given id doesn't exist");
        return res.redirect("/campgrounds");
    }
    if(!campground.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that");
        res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next) =>{
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review) {
        req.flash("error", "The review of given id doesn't exist");
        return res.redirect("/campgrounds");
    }
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next ) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}
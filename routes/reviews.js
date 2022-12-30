const catchAsync = require("../utils/catchAsync");
const express = require("express");
const router = express.Router({mergeParams: true});
const {isLoggedIn,validateReview,isReviewAuthor} = require("../middleware");
const review = require("../controllers/reviews");


router.post("/",isLoggedIn,validateReview, catchAsync(review.createReview));

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(review.deleteReview));

module.exports = router
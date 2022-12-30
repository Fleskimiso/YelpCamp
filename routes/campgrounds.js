const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const express = require("express");
const router = express.Router();
const {isLoggedIn, isAuthor,validateCampground} = require("../middleware");


 
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });

}));
router.post("/", validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfullu made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);

}));
router.get("/new",isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById({ _id: req.params.id }).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground });
}));
router.put("/:id",isLoggedIn,isAuthor, validateCampground ,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });;
    req.flash("success", "Successfullu updated a campground");
    res.redirect(`/campgrounds/${id}`);
}));
router.delete("/:id",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}));
router.get("/:id/edit",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground: camp });
}));

module.exports = router;
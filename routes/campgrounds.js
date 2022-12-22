const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const express = require("express");
const router = express.Router();
const {campgroundSchema} = require("../schemas");


const validateCampground  = (req,res,next ) =>{
   
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });

}));
router.post("/",validateCampground ,catchAsync(async (req, res) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfullu made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);

}));
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById({ _id: req.params.id }).populate("reviews");
    if(!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground });
}));
router.put("/:id",validateCampground ,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });;
    req.flash("success", "Successfullu updated a campground");
    res.redirect(`/campgrounds/${id}`);
}));
router.delete("/:id", catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}));
router.get("/:id/edit", catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground: camp });
}));

module.exports = router;
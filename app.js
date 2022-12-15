const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const Campground = require("./models/campground");
const {campgroundSchema} = require("./schemas");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const { findByIdAndDelete } = require("./models/campground");

const app = express();

mongoose.set("strictQuery", true);
//mongoose.set("runValidators",true);(
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log("Connected to database");
    }
});

const db = mongoose.connection;

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


const validateCampground  = (req,res,next ) =>{
   
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("home");
});


app.get("/campgrounds", catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });

}));
app.post("/campgrounds",validateCampground ,catchAsync(async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});
app.get("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const campground = await Campground.findById({ _id: req.params.id });
    res.render("campgrounds/show", { campground });
}));
app.put("/campgrounds/:id",validateCampground ,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });;
    res.redirect(`/campgrounds/${id}`);
}));
app.delete("/campgrounds/:id", catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campgrounds");
}));
app.get("/campgrounds/:id/edit", catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground: camp });
}));
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found!", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log("Listening on port 300");
});

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("./models/campground");
const methodOverride = require("method-override"); 
const { findByIdAndDelete } = require("./models/campground");

const app = express();

mongoose.set("strictQuery", true);
//mongoose.set("runValidators",true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp",function(error){
    if(error) {
        console.log(error);
    }else {
        console.log("Connected to database");
    }
});

const db = mongoose.connection;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));


app.get("/",(req,res) =>{
    res.render("home");
});


app.get("/campgrounds",async (req,res) =>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});
app.post("/campgrounds", async (req,res) =>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
app.get("/campgrounds/new", (req,res) =>{
    res.render("campgrounds/new");
});
app.get("/campgrounds/:id", async (req,res) =>{
    const campground = await Campground.findById({_id: req.params.id});
res.render("campgrounds/show", {campground});
});
app.put("/campgrounds/:id",async (req,res) =>{
    const {id}  =req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground});;
    res.redirect(`/campgrounds/${id}`);
});
app.delete("/campgrounds/:id",async (req,res) =>{
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campgrounds");
});
app.get("/campgrounds/:id/edit", async (req,res) =>{
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground:camp});
});


app.listen(3000,() =>{
    console.log("Listening on port 300");
});

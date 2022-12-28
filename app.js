const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

const ExpressError = require("./utils/ExpressError");

const userRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");


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
app.use(express.static(path.join(__dirname, "/public")));

const sessionConfig = {
    secret: "This should be better seret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expiry: Date.now() + 1000 * 3600 * 24 * 7,
        maxAge: 1000 * 3600 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/fakeuser",async  (req,res) =>{
    const user = new User({email: "salk@gmail.com", username: "dsfsdf"});
    const newUser = await User.register(user,"chicken");
    res.send(newUser);
})

app.use("/",userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
    res.render("home");
});


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

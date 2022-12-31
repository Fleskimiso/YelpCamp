const { default: mongoose } = require("mongoose");
const path = require("path");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

//mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log("Connected to database");
    }
});

const db = mongoose.connection;

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "63ac4f3d0ccc606ec30d0d1e",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita, nam est! Eligendi optio, error reiciendis vero\
            nisi saepe id, cumque molestiae fugit porro dolorem labore totam perferendis? Consequuntur, sint autem!",
            price,
            images: [
                {
                    url: `https://source.unsplash.com/collection/483251?${random1000 * price}`,
                    filename: `collection/483251?${random1000 * price}`
                },
                {
                    url: `https://source.unsplash.com/collection/483251?${random1000 * price * 2}`,
                    filename: `collection/483251?${random1000 * price * 2}`
                }
            ]
        });
        await camp.save();
    }
}
seedDB().then(() => {
    db.close();
});
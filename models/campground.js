const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const imageSchame = new Schema({
    url: String,
    filename: String
});

imageSchame.virtual('thumbnail').get(function() {
    if(this.url.includes("cloudinary")) {
       return this.url.replace("/upload", "/upload/w_200")
    }
    return this.url
});

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [ imageSchame ],
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model("Campground", campgroundSchema);
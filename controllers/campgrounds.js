const { cloudinary } = require("../cloudinary");
const campground = require("../models/campground");
const Campground = require("../models/campground");
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });

}
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};
module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfullu made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);

}
module.exports.showCampground = async (req, res) => {
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
}
module.exports.renderEditForm = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground: camp });
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });;
    if (req.files) {
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);
        console.log(imgs);;
        await campground.save();
    }
    if (req.body.deleteImages) {
        for( let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename).then( (success) =>{
                // console.log(success);
                // console.log("Success");
            }).catch((e) =>{
                // console.log(e);
                // console.log("No item found");
            })
        }
        await Campground.updateOne(
            {_id: id},{
            $pull:
            {
                images:
                {
                    filename:
                        { $in: [...req.body.deleteImages] }
                }
            }
        })
        console.log(req.body.deleteImages);
        console.log(campground.images);
    }
    req.flash("success", "Successfully updated a campground");
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}
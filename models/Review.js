const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add a text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});
//static method to get avg of rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error();
  }
};

//Call getAverageCost after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageCost before save
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

//prevent user from submiting more than one review
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
module.exports = mongoose.model("Review", ReviewSchema);

const mongoose = require("mongoose");
const Item = require("./itemModel");

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  image: {
    originalname: String,
    mimetype: String,
    size: Number,
    location: String,
    key: String,
  },
  optionalItemFields: [{ name: "String", type: "String" }],
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

collectionSchema.index({ title: "text" });

collectionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const collection = this;
    await Item.deleteMany({ _id: { $in: collection.items } });
    next();
  }
);

const Collection = new mongoose.model("Collection", collectionSchema);
module.exports = Collection;

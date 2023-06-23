const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middlewares/checkAuth");
const Collection = require("../models/collectionModel");
const mongoose = require("mongoose");
const uploadImage = require("../middlewares/uploadImage");

const upload = multer({
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(
        new Error("Ivalid image format. Valid formats: jpg, jpeg and png")
      );
    }
    cb(null, true);
  },
});

router.post(
  "/collections/new",
  checkAuth,
  uploadImage.single("image"),
  async (req, res) => {
    const { originalname, mimetype, size, location } = req.file;
    try {
      const collection = new Collection({
        ...req.body,
        author: req.user._id,
        image: {
          originalname,
          mimetype,
          size,
          location,
        },
      });
      // const imageObject = {
      //   file: {
      //     data: req.file.buffer,
      //     contentType: req.file.mimetype,
      //   },
      //   fileName: req.file.originalname,
      // };
      // collection.image = imageObject;
      // res.redirect("/collections/" + collection._id.toString());
      await collection.save();
      res.status(201).send(collection);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.get("/collections", checkAuth, async (req, res) => {
  try {
    const collections = await Collection.find({ author: req.user._id })
      .populate("items")
      .exec();
    res.send(collections);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/collections/top5", checkAuth, async (req, res) => {
  try {
    const collections = await Collection.find({}, null, {
      sort: { itemsLength: -1 },
      limit: 5,
    });
    res.send(collections);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/collections/:id", checkAuth, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!collection) return res.status(404).send("Not found!");

    const dataType = collection.image.file.contentType;
    const base64data = collection.image.file.data.toString("base64");
    const collectionObject = collection.toObject();
    delete collectionObject.image.file.data;
    collectionObject.image.src = `data:${dataType};base64,${base64data}`;

    await collection.populate("items");
    collectionObject.items = collection.items;
    res.send(collectionObject);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/collections/:id");
router.delete("/collections");

module.exports = router;

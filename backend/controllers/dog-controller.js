const fs = require('fs');

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoords = require("../util/location");
const Dog = require("../models/dog");
const User = require("../models/user");

const getDogById = async (req, res, next) => {
  const dogId = req.params.did; // {did: 'd1'}

  let dog;
  try {
    dog = await Dog.findById(dogId);
  } catch (err) {
    // error with database
    return next(
      new HttpError("Something went wrong, could not find a dog.", 500)
    );
  }

  if (!dog) {
    // error with finding the specific id
    return next(new HttpError("Could not find dog for this id.", 404));
  }
  res.json({ dog: dog.toObject({ getters: true }) });
};

const getDogsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  //let userl
  let dogs;
  try {
    // user = await User.findById(userId).populate('dogs');
    dogs = await Dog.find({ owner: userId });
  } catch (err) {
    return next(
      new HttpError("Fetching dogs failed, please try again later.", 500)
    );
  }

  // if (!user || user.dogs.length ===0)
  if (!dogs || dogs.length === 0) {
    return next(new HttpError("Could not find dogs for this user id.", 404));
  }
  res.json({ dogs: dogs.map((dog) => dog.toObject({ getters: true })) }); // dogs: user.dogs.map(dog 。。。)
};

const createDog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, description, address} = req.body;

  let coordinates;
  try {
    coordinates = await getCoords(address);
  } catch (err) {
    return next(err);
  }

  const createdDog = new Dog({
    name,
    description,
    address,
    location: coordinates,
    image:req.file.path,
    owner: req.userData.userId, // user id
  });

  // check if owner exists
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating dog failed, please try again", 500));
  }

  if (!user) {
    return next(
      new HttpError("Could not find user for this id, please try again", 404)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdDog.save({ session: sess });
    user.dogs.push(createdDog);
    await user.save({ session: sess });
    await sess.commitTransaction(); // database must have collection created already!
  } catch (err) {
    return next(new HttpError("Creating dog failed, please try again", 500));
  }

  res.status(201).json(createdDog); // 201 for success created
};

const updateDog = async (req, res, next) => {
  // check if input correct
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  // get input
  const { name, description } = req.body;
  const dogId = req.params.did;

  let dog;
  try {
    dog = await Dog.findById(dogId);
  } catch (err) {
    // error with database
    console.log(err);
    return next(
      new HttpError(
        "Something went wrong, could not find dog for updates.",
        500
      )
    );
  }

  if (dog.owner.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allow to edit this dog.", 401));
  }


  dog.name = name;
  dog.description = description;
  try {
    await dog.save();
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, could not update dog, please try again later..",
        500
      )
    );
  }

  res.status(200).json({ dog: dog.toObject({ getters: true }) });
};

const deleteDog = async (req, res, next) => {
  const dogId = req.params.did;

  let dog;
  try {
    dog = await Dog.findById(dogId).populate("owner");
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, could not delete dog, please try again later.",
        500
      )
    );
  }

  //check if dog exist
  if (!dog) {
    return next(
      new HttpError(
        "Could not find dog for this id, please try again later.",
        404
      )
    );
  }

  if (dog.owner.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this dog.", 401));
  }

  const imagePath = dog.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await dog.deleteOne({ session: sess });
    dog.owner.dogs.pull(dog);
    await dog.owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        "Something went wrong, could not delete dog, please try again later.",
        500
      )
    );
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: dog.name + " was deleted." });
};

exports.getDogById = getDogById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;

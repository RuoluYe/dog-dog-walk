const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

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
  let dogs;
  try {
    dogs = await Dog.find({ owner: userId });
  } catch (err) {
    return next(
      new HttpError("Fetching dogs failed, please try again later.", 500)
    );
  }

  if (!dogs || dogs.length === 0) {
    return next(new HttpError("Could not find dogs for this user id.", 404));
  }
  res.json({ dogs: dogs.map((dog) => dog.toObject({ getters: true })) });
};

const createDog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, description, address, owner } = req.body;

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
    image:
      "https://media.istockphoto.com/id/1053621774/zh/%E5%90%91%E9%87%8F/%E5%8F%AF%E6%84%9B%E7%9A%84%E8%8A%9D-inu-%E7%8B%97%E5%8B%95%E7%95%AB%E7%89%87%E5%9C%96%E7%A4%BA-%E5%90%91%E9%87%8F%E4%BE%8B%E8%AD%89.jpg?s=612x612&w=0&k=20&c=RuyQUd3l2voM1s5JHi8vyKBhRT_1JNEb-bXv9c7UyXc=",
    owner, // user id
  });

  // check if owner exists
  let user;
  try {
    user = await User.findById(owner);
  } catch (err) {
    console.log(err)
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

  //   if (dog.owner.toString() !== req.user.userId) {
  //     return next(error("You can't edit dogs that don't belong to you!", 401));
  //   }

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

  try {
    await dog.deleteOne();
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, could not delete dog, please try again later.",
        500
      )
    );
  }

  res.status(200).json({ message: dog.name + " was deleted." });
};

exports.getDogById = getDogById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;

const { validationResult } = require('express-validator');
const uuid = require('uuid').v4;

const HttpError = require('../models/http-error');
const getCoords = require('../util/location');
const Dog = require('../models/dog');


let DUMMY_DOGS = [
    {
        id: 'd1',
        name: 'dog 1',
        description: 'shiba inu',
        location: {
            lat: 40,
            lng: -73
        },
        address: "~",
        owner: 'u1'
    }
];

const getDogById = (req,res,next) => {
    const dogId = req.params.did; // {did: 'd1'}
    const dog = DUMMY_DOGS.find(d => {
        return d.id === dogId;
    });

    if (!dog) {
        throw new HttpError('could not find for this dog id',404);
    }
    res.json({dog}); 
};

const getDogsByUserId = (req,res,next) => {
    const userId = req.params.uid; 
    const dogs = DUMMY_DOGS.filter(d => {
        return d.owner === userId;
    });
    if (!dogs|| getDogsByUserId.length ===0) {
        return next( 
            new HttpError('could not find dogs for this user id', 404)
        );
    }
    res.json({dogs}); 
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
    owner,
  });

  try {
    await createdDog.save();
  } catch (err) {
    return next(new HttpError("Creating dog failed, please try again", 500));
  }

  res.status(201).json(createdDog); // 201 for success created
};

const updateDog = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const { name, description} = req.body;
    const dogId = req.params.did;

    const updatedDog = DUMMY_DOGS.find(d => d.id === dogId);
    const dogIndex = DUMMY_DOGS.findIndex(d => d.id === dogId);
    updatedDog.name = name;
    updatedDog.description = description;

    DUMMY_DOGS[dogIndex] = updatedDog;

    res.status(200).json({dog: updatedDog});
};

const deleteDog = (req, res, next) => {
    const dogId = req.params.did
    const deletedDog = DUMMY_DOGS.find(d => d.id === dogId)
    if (!deletedDog) {
        throw new HttpError('Could not find a dog for this id.', 404);
    }
    
    DUMMY_DOGS = DUMMY_DOGS.filter(d => d.id != dogId);
    res.status(200).json({message: deletedDog.name + " was deleted."});
};



exports.getDogById = getDogById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;
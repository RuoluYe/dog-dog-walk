const { validationResult } = require('express-validator');
const uuid = require('uuid').v4;

const HttpError = require('../models/http-error');
const getCoords = require('../util/location');


let DUMMY_DOGS = [
    {
        id: 'd1',
        title: 'dog 1',
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
      next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }
    const { title, description, address, owner } = req.body;

    let coordinates;
    try {
      coordinates = await getCoords(address);
    } catch (err) {
      return next(err);
    }
       

    const createdDog = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        owner
    };
    
    DUMMY_DOGS.push(createdDog);

    res.status(201).json(createdDog) // 201 for success created
};

const updateDog = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const { title, description} = req.body;
    const dogId = req.params.did;

    const updatedDog = DUMMY_DOGS.find(d => d.id === dogId);
    const dogIndex = DUMMY_DOGS.findIndex(d => d.id === dogId);
    updatedDog.title = title;
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
    res.status(200).json({message: deletedDog.title + " was deleted."});
};



exports.getDogById = getDogById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;
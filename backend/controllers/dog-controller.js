const HttpError = require('../models/http-error');

const uuid = require('uuid').v4;


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

const createDog = (req, res, next) => {
    const { title, description, coordinates, address, owner } = req.body;
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
    DUMMY_DOGS = DUMMY_DOGS.filter(d => d.id != dogId);
    res.status(200).json({message: "deleted"});
};



exports.getDogById = getDogById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;
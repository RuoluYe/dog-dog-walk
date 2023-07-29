const express = require('express');
const {check} = require('express-validator');

const dogControllers = require('../controllers/dog-controller');

const router = express.Router();

router.get('/:did', dogControllers.getDogById);

router.get('/user/:uid', dogControllers.getDogsByUserId);

router.post('/', check('title').not().isEmpty, dogControllers.createDog);   

router.patch('/:did', dogControllers.updateDog);

router.delete('/:did', dogControllers.deleteDog);

module.exports = router;

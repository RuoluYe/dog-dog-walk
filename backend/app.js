const express = require('express');
const bp = require('body-parser');

const dogRoutes = require('./routes/dog-routes');
const usersRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bp.json());

app.use('/api/dog',dogRoutes);
app.use('/api/users', usersRoutes);

// reach when routes cannot find 
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((err,req,res,next) => {
    if (res.headerSent){
        return next(err);
    }
    // not response sent yet
    res.status(err.code || 500);
    res.json({message: err.message || 'unknow error'});

})

app.listen(5000)
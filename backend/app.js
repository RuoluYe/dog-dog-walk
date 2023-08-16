const fs = require('fs');
const path = require('path')

const express = require('express');
const bp = require('body-parser');
const mongoose = require('mongoose');

const dogRoutes = require('./routes/dog-routes');
const usersRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bp.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
 
  next();
})

app.use('/api/dog',dogRoutes);
app.use('/api/users', usersRoutes);

// reach when routes cannot find 
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) =>{
      console.log(err)
    });
  }
  if (res.headerSent) {
    return next(err);
  }
  // not response sent yet
  res.status(err.code || 500); // changed err.code into err.status
  res.json({ message: err.message || "unknow error" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ufvouck.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });


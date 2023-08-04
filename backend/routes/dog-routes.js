const express = require("express");
const { check } = require("express-validator");

const dogControllers = require("../controllers/dog-controller");
const fileUpload = require('../middleware/file-upload');
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:did", dogControllers.getDogById);

router.get("/user/:uid", dogControllers.getDogsByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  dogControllers.createDog
);

router.patch(
  "/:did",
  [check("name").not().isEmpty(), check("description").isLength({ min: 5 })],
  dogControllers.updateDog
);

router.delete("/:did", dogControllers.deleteDog);

module.exports = router;

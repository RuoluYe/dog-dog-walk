const express = require("express");
const { check } = require("express-validator");

const dogControllers = require("../controllers/dog-controller");

const router = express.Router();

router.get("/:did", dogControllers.getDogById);

router.get("/user/:uid", dogControllers.getDogsByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  dogControllers.createDog
);

router.patch(
  "/:did",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  dogControllers.updateDog
);

router.delete("/:did", dogControllers.deleteDog);

module.exports = router;

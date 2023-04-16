const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchuser");
require("dotenv").config();

const { body, validationResult } = require("express-validator");

// Route1: Create a User using: Post "/api/auth/" Doesn't require auth
router.post(
  "/signup",
  [
    body("name", "Enter Valid Name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }
      // check whether the email exist already
      let user = await User.findOne({ email: req.body.email });
      console.log("signup", user);
      if (user) {
        return res.status(400).json({ success, error: "sorry already a user" });
      }
      const salt = await bcrypt.genSalt(10); //salt is added for encrypt password
      const securePassword = await bcrypt.hash(req.body.password, salt); //for encrypt user password we have to hash and add salt
      const userObject = {
        name: req.body.name,
        password: securePassword,
        email: req.body.email,
      };
      user = await User.create(userObject);
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET); //jwt token generator
      success = true;
      res.json({ success, authToken });
      // .catch((e) => {
      //   console.log(e);
      //   res.json({ error: "enter valid & unique value", message: e.message });
      // });

      // const user = User(req.body);
      // user.save();
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occur");
    }
  }
);

// Route2: Authenticate a User using: Post "/api/auth/" Doesn't require auth

router.post(
  "/login",
  [
    // body("password", "Enter correct password").isLength({ min: 5 }),
    body("email", "Enter Valid Email").isEmail(),
    body("password", "can not be blank").exists(),
  ],
  async (req, res) => {
    let = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    console.log("user", req.body);
    try {
      let user = await User.findOne({ email });
      console.log("login", user);
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please login with your credential" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please enter with your credential" });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(payload, process.env.JWT_SECRET);
      success = true;
      res.json({ success, token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server occur");
    }
  }
);

// Route3: Get logged in user detail using a User using: Post "/api/auth/" login require

router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    console.log("user", user);
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;

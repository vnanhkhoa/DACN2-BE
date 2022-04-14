const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
require("dotenv").config();

const User = require("../models/User");

// @route GET api/auth
// @desc Check if user is logged in
// @access Public
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route POST api/auth/change
// @desc Change Password
// @access Private
router.post("/change", verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.userId);
    const passwordValid = await argon2.verify(user.password, oldPassword);
    if (!passwordValid)
      return res.json({ success: false, message: "Incorrect Password" });
    const hashedUserPassword = await argon2.hash(newPassword);
    const UserAfter = await User.findOneAndUpdate(
      { _id: req.userId },
      { $set: { password: hashedUserPassword } },
      { new: true }
    );
    if (UserAfter) {
      return res.json({ success: true, message: "Update Successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // Validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing Username and/or Password" });

  try {
    // Check for existing user
    const user = await User.findOne({ username });

    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Username is already taken" });

    // Pass all
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    // return webtoken
    const accessToken = jwt.sign(
      {
        auth: newUser._id,
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "User created successfully",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route Post api/auth/login
// @desc Login users
// @access Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing Username and/or Password" });

  try {
    // Check for existing user
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    // Username found

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    const accessToken = jwt.sign(
      {
        auth: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});
module.exports = router;

const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
require("dotenv").config();

const Customer = require("../models/Customer");

// @route POST api/customer/
// @desc Check customer
// @access Private
router.post("/", async (req, res) => {
  const { customerId } = req.body;
  // check data
  if (!customerId)
    return res
      .status(400)
      .json({ success: false, message: "Missing CustumerId" });
  try {
    // Check for existing user
    const customer = await Customer.findOne({ customerId }).select("-__v");
    if (!customer)
      return res
        .status(400)
        .json({ success: false, message: "Custumer is not exist" });

    res.json({
      success: true,
      message: "Customer Found",
      customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route POST api/customer/login
// @desc Check customer
// @access Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // check data
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing Username and/or Password" });
  try {
    // Check for existing user
    const customer = await Customer.findOne({ username }).select("+password");
    if (!customer)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    // Username found
    const passwordValid = await argon2.verify(customer.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    const accessToken = jwt.sign(
      {
        auth: customer._id,
      },
      process.env.ACCESS_TOKEN_SECRET
    );
    const push = {
      username: customer.username,
      _id: customer._id,
      createdAt: customer.createdAt,
    };
    res.json({
      success: true,
      message: "Customer logged in successfully",
      push,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Interval server error" });
  }
});

// @route POST api/customer/register
// @desc create customer
// @access Public
router.post("/register", async (req, res) => {
  console.log(req.body)
  // get customer
  const { username, password } = req.body;

  // validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing Username and/or Password" });
  try {
    // Pass all
    const hashedPassword = await argon2.hash(password);
    const newCustomer = new Customer({
      username,
      password: hashedPassword,
    });
    await newCustomer.save();
    const push = {
      username: newCustomer.username,
      _id: newCustomer._id,
      createdAt: newCustomer.createdAt,
    };
    res.json({
      success: true,
      message: "Customer created successfully",
      push,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

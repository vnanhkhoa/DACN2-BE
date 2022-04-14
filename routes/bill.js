const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const datefns = require("date-fns");
const verifyToken = require("../middleware/auth");
require("dotenv").config();

const Bill = require("../models/Bill");

// @route Get api/bill/all
// @desc Retrieve all bills
// @access Private "user": "6232da9a4c7b2dfd19d29937",
router.get("/all", verifyToken, async (req, res) => {
    try {
        let Bills = await Bill.find()
            .populate("customer", ["username"])
            .populate({
                path: "products.product",
                match: {
                    user: { $eq: req.userId }
                },
            })
            .select("-__v");
        Bills.forEach((bill, index) => {
            bill.products = bill.products.filter((product) => product.product != null)
            if (bill.products.length > 0) {
                bill.total = bill.products.reduce((total, item) => total + item.price * item.quantity, 0)
            }
            bill.setStatus()
        });

        Bills = Bills.filter(bill => bill.products.length > 0);

        res.json({
            success: true,
            Bills,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Interval server error" });
    }
});

// @route Get api/bill/date
// @desc Retrieve all bills in that date
// @access Private
router.post("/date", verifyToken, async (req, res) => {
    const { date } = req.body;
    let query = new Date(date);
    console.log(query);
    try {
        if (date.length !== 0) {
            let Bills = await Bill.find({
                date: {
                    $gte: datefns.startOfDay(query),
                    $lte: datefns.endOfDay(query),
                },
            })
                .populate("customer", ["username"])
                .populate("products.product", ["title", "image"])
                .select("-__v");
            res.json({ success: true, Bills });
        } else {
            let Bills = await Bill.find()
                .populate("customer", ["username"])
                .populate("products.product", ["title", "image"])
                .select("-__v");
            res.json({ success: true, Bills });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Interval server error" });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    const { status, _ids } = req.body;
    try {
        const bill = await Bill.findOne({ _id: req.params.id})
            .populate("products.product")
            .select("-__v");

        if (!bill)
            return res.status(401).json({
                success: false,
                message: "Bill not found or user is not authorized",
            });
        bill.products.forEach((product) => {
            if (_ids.indexOf(product.product._id.toString()) !== -1) {
                product.status = status
            }
        })
        bill.setStatus();
        await bill.save();

        bill.setProducts(_ids)
        bill.setStatus();
        bill.setTotal();

        res.json({
            success: true,
            message: "Bill is Updated",
            Bills: bill,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Interval server error" });
    }
});

// @route POST api/get
// @desc Retrieve all bill of Customer
// @access Private
router.post("/get", async (req, res) => {
    const { customerId } = req.body;
    if (!customerId)
        return res
            .status(400)
            .json({ success: false, message: "Missing CustomerId" });
    try {
        const Bills = await Bill.find({ customer: customerId })
            .populate("products.product")
            .select("-__v");
        res.json({
            success: true,
            Bills,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Interval server error" });
    }
});

// @route POST api/bill
// @desc create bill for customer
// @access Private
router.post("/", async (req, res) => {
    const { products, total, customerId } = req.body;
    let array = [];
    //Validation
    if (!products)
        return res
            .status(400)
            .json({ success: false, message: "Missing Products" });
    if (!customerId)
        return res
            .status(400)
            .json({ success: false, message: "Missing CustomerId" });
    for (x in products) {
        let hold = {
            product: products[x].productId,
            quantity: products[x].quantity,
            price: products[x].price,
            status: "Waiting"
        };
        array.push(hold);
    }
    try {
        const newBill = new Bill({
            status: "Waiting",
            products: array,
            total: total,
            customer: customerId,
        });
        await newBill.save();
        res.json({
            success: true,
            message: "Order Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Interval server error" });
    }
});

module.exports = router;

const Bill = require('../models/Bill')
const Product = require('../models/Product')
const mongoose = require("mongoose");

module.exports = {
    getBill: async (customerId) => {
        return await Bill.find(customerId)
            .populate("products.product")
            .select("-__v");
    },

    getUserByIdProduct: async (products) => {
        products = products.map(id => mongoose.Types.ObjectId(id))
        return await Product.aggregate([
            { "$match": { "_id": { "$in": products } } },
            { "$group": { "_id": "$user" } },
        ]);
    }
}
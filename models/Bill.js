const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Bill = new Schema({
    products: [{
        product: {
            type: String,
            ref: "products",
        },
        quantity: Number,
        price: Number,
        status: String,
        _id: false
    }],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    customer: {
        type: String,
        ref: "customers",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

Bill.methods.setStatus = function () {
    if(this.products.some((product) => product.status === "Waiting")) {
        this.status = "Waiting"
    } else if(this.products.every((product) => product.status === "Rejected")) {
        this.status = "Rejected"
    } else {
        this.status = "Accepted"
    }
}

Bill.methods.setProducts = function(_id) {
    this.products = this.products.filter((product) => _id.indexOf(product.product._id.toString()) != -1)
}

Bill.methods.setTotal = function() {
    this.total = this.products.reduce((total, item) => total + item.price * item.quantity, 0)
}

module.exports = mongoose.model("bills", Bill);
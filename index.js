const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require('morgan')
require("dotenv/config");
//Import routes
const authRouter = require("./routes/auth");
const customerRouter = require("./routes/customer");
const productsRouter = require("./routes/products");
const billsRouter = require("./routes/bill");
//Middleware using

const app = express();
const http = require('http').createServer(app);
const io = require('./socket/socket.js')(http);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: '*',}));

//routes
app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/products", productsRouter);
app.use("/api/bill", billsRouter);


http.listen(1201, () => console.log(`App listening at http://localhost:1201`));

mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connect DB Success"))
    .catch((err) => console.error(err));
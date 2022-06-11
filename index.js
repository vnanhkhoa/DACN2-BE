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
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });
app.use(cors({ origin: '*',}));

//routes
app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/products", productsRouter);
app.use("/api/bill", billsRouter);

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`App listening at http://localhost:${port}`));

mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connect DB Success"))
    .catch((err) => console.error(err));
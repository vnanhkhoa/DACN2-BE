const UserRepository = require("../repositories/user.repository")
const Bill = require("../models/Bill")
let users = []

//add user
const addUser = (userID, id) => {
    users[userID] = id
}

//delete user 
const deleteUser = (id) => {
    for (let key in Object.keys(users)) {
        if (users[key] == id) {
            delete users[id]
            break
        }
    }
}

module.exports = (http) => {
    const io = require("socket.io")(http);

    io.on('connection', (socket) => {
        console.log("Co nguoi ket noi " + socket.id);

        //get user
        socket.on('getUser', userID => {
            addUser(userID, socket.id);

            console.log(users);
        })

        socket.on('pay', async (bill) => {
            const u = await UserRepository.getUserByIdProduct(JSON.parse(bill));
            for (let index = 0; index < u.length; index++) {
                const id = u[index]._id.toString();
                if (users[id] !== undefined) {
                    io.to(users[id]).emit("load-bill")
                }
            }
            socket.emit("reload")
        })

        socket.on('update-bill', async (data) => {
            const { status, _ids } = data;
            const bill = await Bill.findOne({ _id: data._id })
                .populate("products.product")
                .select("-__v");

            bill.products.forEach((product) => {
                if (_ids.indexOf(product.product._id.toString()) !== -1) {
                    product.status = status
                }
            })
            bill.setStatus();
            await bill.save();

            socket.emit("load-bill")
            io.to(users[data.customer]).emit("reload")
        })

        // remove user
        socket.on('disconnect', () => {
            deleteUser(socket.id);
            console.log(users)
        })
    });
}
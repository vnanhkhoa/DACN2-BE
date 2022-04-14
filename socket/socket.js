let users = []

//add user
const addUser = (userID, id) => {
    const i = users.findIndex(user => user.userID == userID);
    if(i != -1) {
        users[i].id = id;
    } else users.push({ userID, id });
}

//delete user 
const deleteUser = (id) => {
    users = users.filter(user => user.id !== id)
}


module.exports = (http) => {
    const io = require("socket.io")(http);

    io.on('connection', (socket) => {
        console.log("Co nguoi ket noi "+socket.id);

        //get user
        socket.on('getUser', userID => {
            addUser(userID, socket.id);
            console.log(users);
        })

        socket.on('pay', (bill) => {

        })

        socket.on('update-bill', () => {
            
        })

        // remove user
        socket.on('disconnect', () => {
            deleteUser(socket.id);
            console.log(users)
        })
    });
}
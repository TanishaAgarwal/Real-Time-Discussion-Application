const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const {addUser, removeUser, getUser, getUsersInRoom} = require('./Users')
const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, name, room});
        if(error){
            return callback(erro)
        }
        socket.emit('msg', ({user:'Admin', text:`Hello ${user.name}, Welcom to ${user.room} room.`}));
        socket.broadcast.to(user.room).emit('msg', {user:'Admin', text:`${user.name} joined !`});
        socket.join(user.room);

        io.to(user.room).emit('roomData', {room:user.room, users:getUsersInRoom(user.room)})

        callback();
    });

    socket.on('sendMsg', (msg, callback) => {
        const user = getUser(socket.id);
        
        io.to(user.room).emit('msg', {user:user.name, text:msg});
        io.to(user.room).emit('roomData', {room:user.room, users:getUsersInRoom(user.room)})

        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('msg', {user:'Admin', text:`${user.name} has left !`});
            io.to(user.room).emit('roomData', {room:user.room, users:getUsersInRoom(user.room)})
        }
    });
});

app.use(router);

server.listen(PORT, () => {
    console.log("Server is running on PORT no. : ", PORT)
});
const express= require('express');
const app = express();
const socket=require('socket.io');
const http =require('http');
const path = require('path');
const moment = require('moment');

const users=[];
function userJoin(id,username,room){
    const user ={id,username,room};
    users.push(user);
    return user;
}

function findUser(id){
    return users.find(user=> user.id === id);
}

function leaveUser(id){
    const index=users.findIndex(user=> user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

function getRoomUsers(room){
    return users.filter(user=> user.room === room);
}

function formatMessage(username,text){
    return {
        username,text,time:moment().format('h:mm a')
    }
}



const server = http.createServer(app);
const io = socket(server);

app.use(express.static(path.join(__dirname,'public')))


io.on('connection',(socket)=>{
    
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);

        socket.join(user.room);
        socket.emit('chat',formatMessage('Admin','Welcome to Chatomista'));
        socket.broadcast.to(user.room).emit('chat',formatMessage('Admin',`${user.username} has joined the ${user.room} room` ));
    })
    
    
    socket.on('chatMessage',(msg)=>{
        const user =findUser(socket.id);
        io.to(user.room).emit('chat',formatMessage(user.username,msg));
    });
    socket.on('disconnect',()=>{
        const user = leaveUser(socket.id);
        if(user){
            io.to(user.room).emit('chat',formatMessage('Admin',`${user.username} has left the room` ));
        };
        io.to(user.room).emit('roomUsers',{room:user.room,users:getRoomUsers(user.room)});
        
    });
})



const port = process.env.PORT || 3000;
server.listen(port,()=>{
    console.log(`We are listening to port ${port}`)
});

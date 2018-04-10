'use strict';
var express= require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
//process.env.PORT || 3000 : whatever is in the environment variable PORT, or 3000 if there's nothing there. (running PORT=1234 node index.js sets port to 1234(Windows: set PORT=1234 then npm start in new line)
var port = process.env.PORT || 3000; 
var userList = [];
var allSockets = {};
var logic = require('./util/logicHelper')
var userCount = 0;
var connectionCount = 0;
var login=false
/*This is used as a middleware to serve files from public folder, through the express server address no
*/
app.use(express.static(path.join(__dirname, 'public')));

http.listen(port, function(){
    console.log('listening on *:' +port);
});
// on connection handler
io.on('connection', function(socket){
    connectionCount++;
    console.log('a user just connected!');
    console.log('current connections:' + connectionCount);
    
    //disconnect event
    socket.on('disconnect', function(){
        connectionCount--;
        socket.broadcast.emit('user disconnected', {
            username:socket.username,
            userCount:userCount
        });
        console.log('a user just disconnected!');
        console.log('current connections:' + connectionCount);
        if(login){
            --userCount;
        }
        console.log('current users:' + userCount);
    });
    
    //user message event
    socket.on('user message', function(message){
        if(message.startsWith('/w')){

        }else if(message.startsWith('/list')){
            socket.emit('receive user list', {
                userList:userList
            });
        }else{
        socket.broadcast.emit('receive user message', {
            username:socket.username,
            message:message
        });
    }
    });
	
	socket.on('private', function(to, msg){
		var id = allSockets[to];
		io.sockets.connected[id].emit('private', msg);
	});
  
    //login event
    socket.on('login', function(name){
       login=true;
        socket.username=name;
        if(!logic.isNameInArray(userList,socket.username)){
			allSockets[socket.username] = socket.id;
			userList.push(socket.username);
            ++userCount;
            console.log('current users:' + userCount);
            socket.emit('enterChat', {
                userCount:userCount
            });
            socket.emit('user connected', {
                username:socket.username,
                userCount:userCount
            });
        }else{
            socket.emit('user already exists', {
                username:name
            });
        }
    }); 
    
    
});


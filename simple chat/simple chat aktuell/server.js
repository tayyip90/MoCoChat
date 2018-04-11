'use strict';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');
var fs = require('fs');
var path = require('path');
var logic = require('./util/logicHelper')
//process.env.PORT || 3000 : whatever is in the environment variable PORT, or 3000 if there's nothing there. (running PORT=1234 node index.js sets port to 1234(Windows: set PORT=1234 then npm start in new line)
var port = process.env.PORT || 3000;
var userList = [];
var allSockets = {};
var userCount = 0;
var connectionCount = 0;
var login = false
/*This is used as a middleware to serve files from public folder, through the express server address no
*/
app.use(express.static(path.join(__dirname, 'public')));

http.listen(port, function () {
    console.log('listening on *:' + port);
});
// on connection handler
io.on('connection', function (socket) {
    connectionCount++;
    console.log('a user just connected!');
    console.log('current connections:' + connectionCount);


    ss(socket).on('send file', function (stream, data) {
        var filename = data.filename;
        var randomNumbers = logic.generateRandomInt(100000)
        var filepath = './temp/'+logic.hashCode(filename)+'-'+randomNumbers;
        stream.pipe(fs.createWriteStream(filepath));

        //gets called when temporary file finished being created
        stream.on('end', function () {
            if (data.receiver == "all") {
                fs.readFile(filename, function (err, buffer) {
                    socket.broadcast.emit('receive file', { buffer: buffer, 
                                                            filename: filename });
                });
            } else {
                fs.readFile(filename, function (err, buffer) {
                    var id = allSockets[data.receiver];
                    io.sockets.connected[id].emit('receive file', { buffer: buffer, 
                                                                    filename: filename });
                    
                });
            }
            //delete temp file after transmission.
            fs.unlink(filepath, (err) => {
                if (err) throw err;
              });
        });
    });
    //disconnect event
    socket.on('disconnect', function () {
        connectionCount--;
        delete allSockets[socket.username];
        userList = logic.removeFromArray(userList, socket.username);
        socket.broadcast.emit('user disconnected', {
            username: socket.username,
            userCount: userCount
        });
        console.log('a user just disconnected!');
        console.log('current connections:' + connectionCount);
        if (login) {
            --userCount;
        }
        console.log('current users:' + userCount);
    });

    //user message event
    socket.on('user message', function (message) {
        if (message.startsWith('/w')) {

        } else if (message.startsWith('/list')) {
            socket.emit('receive user list', {
                userList: userList
            });
        } else {
            socket.broadcast.emit('receive user message', {
                username: socket.username,
                message: message
            });
        }
    });

    socket.on('private', function (to, msg) {
        var id = allSockets[to];
        io.sockets.connected[id].emit('private', {
            username: socket.username,
            message: msg
        });
    });

    //login event
    socket.on('login', function (name) {
        
        socket.username = name;
        if (!logic.isNameInArray(userList, socket.username)) {
            login = true;
            allSockets[socket.username] = socket.id;
            userList.push(socket.username);
            ++userCount;
            console.log('current users:' + userCount);
            socket.emit('enterChat', {
                userCount: userCount,
                userList:userList
            });
            socket.broadcast.emit('user connected', {
                username: socket.username,
                userCount: userCount,
                userList: userList
            });
        } else {
            socket.emit('user already exists', {
                username: name
            });
        }
    });


});


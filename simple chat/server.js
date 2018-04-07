var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/index', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('register', function(name, pass){
	var exists = false;
	for(var i = 0; i<users.length; i++){
		if(users[i].uname == name) exists = true;
	}
	if(exists){
		socket.emit('failure', "user exists");
	}else{
		var user = {uname: name, upass: pass};
		users.push(user);
	}
  });
  socket.on('login', function(name, pass){
	  var i=0;
	  while(users[i].uname != name || i< users.length) i++;
	  if(i>users.length) {socket.emit('failure', "user doesnt exist");}
	  else if(users[i].upass != pass){ socket.emit('failure', "wrong password");}
	  else{ socket.emit('loginpass');}
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
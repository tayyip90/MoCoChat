
$(function () {

	var $window = $(window);
	var $input
	var socket = io();
	var username;
	var userCount;
	var userList = [];
	var messageto = "all";
	var txt;

	var saveByteArray = (function () {
		console.log("saveByteArray");
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		return function (data, name) {
				var blob = new Blob(data, {type: "octet/stream"}),
						url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = name;
				a.click();
				window.URL.revokeObjectURL(url);
		};
}());

	function addMessage(message) {
		$('.messages').append('<li>' + message + "</li>"); //appends messages as list items to list class messages
	
	}
	function addChatMessage(data) {
		$('.messages').append('<li>' + getTimestamp() + ' ' + data.username + ': ' + data.message + "</li>");
	
	}

	function addPrivateChatMessage(data) {
		$('.pmessages').append('<li>' + getTimestamp() + '' + data.username + ' whispers: ' + data.message + "</li>");

	}
	
	/**
	*
	*displaying users in chatroom
	*
	*/
	function listUsers(data) {
		$(".users").children("li").remove();	//removes old list items
		var inputElement = document.createElement('input'); //create input element of type button and adds as list items into list. to choose the receiver
		inputElement.value = "all";
		inputElement.name = "all";
		inputElement.type = "button";
		inputElement.addEventListener('click', function () { //Eventlistener for buttonclick calling the method to() 
			to(this.name);
		});
		var li = document.createElement('li');
		li.append(inputElement);
		$('.users').append(li);
		for (var i = 0; i < data.length; i++) {
			inputElement = document.createElement('input');
			inputElement.value = data[i];
			inputElement.name = data[i];
			inputElement.type = "button";
			inputElement.addEventListener('click', function () {
				to(this.name);
			});
			li = document.createElement('li');
			li.append(inputElement);
			$('.users').append(li);
		}
	}

	function to(name) { //button name/username 
		messageto = name; //the new receiver
		txt.parentNode.removeChild(txt); //remove old text node
		txt = document.createTextNode("message to: " + messageto); 
		$('.to').append(txt);
	}

	//sends message and receives intern commands
	function sendMessage() {
		var message = $('.inputMessage').val();
		console.log(messageto);
		if (message.startsWith('/list')) {
			$('.inputMessage').val('');
			socket.emit('user message', message);
		} else if (messageto == "all") {
			$('.inputMessage').val('');
			addChatMessage({
				username: username,
				message: message
			});
			socket.emit('user message', message);
		} else {
			$('.inputMessage').val('');
			socket.emit('private', messageto, message);
		}
	}
	function welcomeMessage() {
		addMessage('<h1>Welcome to our Chat!</h1> ')
	}

	/**
	 * 
	 * return a timestamp with the format "m/d/yy h:MM:ss TT"
	 * @type {Date}
	 */
	function getTimestamp() {

		// create a date object with the current time
		var now = new Date();

		// create an array with the current month, day and time
		var date = [now.getDate() + 1, now.getMonth(), now.getFullYear()];

		// create an array with the current hour, minute and second
		var time = [now.getHours(), now.getMinutes(), now.getSeconds()];

		// determine AM or PM suffix based on the hour
		var suffix = (time[0] < 12) ? "AM" : "PM";

		// Convert hour from military time
		time[0] = (time[0] < 12) ? time[0] : time[0] - 12;

		// If hour is 0, set it to 12
		time[0] = time[0] || 12;

		// If seconds and minutes are less than 10, add a zero
		for (var i = 1; i < 3; i++) {
			if (time[i] < 10) {
				time[i] = "0" + time[i];
			}
		}

		// return the formatted string
		return date.join("/") + " " + time.join(":") + " " + suffix;
	}
	//receiving broadcast messsage
	socket.on('receive user message', function (data) {
		addChatMessage(data);
	});
	//receiving private message
	socket.on('private', function (data) {
		addPrivateChatMessage(data);
	});
	
	//entering chat
	//set login page unvisible
	//show chat page ...
	socket.on('enterChat', function (data) {
		$('.loginPage').fadeOut(150);
		$('.chatPage').show();
		$('.loginPage').off('click')
		welcomeMessage()
		listUsers(data.userList)
		if (data.userCount === 1) {
			addMessage('<h1>' + data.userCount + ' User has connected</h1>');
		} else {
			addMessage('<h1>' + data.userCount + ' Users have connected</h1>');
		}
	});
	
	socket.on('user already exists', function (data) {
		console.log(data.username + ' already exists.')
		$('#loginFeedback').text("Username already exists");
	});


	socket.on('user connected', function (data) {
		userCount = data.userCount;
		listUsers(data.userList);
		addMessage('' + data.username + ' has connected.')
	});

	socket.on('user disconnected', function (data) {
		addMessage('<h1>' + data.username + ' has left.</h1>')
	});

	
	socket.on('receive file', function(data) {
    var uint8Arr = new Uint8Array(data.buffer);
		var binary = '';

		saveByteArray([uint8Arr], ''+data.filename);


		/*
		 *	Might be used for drawing pictures when receiving an image file.
		 */
    // for (var i = 0; i < uint8Arr.length; i++) {
		// // binary += String.fromCharCode(uint8Arr[i]);
		// }
		

		
		// var base64String = window.btoa(binary);
		
		// console.log(base64String);
    // var img = new Image();
    // img.onload = function() {
    //     var canvas = document.getElementById('#canvas');
    //     var ctx = canvas.getContext('2d');
    //     var x = 0, y = 0;
    //     ctx.drawImage(this, x, y);
    // }
    // img.src = 'data:image/png;base64,' + base64String;
});


$('#userLogin').submit(function (data) {
	data.preventDefault();
	username = $('#user_input').val().trim();
	socket.emit('login', username);
	txt = document.createTextNode("message to: " + messageto);
	$('.to').append(txt);
});

//by pressing enter message will send
$window.keydown(function (event) {
	if (event.which === 13) {
		if (username) {
			sendMessage();
		}
	}
});

// File Picker on change emitting 'send file' event and streaming file content
$('#file').change(function (e) {
	var file = e.target.files[0];
	var stream = ss.createStream();
	// upload a file to the server.
	ss(socket).emit('send file', stream, { receiver: messageto,
																				file:file,
																				filename:file.name });
	ss.createBlobReadStream(file).pipe(stream);
	$('#file').val('');
	$('#file').after('<p>File uploaded!</p>');
	socket.emit('test');
});
});
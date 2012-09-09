var _internal_handlers = {
    CONNECT_OK: function(data) {
        socket.emit('HAI');
    },

    WELCOME: function(data) {
        nickname = data['nickname'];
        clearInputField();
        socket.emit('JOIN', {'roomname': roomname, 'nickname': nickname});
        addToLog('Hello, ' + data['nickname'] + '!');
        addToLog('Please contribute to lolbr at <a href="https://github.com/vortec/lolbr" target="_blank">Github</a>.');
    },

    JOIN: function(data) {
        if (data['connected'] === true) {
            $('#title_bar_roomname').text(roomname + ': ');
            if (data['nickname'] == nickname) {
                socket.emit('USER_LIST', {});
            } else {
                socket.emit('ROOM_LIST', {nickname: data['nickname']});
            }
        }
        addToLog('<span class="join_message"><span class="join_nickname">' + data['nickname'] + '</span> has joined the room.</span>');
    },

    LEAVE: function(data) {
        addToLog('<span class="leave_message"><span class="leave_nickname">' + data['nickname'] + '</span> has left the room.</span>');
    },

    MESSAGE: function(data) {
        var text = decode_utf8(data['text']);
        addToLog('<span class="text_message"><span class="text_nickname">' + data['nickname'] + '</span>: <span class="text_text">' + text + '</span></span>');
    },

    REQUIRE_NICKNAME: function() {
        var nickname = 'user' + (parseInt(Math.random()*10) * parseInt(Math.random()*10))
        nickname = prompt('What\'s your name?', name);
        socket.emit('NICKNAME', {'nickname': nickname});
    },

    ROOM_LIST: function(data) {
        var roomnames = data['roomnames'];
        addToLog(data['nickname'] + ' is in rooms: ' + roomnames.join(', '));
    },

    USER_LIST: function(data) {
        var nicknames = data['nicknames'];
        addToLog('Users in this room: ' + nicknames.join(', '));
    },

    TOPIC: function(data) {
        $('#title_bar_topic').text(data['topic']);
    }
};

var _socketio_handlers = {
    connect: function() {
        
    },

    connecting: function() {
        console.log('Connecting...');
    },

    disconnect: function() {
        console.log('Disconnected.');
    },

    reconnecting: function() {
        console.log('Reconnecting...')
    }
}


function mergeObjects(obj1, obj2) {
    var result = obj1;
    for (var attr in obj2) {
        result[attr] = obj2[attr];
    }
    return result;
}

var handlers = mergeObjects(_internal_handlers, _socketio_handlers);

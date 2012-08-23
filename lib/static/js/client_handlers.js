var _internal_handlers = {
    AUTH: function(data) {
        nickname = data['nickname'];
        clearInputField();
        socket.emit('JOIN', {'room': room, 'nickname': nickname});
    },

    JOIN: function(data) {
        if (data['nickname'] == nickname) {
            addToLog('Hello, ' + data['nickname'] + '!');
            addToLog('Please contribute to lolbr at <a href="https://github.com/vortec/lolbr" target="_blank">Github</a>.');
        }
        addToLog('<div class="join_message"><span class="join_nickname">' + data['nickname'] + '</span> has joined the room.</div>');
    },

    LEAVE: function(data) {
        addToLog('<div class="leave_message"><span class="leave_nickname">' + data['nickname'] + '</span> has left the room.</div>');
    },

    MESSAGE: function(data) {
        var text = decode_utf8(data['text']);
        addToLog('<div class="text_message"><span class="text_nickname">' + data['nickname'] + '</span>: <span clas="text_text">' + text + '</span></div>');
    },

    REQUIRE_AUTH: function() {
        var nickname = 'user' + (parseInt(Math.random()*10) * parseInt(Math.random()*10))
        nickname = prompt('What\'s your name?', name);
        socket.emit('AUTH', {'nickname': nickname});
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

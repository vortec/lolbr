var _internal_handlers = {
    'JOIN': function(data) {
        if (data['nickname'] == nickname) {
            addToLog('Hello, ' + data['nickname'] + '!');
            addToLog('Please contribute to lolbr at <a href="https://github.com/vortec/lolbr" target="_blank">Github</a>.');
        }
        addToLog(data['nickname'] + ' has joined the room.');
    },

    'MESSAGE': function(data) {
        addToLog(data['nickname'] + ' says: ' + data['text']);
    },

    'LEAVE': function(data) {
    	addToLog(data['nickname'] + ' has left the room.');
    }
};

var _socketio_handlers = {
    'connect': function() {
        clearInputField();
        socket.emit('JOIN', {'room': room, 'nickname': nickname});
    },

    'disconnect': function() {
        addToLog('Disconnectd.');
    },

    'reconnecting': function() {
        addToLog('Reconnecting...')
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

var _internal_handlers = {
    CONNECT_OK: function(data) {
        socket.emit('HAI');
    },

    WELCOME: function(data) {
        nickname = data['nickname'];
        user = new User(nickname);
        user.online = true;

        clearInputField();
        socket.emit('JOIN', {'roomname': room.roomname, 'nickname': nickname});
        log.log('WELCOME', data);
    },

    JOIN: function(data) {
        if (data['connected'] === true) {
            $('#top_bar_roomname').text(room.roomname + ': ');
            $('#username').text(data['nickname'] + ': ');
            if (data['nickname'] == nickname) {
                socket.emit('USER_LIST', {});
            } else {
                socket.emit('ROOM_LIST', {nickname: data['nickname']});
            }
        }
        room.add(data['nickname']);
        log.log('JOIN', data)
    },

    LEAVE: function(data) {
        room.remove(data['nickname']);
        log.log('LEAVE', data);
    },

    MESSAGE: function(data) {
        data['text'] = log.decode_utf8(data['text']);
        log.log('MESSAGE', data);
    },

    REQUIRE_NICKNAME: function() {
        var nickname = 'user' + (parseInt(Math.random()*10) * parseInt(Math.random()*10))
        nickname = prompt('What\'s your name?', name);
        socket.emit('NICKNAME', {'nickname': nickname});
    },

    ROOM_LIST: function(data) {
        log.write(data['nickname'] + ' is in rooms: ' + roomnames.join(', '));
    },

    USER_LIST: function(data) {
        var nicknames = data['nicknames'];
        updateUserlist(nicknames);
    },

    TOPIC: function(data) {
        $('#top_bar_topic').text(data['topic']);
    }
};

var _socketio_handlers = {
    connect: function() {
        
    },

    connecting: function() {
        console.log('Connecting...');
    },

    disconnect: function() {
        user.online = false;
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

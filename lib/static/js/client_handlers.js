var _internal_handlers = {
    CONNECT_OK: function(data) {
        socket.emit('HAI');
    },

    WELCOME: function(data) {
        nickname = data['nickname'];
        user = new User(nickname);
        user.online = true;
        $('#input').removeAttr('disabled');

        clearInputField();
        socket.emit('JOIN', {'roomname': room.roomname, 'nickname': nickname});
        log.log('WELCOME', data);
    },

    JOIN: function(data) {
        if (data['connected'] === true) {  // current user connected to the room
            $('#top_bar_roomname').text(room.roomname + ': ');
            $('#username').text(data['nickname']);
            if (data['nickname'] == nickname) {
                socket.emit('USER_LIST', {});
            }
        } else {
            room.add(data['nickname']);
            userlist.add(data['nickname']);
        }

        log.log('JOIN', data)
    },

    LEAVE: function(data) {
        room.remove(data['nickname']);
        userlist.remove(data['nickname']);
        log.log('LEAVE', data);
    },

    IMAGE: function(data) {
        log.log('IMAGE', data);
    },

    FILE: function(data) {
        log.log('FILE', data);
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
        room.apply(nicknames);
        userlist.apply(nicknames);
    },

    TOPIC: function(data) {
        $('#top_bar_topic').text(data['topic']);
    }
};

var _socketio_handlers = {
    connect: function() {
        clearInputField();
    },

    connecting: function() {
        $('#input').val('Connecting...');
    },

    disconnect: function() {
        $('#input').val('Disconnected.');
        if (user) {
            user.online = false;
        }
        $('#input').attr('disabled', true);
    },

    reconnecting: function() {
        $('#input').val('Reconnecting...');
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

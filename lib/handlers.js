var sanitize = require('validator').sanitize
  , users = require('./users').users;

var _internal_handlers = {
    AUTH: function(io, socket, data) {
        // Sanitize user input
        if (!data['nickname']) {
            return;
        }
        var nickname = sanitize(data['nickname']).entityEncode().trim();
        if (!nickname) {
            socket.disconnect();
            return;
        }

        // Create user object
        users.add(nickname).authenticate(socket);
    },

    JOIN: function(io, socket, data) {
        var user = socket.user;
        var nickname = user.nickname;

        // Sanitize user input
        if (!data['roomname']) {
            return;
        }
        var roomname = sanitize(data['roomname']).entityEncode().trim();
        if (!roomname) {
            socket.disconnect();
            return;
        }
        if (user.inRoom(roomname)) {
            socket.disconnect();
            return;
        }

        // Join room
        user.joinRoom(roomname);
        user.addSocket(roomname, socket);

        var args = {
            'room': roomname,
            'nickname': nickname
        }

        io.sockets.in(roomname).emit('JOIN', args);
    },


    MESSAGE: function(io, socket, data) {
        var user = socket.user;
        var roomname = socket.roomname;
        var nickname = user.nickname;

        // Sanitize user input
        if (!data['text']) {
            return;
        }
        var text = sanitize(data['text']).entityEncode().trim();
        if (!text) {
            return;
        }

        // Broadcast message
        var args = {
            'nickname': nickname,
            'text': text
        }
        io.sockets.in(roomname).emit('MESSAGE', args);
    }
}


var _socketio_handlers = {
    disconnect: function(io, socket, data) {
        var user = socket.user;
        var roomname = socket.roomname;
        var nickname = user.nickname;

        if (user.socketInRoom(roomname, socket)) {
            var args = {
                'nickname': nickname
            }
            user.deleteSocket(roomname, socket);
            io.sockets.in(roomname).emit('LEAVE', args);
        }
    }
}

function mergeObjects(obj1, obj2) {
    var result = obj1;
    for (var attr in obj2) {
        result[attr] = obj2[attr];
    }
    return result;
}

exports.handlers = mergeObjects(_internal_handlers, _socketio_handlers);

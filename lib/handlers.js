var sanitize = require('validator').sanitize
  , users = require('./users').users;

var _internal_handlers = {
    JOIN: function(io, socket, data) {
        var room = sanitize(data['room'].trim()).entityDecode();
        var nickname = sanitize(data['nickname'].trim()).entityEncode();

        if (!room || !nickname) {
            socket.disconnect();
            return;
        }

        socket.nickname = nickname;
        socket.room = room;
        socket.join(room);

        var args = {
            'room': room,
            'nickname': nickname
        }

        var user = users.addUser(nickname);
        user.joinRoom(room);
        user.addSocket(room, socket);

        io.sockets.in(room).emit('JOIN', args);
    },


    MESSAGE: function(io, socket, data) {
        var room = socket.room;
        var nickname = socket.nickname;
        var text = sanitize(data['text']).entityEncode();

        var args = {
            'nickname': nickname,
            'text': text
        }

        io.sockets.in(room).emit('MESSAGE', args);
    }
}


var _socketio_handlers = {
    disconnect: function(io, socket, data) {
        var room = socket.room;
        var nickname = socket.nickname;

        var args = {
            'nickname': nickname
        }

        io.sockets.in(room).emit('LEAVE', args);
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

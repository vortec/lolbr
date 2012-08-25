var sanitize = require('validator').sanitize
  , users = require('./users').users;

var _internal_handlers = {
    AUTH: function(io, socket, data) {
        var nickname = sanitize(data['nickname']).entityEncode().trim();

        if (!nickname) {
            socket.disconnect();
            return;
        }

        socket.session.nickname = nickname;
        socket.session.save();
        socket.emit('AUTH', {'nickname': nickname});
    },

    JOIN: function(io, socket, data) {
        var nickname = socket.session.nickname;
        var room = sanitize(data['room']).entityEncode().trim();
        var user = users.addUser(nickname);

        if (!room) {
            socket.disconnect();
            return;
        }
        if (user.inRoom(room)) {
            socket.disconnect();
            return;
        }

        user.joinRoom(room);
        user.addSocket(room, socket);

        var args = {
            'room': room,
            'nickname': nickname
        }

        io.sockets.in(room).emit('JOIN', args);
    },


    MESSAGE: function(io, socket, data) {
        var room = socket.room;
        var nickname = socket.session.nickname;
        var text = sanitize(data['text']).entityEncode().trim();

        if (!text) {
            return;
        }

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
        var nickname = socket.session.nickname;
        var user = users.getUser(nickname);

        if (user.socketInRoom(room, socket)) {
            var args = {
                'nickname': nickname
            }
            user.deleteSocket(room, socket);
            io.sockets.in(room).emit('LEAVE', args);
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

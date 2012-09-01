var sanitize = require('validator').sanitize
  , users = require('./users').users
  , rooms = require('./rooms').rooms
  ;

var _auth_handlers = {
    /*AUTH: function(io, socket, input) {

    }*/

    HAI: function(io, socket, input) {
        var nickname = socket.session.nickname;
        if (!nickname) {
            socket.emit('REQUIRE_NICKNAME', {reason: 'UNKNOWN'});
        } else {
            var user = users.getOrCreate(nickname);
            var auth = user.authenticate(socket);

            if (auth) {
                socket.emit('WELCOME', {nickname: nickname});
            } else {
                socket.disconnect();
            }
        }
    },

    NICKNAME: function(io, socket, input) {
        var input_nickname = input['nickname'];
        if (!input_nickname) {
            socket.emit('MISSING_PARAMETER', {parameter: 'nickname'});
            return;
        }
        
        var nickname = users.sanitizeName(input_nickname);
        if (!nickname) {
            socket.emit('REQUIRE_NICKNAME', {reason: 'NOT_SANE'});
        } else {
            var user = users.getOrCreate(nickname);
            var auth = user.authenticate(socket);

            if (auth) {
                socket.emit('WELCOME', {nickname: nickname});
            } else {
                socket.disconnect();
            } 
        }
    },

    JOIN: function(io, socket, input) {
        var input_roomname = input['roomname'];
        if(!input_roomname) {
            socket.emit('MISSING_PARAMETER', {parameter: 'roomname'});
            return;
        }

        var roomname = rooms.sanitizeName(input_roomname);
        if (roomname) {
            var room = rooms.getOrCreate(roomname);
            if (!socket.user.inRoom(room)) {
                socket.user.join(room, socket);
                socket.room.broadcast('JOIN', {nickname: socket.session.nickname});
            } else {
                socket.disconnect();
            }
        }
    }
}

var _internal_handlers = {
    ROOM_LIST: function(io, socket, input) {
        var input_nickname = input['nickname'];
        if (!input_nickname) {
            socket.emit('MISSING_PARAMETER', {parameter: 'nickname'});
            return;
        } else {
            var user = users.get(input_nickname);
            if (user) {
                socket.emit('ROOM_LIST', {nickname: user.nickname, roomnames: user.listRooms()});
            }
        }

    },

    MESSAGE: function(io, socket, input) {
        var input_text = input['text'];
        if (!input_text) {
            socket.emit('MISSING_PARAMETER', {parameter: 'roomname'});
            return;
        }

        var text = input_text;  //TODO: sanitize again!
        socket.room.broadcast('MESSAGE', {nickname: socket.session.nickname, text: text});
    },

    USER_LIST: function(io, socket, input) {
        socket.user.push(socket.room, 'USER_LIST', {nicknames: socket.room.getNicknames()});
    }
}


var _socketio_handlers = {
    disconnect: function(io, socket, input) {
        if (socket.room) {
            socket.room.broadcast('LEAVE', {nickname: socket.session.nickname});
            socket.user.leave(socket.room);
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

exports.handlers = mergeObjects(mergeObjects(_auth_handlers, _internal_handlers), _socketio_handlers);

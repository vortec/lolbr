var sanitize = require('validator').sanitize
  , users = require('./users').users
  , rooms = require('./rooms').rooms
  , utils = require('./utils')
  , fs = require('fs')
  ;

var _auth_handlers = {
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
            return;
        }

        var user = users.getOrCreate(nickname);
        if (user.online) {
            socket.emit('REQUIRE_NICKNAME', {reason: 'TAKEN'});
            return;
        }

        var auth = user.authenticate(socket);
        if (auth) {
            socket.emit('WELCOME', {nickname: nickname});
        } else {
            socket.disconnect();
        }
    },

    JOIN: function(io, socket, input) {
        var input_roomname = input['roomname'];
        if (!input_roomname) {
            socket.emit('MISSING_PARAMETER', {parameter: 'roomname'});
            return;
        }

        var roomname = rooms.sanitizeName(input_roomname);
        if (roomname) {
            var room = rooms.get(roomname);
            if (!room) {
                room = rooms.add(roomname);
                room.owner = socket.user;
            }
            if (!socket.user.inRoom(room)) {
                socket.user.join(room, socket);
                socket.user.push(room, 'TOPIC', {topic: room.settings.topic});
                socket.room.replay(socket.user, 15, function() {
                    socket.user.push(room, 'JOIN', {nickname: socket.session.nickname, connected: true});
                });
                socket.room.message(socket.user, 'JOIN', {nickname: socket.session.nickname});
            } else {
                socket.disconnect();
            }
        }
    }
}

/*var _rights_handlers = {
    GRANT: function() {},
    REVOKE: function() {}
}*/

var _internal_handlers = {
    FILE: function(io, socket, input) {
        var file = input['file'];
        if (!file) {
            socket.emit('MISSING_PARAMETER', {parameter: 'file'});
            return;
        }

        var filename = input['filename'];
        if (!filename) {
            socket.emit('MISSING_PARAMETER', {parameter: 'filename'});
            return;
        }

        // Check for maximum file size
        var length = file.length;
        if (length > io.config.max_file_size) {
            return;
        }

        // Ensure target folder exists
        var folder = '/static/uploads/' + socket.roomname;
        if (!fs.existsSync(__dirname + '/' + folder)) {
            fs.mkdirSync(__dirname + '/' + folder);
        }

        // Increase file counter in case targetted filename already exists
        var i = 0;
        var path = '/';
        while (fs.existsSync(path)) {
            var internal_filename = socket.user.nickname + '_' + i + '_' + utils.md5(file) + '_' + length + '_' + filename;
            var path = __dirname + folder + '/' + internal_filename;
            i++;
        }

        // Decode from base64 & save to filesystem
        var decoded = utils.decodeBase64(file);
        fs.writeFileSync(path, decoded[1], 'binary');

        var url = '/uploads/' + socket.roomname + '/' + internal_filename;

        if (decoded[0].substr(0, 6) == 'image/') {
            socket.room.broadcast('IMAGE', {
                base64: false,
                file: url,
                filename: filename,
                mime_type: decoded[0],
                nickname: socket.user.nickname
            });
        } else {
            socket.room.broadcast('FILE', {
                file: url,
                filename: filename,
                mime_type: decoded[0],
                nickname: socket.user.nickname
            })
        }

        /*if (file.substr(0, 11) == 'data:image/') {  // TODO: this check is not sufficient, but regex is too slow
            socket.room.broadcast('IMAGE', {
                base64: true,
                file: file,
                filename: filename,
                nickname: socket.session.nickname
            });   
        } else {

        }*/
        return;

        /*
        var file_regex = /data:(.*\/.*);base64,(.*)/g;
        var match = file_regex.exec(file);
        if (match) {  // is valid FileReader (browser) response
            var mime_type = match[1];
            if (mime_type.substr(0, 6) == 'image/') {  // TODO: this check is not sufficient
                var base64 = match[2];
                socket.room.broadcast('IMAGE', {
                    base64: true,
                    file: base64,
                    filename: filename,
                    mime_type: mime_type,
                    nickname: socket.session.nickname
                });

                
                var buffer = new Buffer(base64, 'base64');
                var content = buffer.toString('ascii');
                
            }
        } else {
            console.log('couldnt match')
            console.log(file);
        }*/
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

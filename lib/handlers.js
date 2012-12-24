var sanitize = require('validator').sanitize
  , users = require('./users').users
  , rooms = require('./rooms').rooms
  , utils = require('./utils')
  , constants = require('./constants')
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

        // TODO: remove nastyness from all path huddling

        // Ensure target folder exists
        var folder = '/static/uploads/' + socket.roomname;
        if (!fs.existsSync(__dirname + '/' + folder)) {
            fs.mkdirSync(__dirname + '/' + folder);
        }

        // Increase file counter in case targetted filename already exists
        var i = 0;
        var path = '/';
        while (fs.existsSync(path)) {
            var internal_filename = socket.user.nickname + '_' + i + '_' + filename;
            var path = __dirname + folder + '/' + internal_filename;
            i++;
        }

        // Decode browser string (comes from FileReader API)
        var browser_file = utils.infoFromBrowserFile(file);
        var url = '/uploads/' + socket.roomname + '/' + internal_filename;
        var _splitted = filename.split('.');
        var extension = _splitted[_splitted.length-1];

        var args = {
            base64: false,
            filename: filename,
            internal_filename: internal_filename,
            type: browser_file.type,
            mime_type: browser_file.mime_type,
            nickname: socket.user.nickname
        }

        if (constants.code_file_extensions.indexOf(extension) != -1) {
            // If we decoded the content of the code file, our "template system" would replace strings
            // like "[foobar]" in it (if such an attribute exists). That leads to incorrect code
            // pastes and could also become a security issue. Leaving the user input base64-encoded
            // saves us CPU time, too :)
            args['base64'] = true;
            args['file'] = browser_file.base64;
            socket.room.broadcast('CODE', args);
        } else {
            var decoded_file = utils.decodeBase64(browser_file.base64);
            fs.writeFileSync(path, decoded_file, 'binary');
            args['file'] = url;

            // Try to create thumbnail if mime type says it's an image
            if (browser_file.type == 'image') {
                utils.makeThumbnailFromMemory(decoded_file, function(err, thumbnail, stderr) {
                    if (!err) {  // TODO: configurize this
                        var _thumbnail_path = __dirname + folder + '/thumb_' + internal_filename;
                        fs.writeFileSync(_thumbnail_path, thumbnail, 'binary');
                        args['thumbnail'] = '/uploads/' + socket.roomname + '/thumb_' + internal_filename;
                    }
                    socket.room.broadcast('FILE', args)
                })
            } else {
                socket.room.broadcast('FILE', args);
            }
        }
    },

    MESSAGE: function(io, socket, input) {
        var input_text = input['text'];
        if (!input_text) {
            socket.emit('MISSING_PARAMETER', {parameter: 'roomname'});
            return;
        }

        var text = sanitize(input_text).entityEncode();  //TODO: sanitize again!
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

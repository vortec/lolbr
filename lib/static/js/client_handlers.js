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
        if (data['connected'] === true) {  // this user has connected to the room
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

    CODE: function(data) {
        var xid = data['internal_filename'] + '_' + parseInt(Math.random()*1000000).toString();
        var file_data = atob(data['file']);
        var encoded_data = jQuery('<div />').text(file_data).html();
        encoded_data = encoded_data.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        log.log('CODE_PRE', data);
        log.write('<pre id="'+xid+'"><code>'+encoded_data+'</code></pre>');
        hljs.highlightBlock(document.getElementById(xid));
        log.log('CODE_POST', data);
    },

    FILE: function(data) {
        switch(data['type']) {
            case 'image':
                log.log('IMAGE_THUMB', data);
                break;

            default:
                log.log('FILE', data);
                break;
        }

    },

    MESSAGE: function(data) {
        if (data['nickname'] == nickname) {
            log.log('MESSAGE_OWN', data);
        } else {
            log.log('MESSAGE', data);
        }
        notifyBrowser(data);
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

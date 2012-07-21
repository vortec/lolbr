var _handlers = {

    'CONNECT': function(io, socket, data) {
        var room = data['room'];
        var nickname = data['nickname'];
        socket.nickname = nickname;
        socket.join(room);

        var args = {
            'room': room,
            'nickname': nickname
        }

        io.sockets.in(room).emit('CONNECT', args);
    },


    'MESSAGE': function(io, socket, data) {
        var room = socket.room;
        var nickname = socket.nickname;
        var text = data['text'];

        var args = {
            'nickname': nickname,
            'text': text
        }
        
        io.sockets.in(room).emit('MESSAGE', args);
    },

    

}

exports.handlers = _handlers;

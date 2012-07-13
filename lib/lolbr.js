var express = require('express')
  , socketio = require('socket.io')
  , http = require('http')
  , util = require('util');


function startServer(port) {
    port = port ? port : 8000;

    var app = express();
    var server = http.createServer(app);
    var io = socketio.listen(server);

    server.listen(port);
    app.use('/', express.static(__dirname + '/static/index.html'));
    app.use(express.static(__dirname + '/static'));

    registerEvents(io);

    io.log.info(util.format('lolbr started on port %d', port));
}

function registerEvents(io) {
    var handlers = require('./handlers').handlers;

    io.sockets.on('connection', function (socket) {
        socket.on('msg', function (data) {
            io.sockets.emit('msg', socket.nickname + ': ' + data);
        });
        socket.on('nickname', function(nickname) {
            socket.nickname = nickname;
        })
    });
}

exports.start = startServer;

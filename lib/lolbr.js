var express = require('express')
  , socketio = require('socket.io')
  , http = require('http')
  , util = require('util');

var app, server, io;
var handlers = require('./handlers').handlers;


function startServer(port) {
    port = port ? port : 8000;

    // Open server
    app = express();
    server = http.createServer(app);
    io = socketio.listen(server);
    server.listen(port);

    // Register static directory for browser output
    app.use('/', express.static(__dirname + '/static/index.html'));
    app.use(express.static(__dirname + '/static'));

    // Fire up functionality
    registerEvents(io);

    io.log.info(util.format('lolbr started on port %d', port));
}


function registerEvents(io) {
    io.sockets.on('connection', function (socket) {
        // create wrapping function to adjust scope
        function _wrapRegistration(io, socket, key, func) {
            return function(data) {
                func(io, socket, data);
            };
        }

        // register all event functions (handlers) from handlers.js
        for (var event in handlers) {
            socket.on(event, _wrapRegistration(io, socket, event, handlers[event]));
        }
    });
}

exports.start = startServer;

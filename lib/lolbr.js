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

    // Output index.html on any URL.
    // The client will use the first part after / as room name.
    app.get('/:room?', function(req, res) {
        var room = req.params.room;
        if (room) {
            res.sendfile(__dirname + '/static/index.html');
        } else {
            res.send('lolbr');
        }
    });
    // Register static directory for browser output
    app.use('/js', express.static(__dirname + '/static/js'));

    // Fire up functionality
    registerEvents(io);

    io.log.info(util.format('lolbr started on port %d', port));
}


function registerEvents(io) {
    io.sockets.on('connection', function (socket) {
        // Create wrapping function to adjust the scope
        // in which the handlers are being executed.
        function _wrapRegistration(io, socket, key, func) {
            return function(data) {
                func(io, socket, data);
            };
        }

        // Register all event functions (handlers) from handlers.js
        for (var event in handlers) {
            socket.on(event, _wrapRegistration(io, socket, event, handlers[event]));
        }
    });
}

exports.start = startServer;

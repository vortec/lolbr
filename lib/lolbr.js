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

        // TODO: understand scopes, make this generic approach work
        /*for (var event in handlers) {
            socket.on(event, function(data) {
                var handler_func = handlers[event];
                var handler_args = [io, socket, data];
                handler_func.apply(null, handler_args);
            });            
        }*/

        // Register events
        socket.on('CONNECT', function(data) {
            var handler_func = handlers['CONNECT'];
            var handler_args = [io, socket, data];
            handler_func.apply(null, handler_args);
        });
        socket.on('MESSAGE', function(data) {
            var handler_func = handlers['MESSAGE'];
            var handler_args = [io, socket, data];
            handler_func.apply(null, handler_args);
        });
    });
}

exports.start = startServer;

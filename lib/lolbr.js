var express = require('express')
  , socketio = require('socket.io')
  , crypto = require('crypto')
  , http = require('http')
  , util = require('util')
  , connect = require('express/node_modules/connect')
  , cookie = require('express/node_modules/cookie')
  //, parseCookie = connect.utils.parseCookie
  , MemoryStore = connect.middleware.session.MemoryStore
  , store;

var Lolbr = function() {
    var self = this;
    var app, server, io;
    var handlers = require('./handlers').handlers;

    this.startServer = function(port) {
        port = port ? port : 8000;

        self.getSecret(function(secret) {
            console.log(secret);
            self.createServer(port, secret);
            self.registerEvents(secret);
        });
    }

    this.createServer = function(port, secret) {
        // Open server
        app = express();
        server = http.createServer(app);
        io = socketio.listen(server);
        server.listen(port);

        // Enable sessions
        app.use(express.cookieParser());
        app.use(express.session({
            secret: secret,
            key: 'express.sid',
            store: store = new MemoryStore()
        }));

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

        //self.registerEvents();
        io.log.info(util.format('lolbr started on port %d', port));
    }

    this.getSecret = function(callback) {
        crypto.randomBytes(48, function(ex, buf) {
            callback(buf.toString('hex'));
        });
    }


    this.registerEvents = function(secret) {
        io.set('authorization', function(data, accept) {
            if (!data.headers.cookie) {
                return accept('No cookie transmitted.', false);
            }

            // and the award for best API change goes to...:
            // https://github.com/senchalabs/connect/issues/588#issuecomment-6849899
            // previous:
            // data.cookie = parseCookie(data.headers.cookie);
            // now:
            data.cookie = connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(data.headers.cookie)), secret);
            data.sessionID = data.cookie['express.sid'];

            store.load(data.sessionID, function(err, session) {
                if (err || !session) {
                    return accept('Error', false);
                } else {
                    data.session = session;
                    return accept(null, true);
                }
            });
        });

        io.sockets.on('connection', function(socket) {
            // Connect Socket.IO sockets with express sessions
            socket.session = socket.handshake.session;

            // Create wrapping function to adjust the scope
            // in which the handlers are being executed.
            function wrap(io, socket, key, func) {
                return function(data) {
                    func(io, socket, data);
                };
            }

            // Register all event functions (handlers) from handlers.js
            for (var event in handlers) {
                socket.on(event, wrap(io, socket, event, handlers[event]));
            }
        });
    }
}

var lolbr = new Lolbr();
exports.start = lolbr.startServer;

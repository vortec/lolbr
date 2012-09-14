var express = require('express')
  , socketio = require('socket.io')
  , crypto = require('crypto')
  , http = require('http')
  , util = require('util')
  , fs = require('fs')
  , connect = require('connect')
  , cookie = require('cookie')
  , orm = require('orm')
  , Session = connect.middleware.session.Session
  , MemoryStore = connect.middleware.session.MemoryStore
  , config = require('../config')
  , persistance = require('./persistance')
  ;

var handlers, rooms, users;

var Lolbr = function() {
    var self = this;
    var app, server, io;

    this.startServer = function(port) {
        port = port ? port : config.port;

        // Open server
        app = express();
        server = http.createServer(app);
        io = socketio.listen(server);

        // Start server when secret key is available
        self.receiveSecret(function(secret) {
            self.initPersistance(function() {
                self.createServer(port, secret);
                self.registerEvents(secret);
                io.log.info(util.format('lolbr started on port %d', port));
            });
        });
    }

    this.initPersistance = function(callback) {
        persistance.connection = config.connection;
        persistance.store = config.store;
        if (persistance.connection) {
            orm.connect(config.protocol, config.connection, function(success, db) {
                if (success) {
                    persistance.db = db;
                    users = require('./users');
                    rooms = require('./rooms');
                    handlers = require('./handlers').handlers;
                    rooms.createModel(function(success) {
                        if (!success) {
                            persistance.db = null;
                        }
                        callback();
                    });
                } else {
                    console.error('Could not connect to database.');
                }
            });
        } else {
            callback();
        }
    }

    this.createServer = function(port, secret) {
        // Bind to port
        server.listen(port);

        // Enable sessions
        app.use(express.cookieParser());
        app.use(express.session({
            secret: secret,
            key: 'express.sid',
            store: store = persistance.store
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
        app.use('/css', express.static(__dirname + '/static/css'));
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
            // ... and now:
            var _signed_cookies = cookie.parse(decodeURIComponent(data.headers.cookie));
            data.cookie = connect.utils.parseSignedCookies(_signed_cookies, secret);
            data.sessionID = data.cookie['express.sid'];
            data.sessionStore = store;

            store.load(data.sessionID, function(err, session) {
                if (err || !session) {
                    return accept('Error', false);
                } else {
                    data.session = new Session(data, session);
                    return accept(null, true);
                }
            });
        });

        io.sockets.on('connection', function(socket) {
            // Connect Socket.IO sockets with express sessions
            socket.session = socket.handshake.session;

            // Create wrapping function to adjust the scope in which the handlers are being executed.
            function wrap(io, socket, key, func) {
                return function(incoming) {
                    func(io, socket, incoming);
                };
            }

            // Register all event functions (handlers) from handlers.js
            for (var xevent in handlers) {
                socket.on(xevent, wrap(io, socket, xevent, handlers[xevent]));
            }

            socket.emit('CONNECT_OK');
        });
    }

    this.receiveSecret = function(callback) {
        fs.readFile('secret.key', 'ascii', function(err, data) {
            if (err) {
                io.log.info('Generating new key...');
                crypto.randomBytes(48, function(ex, buf) {
                    data = buf.toString('hex');
                    fs.writeFile('secret.key', data, function(err) {
                        if (!err) {
                            io.log.info('Wrote new key to secret.key');
                        }
                    });
                    callback(data);
                });
            } else {
                io.log.info('Read key from secret.key')
                callback(data);
            }
        });
    }
}

var lolbr = new Lolbr();
exports.start = lolbr.startServer;

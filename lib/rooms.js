var db = require('./persistance').db;
var users = require('./users').users;

if (db) {
    var PersistantRoom = db.define('room', {
        roomname: String,
        owner: String,
        topic: String,
        welcome_message: String
    });
    PersistantRoom.sync();
}

var Room = function(registry, roomname) {
    var self = this;
    this.registry = registry;
    this.roomname = roomname;
    this.users = {};
    this.owner = null;
    this.topic = '';
    this.welcome_message = '';
    this.proom = null;  // persistant object from node-orm
    this._deleted = false;

    this.broadcast = function(xevent, data) {
        for (var nickname in self.users) {
            var user = self.users[nickname];
            user.push(self, xevent, data);
        }
    }

    this.purge = function() {
        self.registry.remove(self);
    }

    this.addUser = function(user) {
        var nickname = user.nickname;
        self.users[nickname] = user;
    }

    this.getNicknames = function() {
        return Object.keys(self.users);
    }

    this.hasUser = function(user) {
        return this.hasUserByName(user.nickname);
    }

    this.hasUserByName = function(nickname) {
        return self.users.hasOwnProperty(nickname);
    }

    this.removeUser = function(user) {
        delete self.users[user.nickname];
    }

    this.sync = function() {
        if (!db) {
            return;
        }

        if (self.proom) {
            self.savePersistantAttributes();
        } else {
            PersistantRoom.find({roomname: self.roomname}, function(proom) {
                if (proom) {
                    self.proom = proom[0];
                    self.readPersistantAttributes();
                } else {
                    self.proom = new PersistantRoom();
                    self.savePersistantAttributes();
                }
            });
        }
    }

    this.readPersistantAttributes = function() {
        self.roomname = self.proom.roomname;
        self.owner = users.getOrCreate(self.proom.owner);
        self.topic = self.proom.topic;
        self.welcome_message = self.proom.welcome_message;
    }

    this.savePersistantAttributes = function() {
        self.proom.roomname = self.roomname;
        self.proom.owner = self.owner.nickname;
        self.proom.topic = self.topic;
        self.proom.welcome_message = self.welcome_message;
        self.proom.save();
    }
}


var RoomRegistry = function() {
    var self = this;
    this.rooms = {};

    this.add = function(roomname) {
        var room = new Room(self, roomname);
        room.sync();
        self.rooms[roomname] = room;
        return room;
    }

    this.exists = function(roomname) {
        return self.rooms.hasOwnProperty(roomname);
    }

    this.get = function(roomname) {
        if (self.exists(roomname)) {
            return self.rooms[roomname];
        }
        return false;
    }

    this.getOrCreate = function(roomname) {
        var room = self.get(roomname);
        if (!room) {
            room = self.add(roomname);
        }
        return room;
    }

    this.delete = function(roomname) {
        var room = self.get(roomname);
        if (room) {
            room._deleted = true;
            delete self.rooms[roomname];
        }
    }

    this.list = function(roomname) {
        return Object.keys(self.rooms);
    }

    this.sanitizeName = function(roomname) {
        return roomname;
    }
}

exports.rooms = new RoomRegistry();

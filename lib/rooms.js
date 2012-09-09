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

    var PersistantBacklog = db.define('backlog', {
        time: Date,
        'event': String,
        data: String
    });
    PersistantBacklog.hasOne('room', PersistantRoom);
    PersistantBacklog.sync();
}

var Room = function(registry, roomname) {
    var self = this;
    this.registry = registry;
    this.roomname = roomname;
    this.users = {};
    this.owner = null;
    this.proom = null;  // persistant object from node-orm
    this._deleted = false;

    this.settings = {
        topic: '',
        welcome_message: ''
    };

    this.broadcast = function(xevent, data) {
        for (var nickname in self.users) {
            var user = self.users[nickname];
            user.push(self, xevent, data);
        }
        self.log(xevent, data);
    }

    this.message = function(user_from, xevent, data) {
        for (var nickname in self.users) {
            var user = self.users[nickname];
            if (user != user_from) {
                user.push(self, xevent, data);
            }
        }
        self.log(xevent, data);
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
            self.readPersistantSettings();
        } else {
            PersistantRoom.find({roomname: self.roomname}, function(proom) {
                if (proom) {
                    self.proom = proom[0];
                    self.readPersistantSettings();
                } else {
                    self.proom = new PersistantRoom();
                    self.savePersistantSettings();
                }
            });
        }
    }

    this.readPersistantSettings = function() {
        self.owner = users.getOrCreate(self.proom.owner)
        for (var attribute in self.proom) {
            if ((attribute.substr(0, 1) != '_') && (attribute != 'id') && (attribute != 'owner')) {
                self[attribute] = self.proom[attribute];
            }
        }
    }

    this.savePersistantSettings = function() {
        self.proom.owner = self.owner.nickname;
        for (var attribute in self.proom) {
            if ((attribute.substr(0, 1) != '_') && (attribute != 'id') && (attribute != 'owner')) {
                self.proom[attribute] = self[attribute];
            }
        }
        if (self.proom.save !== undefined) {
            self.proom.save();
        }
    }

    this.log = function(xevent, data) {
        if (!db || !self.proom) {
            return;
        }

        var entry = new PersistantBacklog({
            time: new Date(),
            'event': xevent,
            data: JSON.stringify(data),
            room_id: self.proom.id
        });
        entry.save();
    }

    this.replay = function(user, amount, callback) {
        if (!db || !self.proom) {
            callback();
            return;
        }

        PersistantBacklog.find({room_id: self.proom.id}, function(results) {
            for (var i in results) {
                var result = results[i];
                user.push(self, result['event'], JSON.parse(result.data));
            }
            callback();
        });
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

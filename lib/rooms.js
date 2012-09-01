var Room = function(registry, roomname) {
    var self = this;
    this.registry = registry;
    this.roomname = roomname;
    this.users = {};
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

    this.hasUser = function(user) {
        return this.hasUserByName(user.nickname);
    }

    this.hasUserByName = function(nickname) {
        return self.users.hasOwnProperty(nickname);
    }

    this.removeUser = function(user) {
        delete self.users[user.nickname];
    }
}

var RoomRegistry = function() {
    var self = this;
    this.rooms = {};

    this.add = function(roomname) {
        var room = new Room(self, roomname);
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

    this.sanitizeName = function(roomname) {
        return roomname;
    }
}

exports.rooms = new RoomRegistry();

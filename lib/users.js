var User = function(registry, nickname) {
    var self = this;
    this.registry = registry;  // Users objects
    this.nickname = nickname;
    this.online = false;
    this.rooms = {};
    this.sockets = {};
    this._deleted = false;


    this.authenticate = function(socket) {
        socket.user = self;
        socket.session.nickname = self.nickname;
        socket.session.save();
        self.online = true;
        return true;
    }

    this.push = function(room, xevent, data) {
        var roomname = room.roomname;
        self.sockets[roomname].emit(xevent, data);
    }

    this.purge = function() {
        for (var roomname in self.rooms) {
            var room = self.rooms[roomname];
            room.removeUser(self.nickname);
            room.broadcast('LEAVE', {nickname: self.nickname});  // this shouldn't be inside handler, should it?
        }
        self.registry.remove(self.nickname);
    }


    this.join = function(room, socket) {
        var roomname = room.roomname;
        self.rooms[roomname] = room;
        self.sockets[roomname] = socket;
        socket.room = room;
        socket.roomname = room.roomname;
        room.addUser(self);
    }

    this.inRoom = function(room) {
        return self.inRoomByName(room.roomname);
    }

    this.inRoomByName = function(roomname) {
        return self.rooms.hasOwnProperty(roomname);
    }

    this.leave = function(room) {
        var roomname = room.roomname;
        room.removeUser(self);
        delete self.rooms[roomname];
        delete self.sockets[roomname];

        if ((Object.keys(self.rooms).length == 0) && (Object.keys(self.sockets).length == 0)) {
            self.purge();
        }
    }

    this.listRooms = function() {
        return Object.keys(self.rooms);
    }
}

var UserRegistry = function() {
    var self = this;
    this.users = {};

    this.add = function(nickname) {
        var user = self.get(nickname);
        if (!user) {
            user = new User(self, nickname);
            self.users[nickname] = user;
        }
        return user;
    }

    this.exists = function(nickname) {
        return self.users.hasOwnProperty(nickname)
    }

    this.get = function(nickname) {
        if (self.exists(nickname)) {
            return self.users[nickname];
        }
        return false;
    }

    this.getOrCreate = function(nickname) {
        var user = self.get(nickname);
        if (!user) {
            user = self.add(nickname);
        }
        return user;
    }

    this.remove = function(nickname) {
        var user = self.get(nickname);
        if (user) {
            user._deleted = true;
            delete self.users[nickname];
        }
    }

    this.sanitizeName = function(nickname) {
        return nickname;
    }
}

exports.users = new UserRegistry();

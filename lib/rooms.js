var Room = function(registry, roomname) {
    var self = this;
    this.roomname = roomname;
    this.users = [];

    this._deleted = false;

    this.broadcast = function(event, data) {
        for (var user in self.users) {
            user.push(self.roomname, event, data);
        }
    }

    this.delete = function() {
        self.registry.deleteRoom(self.roomname);
    }


    this.addUser = function(user) {
        if (!self.hasUser(user)) {
            self.users.push(user);
        }
    }

    this.hasUser = function(user) {
        return (self.users.indexOf(user) != -1);
    }

    this.hasNickname = function(nickname) {
        var user = users.getUser(nickname);
        if (user) {
            return self.hasUser(user);
        }
        return false;
    }

    this.deleteUser = function(user) {
        if (self.hasUser(user)) {
            var i = self.users.indexOf(user);
            self.users.splice(i, 1);
        }
    }
}

var Rooms = function() {
    var self = this;
    this.rooms = {};

    this.add = function(roomname) {
        var room = self.getRoom(roomname);
        if (!room) {
            room = new Room(self, roomname);
            self.rooms[roomname] = room;
        }
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

    this.delete = function(roomname) {
        var room = self.get(roomname);
        if (room) {
            room._deleted = true;
            delete self.rooms[roomname];
        }
    }
}

exports.rooms = new Rooms();

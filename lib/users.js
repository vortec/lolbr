var User = function(registry, nickname) {
    var self = this;
    this.registry = registry;
    this.rooms = [];
    this.sockets = {};

    this.push = function(room, event, data) {
        if (self.inRoom(room)) {
            for (var socket in self.sockets[room]) {
                socket.emit(event, data);
            }
        }
    }

    this.joinRoom = function(room) {
        if (!self.inRoom(room)) {
            self.rooms.push(room);
            self.sockets[room] = [];
        }
    }

    this.leaveRoom = function(room) {
        if (self.inRoom(room)) {
            var i = self.rooms.indexOf(room);
            self.rooms.splice(i, 1);
            delete self.sockets[room];

            if (self.rooms.length == 0) {
                self.registry.deleteUser(nickname);
            }
        }
    }

    this.inRoom = function(room) {
        return (self.rooms.indexOf(room) != -1);
    }

    this.socketInRoom = function(room, socket) {
        if (self.inRoom(room)) {
            return (self.sockets[room].indexOf(socket) != -1);
        } else {
            return false;
        }
    }

    this.addSocket = function(room, socket) {
        if (!self.inRoom(room)) {
            self.joinRoom(room);
        }
        if (!self.socketInRoom(room, socket)) {
            self.sockets[room].push(socket);
        }
    }

    this.deleteSocket = function(room, socket) {
        if (self.inRoom(room)) {
            if (self.socketInRoom(room, socket)) {
                var i = self.sockets[room].indexOf(socket);
                self.sockets[room].splice(i, 1);
            }
            if (self.sockets[room].length == 0) {
                self.leaveRoom(room);
            }
        }
    }
}

var Users = function() {
    var self = this;
    this.users = [];

    this.addUser = function(nickname) {
        if (!self.exists(nickname)) {
            var user = new User(self, nickname);
            self.users.push(user);
        }
        return user;
    }

    this.deleteUser = function(nickname) {
        if (self.exists(nickname)) {
            var i = self.users.indexOf(nickname);
            self.users.splice(i);
        }
    }

    this.exists = function(nickname) {
        return self.users.hasOwnProperty(nickname);
    }
    
} 
exports.users = new Users();

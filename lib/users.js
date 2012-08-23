//TODO: check User.deleteUser(), doesnt seem to work
var User = function(registry, nickname) {
    var self = this;
    this.nickname = nickname;
    this.registry = registry;
    this.rooms = [];
    this.sockets = {};

    this._deleted = false;

    this.push = function(room, event, data) {
        if (self.inRoom(room)) {
            for (var socket in self.sockets[room]) {
                socket.emit(event, data);
            }
        }
    }

    this.purge = function() {
        this.registry.deleteUser(this.nickname);
    }


    this.joinRoom = function(room) {
        if (!self.inRoom(room)) {
            self.rooms.push(room);
            self.sockets[room] = [];
        }
    }

    this.inRoom = function(room) {
        return (self.rooms.indexOf(room) != -1);
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



    this.addSocket = function(room, socket) {
        if (!self.inRoom(room)) {
            self.joinRoom(room);
        }
        if (!self.socketInRoom(room, socket)) {
            self.sockets[room].push(socket);
        }
    }

    this.socketInRoom = function(room, socket) {
        if (self.inRoom(room)) {
            return self.sockets.hasOwnProperty(room);
        } else {
            return false;
        } 
    }

    this.deleteSocket = function(room, socket) {
        if (self.socketInRoom(room, socket)) {
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
    this.users = {};

    this.addUser = function(nickname) {
        if (!self.exists(nickname)) {
            var user = new User(self, nickname);
            self.users[nickname] = user;
        }
        return user;
    }

    this.deleteUser = function(nickname) {
        var user = this.getUser(nickname);
        if (user) {
            user._deleted = true;
            delete this.users[nickname];
        }
    }

    this.exists = function(nickname) {
        return this.users.hasOwnProperty(nickname)
    }

    this.getUser = function(nickname) {
        if (self.exists(nickname)) {
            return self.users[nickname];
        } else {
            return false;
        }
    }
    
} 
exports.users = new Users();

/*
// needs better testing framework :))
u = new Users();
user = u.addUser('vortec');
console.log(u.users)
console.log(u.exists('vortec'));
user.joinRoom('foobar');
console.log(u.getUser('vortec') === user);
console.log(user.inRoom('foobar') === true);
user.addSocket('foobar', 'my_socket');
console.log(user.socketInRoom('foobar', 'my_socket') === true);
user.deleteSocket('foobar', 'my_socket');
console.log(user.socketInRoom('foobar', 'my_socket') === false);
user.addSocket('new room', 'my_other_socket');
console.log(user.inRoom('foobar') === false);
console.log(user.inRoom('new room') === true);
user.leaveRoom('new room');
console.log(user.inRoom('new room') === false);
console.log(user.socketInRoom('new room', 'my_other_socket') === false);
user.addSocket('another new room', 'my_last_socket');
user.purge();
console.log(user._deleted === true);
console.log(u.exists('vortec') === false); */



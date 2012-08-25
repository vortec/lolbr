var User = function(registry, nickname) {
    var self = this;
    this.nickname = nickname;
    this.registry = registry;
    this.rooms = [];
    this.sockets = {};
    this.user = null;

    this._deleted = false;

    this.authenticate = function(socket) {
        socket.user = self;
        socket.session.nickname = nickname;
        socket.session.save();
        socket.emit('AUTH', {'nickname': nickname})
        return true;
    }

    this.push = function(roomname, event, data) {
        if (self.inRoom(roomname)) {
            for (var socket in self.sockets[roomname]) {
                socket.emit(event, data);
            }
        }
    }

    this.delete = function() {
        self.registry.deleteUser(self.nickname);
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
        }
    }



    this.addSocket = function(room, socket) {
        if (!self.inRoom(room)) {
            self.joinRoom(room);
        }
        if (!self.socketInRoom(room, socket)) {
            self.sockets[room].push(socket);
        }

        socket.roomname = room;
        socket.join(room);
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

    this.delete = function(nickname) {
        var user = self.get(nickname);
        if (user) {
            user._deleted = true;
            delete self.users[nickname];
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



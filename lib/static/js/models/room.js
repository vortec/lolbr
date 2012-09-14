var Room = function(roomname) {
    var self = this;
    this.roomname = roomname;
    this.nicknames = [];

    this.add = function(nickname) {
        if (!self.has(nickname)) {
            self.nicknames.push(nickname);
            userlist.add(nickname);
        }
    }

    this.apply = function(nicknames) {
        userlist.clear();

        for (var i in nicknames) {
            var nickname = nicknames[i];
            self.add(nickname);
        }
    }

    this.getAll = function() {
        var nicknames = self.nicknames.slice();  // create copy
        nicknames.sort();
        return nicknames;
    }

    this.has = function(nickname) {
        return self.nicknames.indexOf(nickname) > -1;
    }

    this.remove = function(nickname) {
        var i = self.nicknames.indexOf(nickname);
        if (i > -1) {
            self.nicknames.splice(i, 1);
        }
    }
}
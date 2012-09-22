var Userlist = function(elem) {
    var self = this;
    this.elem = elem;
    this.prefix = 'user_';

    this.getElem = function(nickname) {
        return $('#' + self.prefix + nickname);
    }

    this.add = function(nickname) {
        var _id = self.prefix + nickname;
        self.elem.append($('<li>', { id: _id, text: nickname}));
    }

    this.clear = function() {
        self.elem.empty();
    }

    this.remove = function(nickname) {
        var elem = self.getElem(nickname);
        if (elem) {
            elem.remove();
        }
    }

    this.apply = function(nicknames) {
        self.clear();
        for (var i in nicknames) {
            var nickname = nicknames[i];
            self.add(nickname);
        }
    }
}

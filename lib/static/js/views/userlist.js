var Userlist = function(elem) {
    var self = this;
    this.elem = elem;
    this.prefix = 'user_';

    this.getElem = function(nickname) {
        return $('#' + self.prefix + nickname);
    }

    this.add = function(nickname) {
        return $('<li>', { id: self.prefix + nickname, text: nickname});
    }

    this.clear = function() {
        
    }

    this.remove = function(nickname) {
        var elem = self.getElem(nickname);
        if (elem) {
            elem.remove();
        }
    }
}

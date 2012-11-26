var User = function(nickname) {
    var self = this;
    this.nickname = nickname;
    this.online = false;

    this.push = function(xevent, data) {
        if (data.hasOwnProperty('text')) {
            //data['text'] = log.encode_utf8(data['text']);
        }
        socket.emit(xevent, data);
    }
}

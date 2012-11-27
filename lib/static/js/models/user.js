var User = function(nickname) {
    var self = this;
    this.backlog = [];
    //this.backlog_buffer = '';
    this.backlog_max_entries = 1000;
    this.backlog_pointer = -1;

    this.nickname = nickname;
    this.online = false;

    this.push = function(xevent, data) {
        if (data.hasOwnProperty('text')) {
            //data['text'] = log.encode_utf8(data['text']);
        }
        socket.emit(xevent, data);

        if (xevent == 'MESSAGE') {
            if (self.backlog.length == self.backlog_max_entries) {
                self.backlog.shift();
            }
            self.backlog.push(data['text']);
        }
    }
}

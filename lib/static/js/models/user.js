var User = function(nickname) {
    var self = this;
    this.backlog = [];
    this.backlog_max_entries = 1000;
    this.backlog_pointer = -1;

    this.idle = false;
    this.idle_message_count = 0;

    this.nickname = nickname;
    this.online = false;

    this.idleEnable = function() {
        self.idle = true;
        self.push('IDLE', {idle: true});
    }

    this.idleDisable = function() {
        self.idle = false;
        self.idle_message_count = 0;
        self.push('IDLE', {idle: false});
    }

    this.idleIncreaseMessageCount = function() {
        self.idle_message_count++;
    }

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

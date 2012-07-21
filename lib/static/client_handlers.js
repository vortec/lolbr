var handlers = {
    'CONNECT': function(data) {
        $('log').innerHTML = $('log').innerHTML + data['nickname'] + ' has joined the room.<br/>';
    },

    'MESSAGE': function(data) {
        $('log').innerHTML = $('log').innerHTML + data['nickname'] + ' says: ' + data['text'] + '<br/>';
    }
};

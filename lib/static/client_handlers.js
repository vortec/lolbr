var handlers = {
    'CONNECT': function(data) {
        $('log').innerHTML = $('log').innerHTML + data['nickname'] + ' hat den Raum betreten.<br/>';
    },

    'MESSAGE': function(data) {
        $('log').innerHTML = $('log').innerHTML + data['nickname'] + ' sagt: ' + data['text'] + '<br/>';
    }
};

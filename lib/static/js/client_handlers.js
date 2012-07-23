var handlers = {
    'CONNECT': function(data) {
        console.log('connect');
    	addToLog('Hello, ' + data['nickname'] + '!');
        addToLog(data['nickname'] + ' has joined the room.');
    },

    'MESSAGE': function(data) {
        addToLog(data['nickname'] + ' says: ' + data['text']);
    },

    'DISCONNECT': function(data) {
    	addToLog(data['nickname'] + ' has left the room.');
    }
};

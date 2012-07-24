var handlers = {
    'CONNECT': function(data) {
        console.log('connect');
    	addToLog('Hello, ' + data['nickname'] + '!');
        addToLog('Please contribute to lolbr at <a href="https://github.com/vortec/lolbr" target="_blank">Github</a>.');
        addToLog(data['nickname'] + ' has joined the room.');
    },

    'MESSAGE': function(data) {
        addToLog(data['nickname'] + ' says: ' + data['text']);
    },

    'DISCONNECT': function(data) {
    	addToLog(data['nickname'] + ' has left the room.');
    }
};

// Please modify values and rename to config.js

var connect = require('connect');
var MemoryStore = connect.middleware.session.MemoryStore;

module.exports = (function(){
    switch(process.env.NODE_ENV){
        case 'development':
        case 'production':
        default:
            var settings = {
                store: new MemoryStore()
            };
            return settings;

            // MySQL
            /*
            var store = require('connect-mysql-session')(connect);
            var settings = {
                store: new store('lolbr', 'lol-user', 'lol-pass')
            };
            */
    }
})();

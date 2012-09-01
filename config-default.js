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
            var mysql = require('mysql').createClient({
                user: 'dbuser',
                password: 'dbpass',
                database: 'db'
            });
            var MySQLStore = require('connect-mysql')(express);
            var store = require('connect-mysql')(connect);
            var settings = {
                store: new store({client: mysql})
            };
            return settings;
            */
    }
})();

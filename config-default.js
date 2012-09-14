// Please modify values and rename to config.js

var express = require('express');
var connect = require('connect');
var MemoryStore = connect.middleware.session.MemoryStore;

module.exports = (function(){
    switch(process.env.NODE_ENV){
        case 'development':
        case 'production':
        default:
            var settings = {
                port: 8000,
                connection: false,  // no persistance
                store: new MemoryStore()
            };
            return settings;

            // MySQL
            /*
            var connection = require('mysql').createClient({
                user: 'dbuser',
                password: 'dbpass',
                database: 'db'
            });
            var store = require('connect-mysql')(connect);
            var settings = {
                port: 8000,
                connection: connection,
                store: new store({client: connection}),
                protocol: 'mysql'
            };
            return settings;
            */
    }
})();

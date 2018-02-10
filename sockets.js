var express = require('express');
var app = express();
var redis = require('redis'),
    redisClient = redis.createClient(16379, '127.0.0.1');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var playersNamespace = function(socket) {
    redisClient.lrange('players', 0, -1, function(err, reply) {
        if (err) {
            console.log(err);
        } else {
            console.log('sending players: ' + reply);
            socket.emit('addPlayer', reply);
            socket.broadcast.emit('addPlayer', reply);
        }
    })

    socket.on('start-game', function() {
        socket.broadcast.emit('start-game');
    })
}

var sockets = [];

var gameNamespace = function(socket) {
    sockets.push(socket);
    socket.broadcast.emit('stop-timer');
    var randomTurn;
    var turn;
    randomTurn = setTimeout(function() {
        turn = Math.floor(Math.random() * (sockets.length - 1));
        console.log('turns: ' + turn);
        socket.emit('your-turn', sockets[turn].id);
        socket.broadcast.emit('your-turn', sockets[turn].id);

        socket.emit('turn-count', turn);
        socket.broadcast.emit('turn-count', turn);
    }, 1000);

    socket.on('stop-timer', function() {
        clearTimeout(randomTurn);
    })

    socket.on('write', function(msg) {
        socket.broadcast.emit('write', msg);
    });

    socket.on('change-turn', function(msg) {

        if (msg > sockets.length - 1) {
            msg = 0;
        }

        console.log('turns (after first): ' + msg);
        socket.emit('your-turn', sockets[msg].id);
        socket.broadcast.emit('your-turn', sockets[msg].id);
        socket.emit('turn-count', msg);
        socket.broadcast.emit('turn-count', msg);
    })

}

module.exports.playersNamespace = playersNamespace;
module.exports.gameNamespace = gameNamespace;
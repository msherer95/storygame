var express = require('express');
var app = express();
var redis = require('redis'),
    redisClient = redis.createClient(22959, 'ec2-34-226-156-118.compute-1.amazonaws.com', {password: 'p680c42a1f6e9905534bb182ca891193a779ad611f484677cf5f981540d2fbda2'});
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
	
	socket.on('disconnect', function() {
		var toBeRemoved = sockets.indexOf(socket);
		sockets.splice(toBeRemoved, 1);
	})

}

module.exports.playersNamespace = playersNamespace;
module.exports.gameNamespace = gameNamespace;

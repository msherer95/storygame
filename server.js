var express = require('express');
var app = express();
var redis = require('redis'),
    redisClient = redis.createClient(22959,'ec2-34-226-156-118.compute-1.amazonaws.com');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var sockets = require('./sockets.js');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');

app.use(session({
    secret: 'ssshhhhh',
    store: new redisStore({ host: 'ec2-34-226-156-118.compute-1.amazonaws.com', port: 22959, client: redisClient, ttl:  260}),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var port = process.env.PORT || 8000;
http.listen(port, function(){
  console.log('listening on port 8080');
});

redisClient.on("error", function (err) {
    console.log("Redis Error " + err);
});

var userName;

io.on('connection', function(socket){
    var clients = Object.keys(io.sockets.sockets);
    console.log('socket.id: '+socket.id);
    console.log('a user connected');
    console.log('clients: '+clients);
    socket.on('addPlayer', function(msg) {
        redisClient.rpush('players', msg);
        userName = msg;
    })

    var addingPlayer = false;

    socket.on('disconnect', function() {
        clients = Object.keys(io.sockets.sockets);
        console.log('user disconnected');
        console.log('remaining users: '+clients);

        if (addingPlayer) {
            addingPlayer = false;
        } else if (!addingPlayer && clients.length == 0) {
            redisClient.flushall(function(err, success) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('cleared redis data');
                }
            })
        }
    })

    socket.on('removeSocketID', function() {
        addingPlayer = true;
    })
});

var players = io.of('/players');
var game = io.of('/game');
players.on('connection', sockets.playersNamespace);
game.on('connection', sockets.gameNamespace);

app.use('/',express.static(__dirname + '/'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/players', function(req,res) {
    res.sendFile(__dirname + '/players.html');
    req.session.name = userName;
    console.log('req.session.name: ' + req.session.name);
})

app.get('/game', function(req, res) {
    res.sendFile(__dirname + '/game.html');
})

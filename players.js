$(document).ready(function() {
    var socket = io('/players', {transports: ['websocket'], upgrade: false});
    var container = document.getElementsByClassName('container-fluid');
    var playerCount = document.getElementById('player-count');
    var elRow = document.getElementsByClassName('el-row');
    var start = document.getElementById('start');
    elRow = elRow[0];
    container = container[0];

    socket.on('addPlayer', function(msg) {
        elRow.innerHTML = "";
        for (i=0; i<msg.length; i++) {
            var newEl = document.createElement('h3');
            newEl.innerHTML = msg[i];
            newEl.setAttribute('id','player-el');
            elRow.appendChild(newEl);
        }

        playerCount.innerHTML = "(" + msg.length + ")";
    })

    socket.on('start-game', function() {
        window.location.href="/game";
    })

    start.addEventListener('mouseover', function() {
        start.style.backgroundColor = "#5F71FE";
        start.style.color = "white";
    })

    start.addEventListener('mouseleave', function() {
        start.style.backgroundColor = "#FED35F";
        start.style.color = "#5F71FE";
    })

    start.addEventListener('click', function() {
        socket.emit('start-game');
    })
})

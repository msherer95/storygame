$(document).ready(function() {
    (function makeSocket() {
        var socket = io();
        var nameInput = document.getElementsByTagName('input');
        nameInput = nameInput[0];
        var sockArr = [];
        socket.on('connect', function() {
            sockArr.push(socket.id);

        });

        nameInput.addEventListener('keyup', function(e) {
            var key = e.which || e.keyCode;
            if (key == 13 && nameInput.value != "") {
                var player = nameInput.value;

                $.get('/players', function(data) {
                    window.location.href = "/players";
                    socket.emit('addPlayer', player);
                    socket.emit('removeSocketID');
                })
            }
        })
    })();

    (function handleEnterName() {
        var nameInput = document.getElementsByTagName('input');
        nameInput = nameInput[0];
        var p = document.getElementsByTagName('p');
        p = p[1];

        nameInput.addEventListener('click', function() {
            if (this.value == "enter your name") {
                this.value = "";
            }
            if (this.value != "") {
                p.style.opacity = 1;
            }
        })

        nameInput.addEventListener('focusout', function() {
            if (this.value == "") {
                this.value = "Fuckface"
            }
        })

        nameInput.addEventListener('keyup', function() {
            if (nameInput.value == "") {
                p.style.opacity = 0;
            } else {
                p.style.opacity = 1;
            }
        })
    })();
})

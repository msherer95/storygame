$(document).ready(function() {
    var socket = io('/game', {
        transports: ['websocket'],
        upgrade: false
    });
    var textarea = document.getElementById('writer');
    var turnHeader = document.getElementById('turn-header');
    var writingPrevented = false;
    var turnClient;

    socket.on('stop-timer', function() {
        socket.emit('stop-timer');
    })

    socket.on('turn-count', function(msg) {
        turnClient = msg;
    })

    function preventWrite(event) {
        event.preventDefault();
        console.log('preventDefault still enabled');
    }

    socket.on('your-turn', function(msg) {

        if (socket.id == msg) {
            console.log('its your turn!');
            var secondsLeft = 7;
            turnHeader.innerHTML = "Your Turn! (7)";
            textarea.addEventListener('keyup', function enabledWrite() {
                socket.emit('write', textarea.value);
            });

            if (writingPrevented) {
                textarea.removeEventListener('keyup', preventWrite);
                textarea.removeEventListener('keydown', preventWrite);
                console.log('allowing you to write');
                writingPrevented = false;
                console.log('writingPrevented: ' + writingPrevented);
            }

            countDown();
        } else {
            console.log('wait your turn!');
            turnHeader.innerHTML = "Wait Your Turn...";
            console.log('preventing your writing');
            textarea.addEventListener('keyup', preventWrite);
            textarea.addEventListener('keydown', preventWrite);
            writingPrevented = true;
            console.log('writingPrevented: ' + writingPrevented);
        }

        function countDown() {
            if (!secondsLeft) {
                turnClient++;
                socket.emit('change-turn', turnClient);
                console.log('turnClient: ' + turnClient);
                return;
            }

            setTimeout(function writeTimer() {
                secondsLeft--;
                turnHeader.innerHTML = "Your Turn! " + "(" + secondsLeft + ")";
                countDown();
            }, 1000);
        }
    })

    socket.on('write', function(msg) {
        textarea.value = msg;
    })
})

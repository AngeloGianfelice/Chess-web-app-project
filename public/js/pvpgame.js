var game = pvpGame();
newpvpGame();
function newpvpGame() {
    var baseTime = parseFloat($('#timeBase').val()) * 60;
    var inc = parseFloat($('#timeInc').val());
    game.reset();
    $('#pgn').text('');
    game.setTime(baseTime, inc);
    game.setPlayerColor($('#color-white').hasClass('active') ? 'white' : 'black');
    game.start();
}
function pvpGame() {
    const piece_moved_sound=new Audio("../sounds/piece_moved.mp3");
    const check_sound=new Audio("../sounds/check.mp3");
    const lost_sound=new Audio("../sounds/lost.mp3");
    const won_or_drawn_sound=new Audio("../sounds/won_or_drawn.mp3"); 
    var game = new Chess();
    var board;
    var time = { wtime: 300000, btime: 300000, winc: 2000, binc: 2000 };
    var playerColor = 'white';
    var clockTimeoutID = null;
    var white_timeout=false;
    var black_timeout=false;

    // do not pick up pieces if the game is over
    // only pick up pieces for White
    function onDragStart (source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) return false
      
        // only pick up pieces for the side to move
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
          return false
        }
    }

    function updateStatus () {
        var status = ''
        var moveColor = 'White'
        if (game.turn() === 'b') {
            moveColor = 'Black'
        }
        // checkmate?
        if (game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.'
            }
        // draw?
        else if (game.in_draw()) {
            status = 'Game over, drawn position'
        }
        // game still on
        else {
            status = moveColor + ' to move'
            // check?
            if (game.in_check()) {
                status += ', ' + moveColor + ' is in check'
            }
        }
    $('#status').html(status);
    }

    function displayClock(color, t) {
        var isRunning = false;
        if(time.startTime > 0 && color == time.clockColor) {
            t = Math.max(0, t + time.startTime - Date.now());
            isRunning = true;
        }
        var id = color == playerColor ? '#time2' : '#time1';
        var sec = Math.ceil(t / 1000);
        var min = Math.floor(sec / 60);
        sec -= min * 60;
        var hours = Math.floor(min / 60);
        min -= hours * 60;
        var display = hours + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
        if(isRunning) {
            display += sec & 1 ? ' <--' : ' <-';
        }
        $(id).text(display);
    }

    function updateClock() {
        displayClock('white', time.wtime);
        displayClock('black', time.btime);
    }

    function clockTick() {
        updateClock();
        var t = (time.clockColor == 'white' ? time.wtime : time.btime) + time.startTime - Date.now();
        var timeToNextSecond = (t % 1000) + 1;
        clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
        if (time.wtime<= 0) white_timeout=true;
        if (time.btime<= 0) black_timeout=true;
    }

    function stopClock() {
        if(clockTimeoutID !== null) {
            clearTimeout(clockTimeoutID);
            clockTimeoutID = null;
        }
        if(time.startTime > 0) {
            var elapsed = Date.now() - time.startTime;
            time.startTime = null;
            if(time.clockColor == 'white') {
                time.wtime = Math.max(0, time.wtime - elapsed);
            } else {
                time.btime = Math.max(0, time.btime - elapsed);
            }
        }
    }

    function startClock() {
        if(game.turn() == 'w') {
            time.wtime += time.winc;
            time.clockColor = 'white';
        } else {
            time.btime += time.binc;
            time.clockColor = 'black';
        }
        time.startTime = Date.now();
        clockTick();
    }

    var onDrop = function(source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a pawn for example simplicity
        });
        // illegal move
        if(move===null || $('#time1').text()=="0:00:00 <-"|| $('#time2').text()=="0:00:00 <-")return 'snapback';
        play_sound();
        updateStatus();
        stopClock();
        $('#pgn').text(game.pgn());
        updateClock();
        if(game.history().length >= 2) {
            startClock();
        }
    };
    function play_sound(){
        var turn = game.turn() == 'w' ? 'white' : 'black';
        // checkmate?
        if (game.in_checkmate()) {
            if(turn == playerColor ) lost_sound.play();
            won_or_drawn_sound.play();
        }
        // draw
        else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) 
            won_or_drawn_sound.play();
        
        // check
        else if(game.in_check()) 
                check_sound.play();
        else {
            piece_moved_sound.play();
        }
    }

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    var onSnapEnd = function() {
        board.position(game.fen()); 
    };

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        moveSpeed: 2
    };

    board = new ChessBoard('myBoard', cfg);
    updateStatus();
    return {
        reset: function() {
            game.reset();
        },
        loadPgn: function(pgn) { game.load_pgn(pgn); },
        setPlayerColor: function(color) {
            playerColor = color;
            board.orientation(playerColor);
            board.start();
        },
        setTime: function(baseTime, inc) {
            time = { wtime: baseTime * 1000, btime: baseTime * 1000, winc: inc * 1000, binc: inc * 1000 };
            updateClock();
        },
        start: function() {
            updateStatus();
        },
        undo: function() {
            game.undo();
            game.undo();
            displayStatus();
            return true;
        }
    };
}

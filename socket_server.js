const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}

var turn = 1

var board = [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ]

io.on('connection', (socket) => {
    console.log('A user connected');
    io.emit('update_board', board);


    socket.on('add_mark', (msg) => {

        console.log(msg)
        var row = Math.floor(parseInt(msg) / 3)
        var col = parseInt(msg) % 3

        if (row > 2) {
            row = 2
            console.log("row was above 2")
        }

        console.log(row,col)

        //var row = msg[0]
        //var col = msg[1]
        if (msg) {
            if (board[row][col] == " ") {
                if (turn % 2 == 0){
                    board[row][col] = "O"
                } else {
                    board[row][col] = "X"
                }
                turn++
        
                console.log(board)
                io.emit('update_board', board); // Broadcast the message to all clients
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(80, () => {
    console.log('Listening on *:80');
});

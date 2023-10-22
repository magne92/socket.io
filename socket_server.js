const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var users = []

var turns_taken = 0

var turns = ["X", "O"]
var active_turn
var board

function new_round() {
    board = [
            [" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "]
        ]
    active_turn = "X"
    turns_taken = 0
}

new_round()
    
io.on('connection', (socket) => {
    console.log('A user connected');
    io.emit('update_board', board, active_turn);
    console.log("test of restart")

    console.log("user length:", users.length)

    if (users.length == 0) {
        users.push([socket.id, "X"])
    } else if (users.length == 1) {
        users.push([socket.id, "O"])
    } 

    if (users[0][0] == socket.id) {
        io.to(socket.id).emit("player_select", users[0][1]); 
    }
    else if (users[1][0] == socket.id) {
        io.to(socket.id).emit("player_select", users[1][1]); 
    } else {
        io.to(socket.id).emit("player_select", "Spectator");
    } 

    socket.on('add_mark', (msg) => {
        not_active_player = false
        if (socket.id == users[0][0]){
            turn_symbol = "X"
        } else if (socket.id == users[1][0]) {
            turn_symbol = "O"
        } else {
            not_active_player = true
            console.log("non player tried to add mark")
        }

        if (!not_active_player) {
            console.log(msg)
            var row = Math.floor(parseInt(msg) / 3)
            var col = parseInt(msg) % 3

            console.log(row,col)
    
            if (msg && turn_symbol == active_turn) {
                if (board[row][col] == " ") {      
                    if (active_turn == "X"){
                        board[row][col] = "X"
                        active_turn = "O"
                    } else {
                        board[row][col] = "O"
                        active_turn = "X"
                    }
                    console.log(board)
                    turns_taken++
                    io.emit('update_board', board, active_turn); // Broadcast the message to all clients
                }
            }
        }
    });

    socket.on('disconnect', () => {
        if (socket.id == users[0][0]) {
            users.splice(0,1)
        } else if (socket.id == users[1][0] ){
            users.pop()
        }
        console.log('A user disconnected');
        console.log("users: ", users.length)
        new_round()
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(80, () => {
    console.log('Listening on *:80');
});


import express from 'express';
import { networkInterfaces } from 'os';
import { Server as socket } from 'socket.io'
import { Collection, PhysicsObject } from './physics/body.js';
import { Rotation, vec2 } from './physics/calc.js';
import { World } from './physics/world.js';
import { Polygon } from './physics/geometry.js';
import { GameManager } from './game.js';
import { Player } from './user.js';

console.clear();
let app = express();

console.log(process.argv[2]);
let isPublic =false;
if(process.argv[2] == "local"){
    isPublic = false;
}
else if(process.argv[2] == "public"){
    isPublic = true;
}


let server = app.listen(3000,isPublic? '0.0.0.0': '127.0.0.1');
let msgs = [];
let users = [];




app.use(express.static('./src/client'));


console.log('\n\n\n >> Server Started');


let io = new socket(server);


io.sockets.on('connection',newConnection);

let mangager = new GameManager();

mangager.createGame(new Player("Bot", "1234qfw34f"), true);


function newConnection(socket){
    console.log("New Connection to the server");
    console.log("ID: " + socket.id);

    socket.emit('games', mangager.getPublicGameInfo());
    
    socket.on('say',newChat);
    
    
    function newChat(data){
        console.log(data.say);
        msgs.push(data);
        
        socket.broadcast.emit('say',data);
    }
    socket.on('join',join);
    function join(e){
        console.log("id: " + socket.id + ", Name: " + e.name + ", game# " + e.code);
        if(mangager.gameExists(e.code)){
            socket.emit('success', e.code);
            mangager.addPlayerToGame(new Player(e.name, socket.id), e.code);
            socket.join(e.code);
        }
        else{
            socket.emit('failure');
        }
    }
    socket.on('update', handleUpdate);
    function handleUpdate(data){
        
        
    }
    socket.on('inputs', handleInputs);
    function handleInputs(data){
        
    }
    socket.on('disconnect' ,() => {
        
        console.log(socket.id + " disconnected");
    })
}







setInterval(broadcastPosition, 1000 / 60);
function broadcastPosition(){
    mangager.updateAll(1/60);
    for(var code in mangager.games){
        io.sockets.to(code).emit('physics', mangager.getGameData(code));
    }
}


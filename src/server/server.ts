
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
mangager.createGame(new Player("Bot", "1234qfw34f"), true);
mangager.createGame(new Player("Bot", "1234qfw34f"), true);
mangager.createGame(new Player("Bot", "1234qfw34f"), true);
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
            mangager.addPlayerToGame(new Player(e.name, socket.id), e.code);
            socket.join(e.code);
        }
    }
    socket.on('update', handleUpdate);
    function handleUpdate(data){
        
        
    }
    socket.on('inputs', handleInputs);
    function handleInputs(data){
        
    }
    socket.on('disconnect' ,() => {
        
        console.log(name + " disconnected")
    })
}

let r = PhysicsObject.rectangle(new vec2(0,0), 2, 2, {velocity: new vec2(-1,0)});
let p = PhysicsObject.regularPolygon(new vec2(3,0), 1, 7, {velocity: new vec2(-3,0), angle: Rotation.fromDegrees(180)});
let c = PhysicsObject.circle(new vec2(0, 3), 1,{bounciness: 1});

let floor = Polygon.rectangle(new vec2(0,-5), 10, 1);
let leftWall = Polygon.rectangle(new vec2(-5,0), 1, 10);
let rightWall = Polygon.rectangle(new vec2(5,0), 1, 10);
let roof = Polygon.rectangle(new vec2(0,5), 10, 1);

let boundaries = new PhysicsObject(vec2.zero(), [floor, leftWall, rightWall, roof], {static: true, bounciness: 0.8, angularVelocity: Rotation.new(0.4)});

//let boundaries = PhysicsObject.rectangle(new vec2(-3,-5), 5, 1, {static: true, bounciness: 1});
//let boundaries = PhysicsObject.regularPolygon(new vec2(0,-5), 1, 3, {static: true, bounciness: 1});
let world = new World(c, p, r, boundaries);




function updateGame(dt){
    world.step(dt);
    
    
        
}
setInterval(broadcastPosition, 1000 / 60);
function broadcastPosition(){
    updateGame(1 / 60);
    io.sockets.emit('physics', world.packForExport());

}


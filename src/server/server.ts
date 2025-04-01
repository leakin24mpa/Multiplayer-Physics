
import express from 'express';
import { networkInterfaces } from 'os';
import { Server as socket } from 'socket.io'
import { Collection, PhysicsObject } from './physics/body.js';
import { Rotation, vec2 } from './physics/calc.js';
import { World } from './physics/world.js';
import { Polygon } from './physics/geometry.js';

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


//get the ip address to connect to
const networks = networkInterfaces();
const results = {};

for ( const name of Object.keys(networks)){
    for (const net of networks[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        //if it's an ipv4 and it's not an internal then keep it
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
//console.log(`\n\n\n >> connect to the server using ip address ${results.en0}:${3000}`);


let io = new socket(server);


io.sockets.on('connection',newConnection);



function newConnection(socket){
    console.log("New Connection to the server");
    console.log("ID: " + socket.id);
    socket.on('say',newChat);
 
    
    function newChat(data){
        console.log(data.say);
        msgs.push(data);
        
        socket.broadcast.emit('say',data);
    }
    socket.on('join',userJoin);
    function userJoin(e){
        let player = PhysicsObject.circle(new vec2(0, -3), 0.3);
        console.log(e.text + " Joined the game");
        world.addObjects(player);
    }
    socket.on('update', handleUpdate);
    function handleUpdate(data){
        
        
    }
    socket.on('inputs', handleInputs);
    function handleInputs(data){
        
    }
    socket.on('disconnect' ,() => {
        let name;
        for(let i = 0; i < users.length; i++){
            if(users[i].id == socket.id){
                name = users[i].name;
                users.splice(i,1);
            }
        }
        console.log(name + " disconnected")
    })
}

let r = PhysicsObject.rectangle(new vec2(0,0), 2, 2, {velocity: new vec2(-1,0)});
let p = PhysicsObject.regularPolygon(new vec2(3,0), 1, 7, {velocity: new vec2(-3,0), angle: Rotation.fromDegrees(180)});
let c = PhysicsObject.circle(new vec2(0, 3), 1);

let floor = Polygon.rectangle(new vec2(0,-5), 10, 1);
let leftWall = Polygon.rectangle(new vec2(-5,0), 1, 10);
let rightWall = Polygon.rectangle(new vec2(5,0), 1, 10);
let roof = Polygon.rectangle(new vec2(0,5), 10, 1);

let boundaries = new PhysicsObject(vec2.zero(), [floor, leftWall, rightWall, roof], {static: true, bounciness: 0.8, angularVelocity: Rotation.new(0.4)});

let world = new World(c, p, r, boundaries);




function updateGame(dt){
    world.step(dt);
    
    
        
}
setInterval(broadcastPosition, 1000 / 60);
function broadcastPosition(){
    updateGame(1 / 60);
    //console.log(c.angle);
    //io.sockets.emit('update', users);
    io.sockets.emit('physics', world.packForExport());

}



var socket;
socket = io.connect();

socket.on('say',newChat);
function newChat(say){
    console.log(say);
    log(say.say,'green');
}
socket.on('history',catchUp);
function catchUp(msgs){
    for(let i = 0; i < msgs.length; i++){
        log(msgs[i].say,'red')
    }
}
socket.on('join',newPerson);
function newPerson(e){
    log(e.join + " joined the chat",'purple');
    
}


const log = (text,color) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;
    el.style.color = color;
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

const onChatSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';
    if(document.getElementById('say').innerHTML == 'Join'){
        document.getElementById('say').innerHTML = 'Say';
        document.getElementById('chat').placeholder = 'Say something...';
        document.getElementById('user').innerHTML = text;
        socket.emit('join',{join: text});
        log(text + ' joined the chat','purple');
        log(socket.id,"#30c0d3");
        log(socket.connected);
    }
    else{
    log(text,'grey');
    let data = {
       say: text 
    }
    socket.emit('say',data);
    }
};

(() => {
    //log('welcome to my chat thing. Enter a username to begin',"#30c0d3");
    
    console.log(socket);
    log(socket.connected);
    log(socket.id,"#30c0d3");

    document
        .querySelector('#chat-form')
        .addEventListener('submit',onChatSubmitted);

   
    

})();
let playerX = 0;
let playerY = 0;

let playerVX = 0;
let playerVY = 0;
let users = [];

let physicsObjects = [];

socket.on('update', (data) => {users = data});

socket.on('physics', (data) => {physicsObjects = data});

function sendUpdate(){
    //let data = {x: playerX, y: playerY};
    //socket.emit('update', data);
    let inputs = {
        w: keyIsDown(87),
        a: keyIsDown(65),
        s: keyIsDown(83),
        d: keyIsDown(68),
    };
    socket.emit('inputs', inputs);
}

function setup(){
    createCanvas(800,800);
    rectMode(CENTER);
}


function draw(){

    if(keyIsDown(83)){
        playerVY += 2;
    }
    if(keyIsDown(87)){
        playerVY -= 2;
    }
    if(keyIsDown(65)){
        playerVX -= 2;
    }
    if(keyIsDown(68)){
        playerVX += 2;
    }
    playerVX *= 0.9;
    playerVY *= 0.9;


    playerX += playerVX;
    playerY += playerVY;
    
    background(0);
    fill(255);
    
    translate(width/2, height /2);
    
    
    sendUpdate();
    
    for(let i = 0; i < users.length; i++){
        let player = users[i].player;
        if(player.colliding){
            fill(255,0,0);
        }
        else{
            fill(0,0,255);
        }
        push();
        translate(player.x, -player.y);
        rect(0,0, player.width, player.height);
        fill(0);
        text(users[i].name, 0, 0);
        pop();
        
    }
    scale(50);
    for(let i = 0; i < physicsObjects.length; i++){
        let object = physicsObjects[i];
        push();
        translate(object.position.x, object.position.y);
        rotate(object.angle);
        noStroke();
        fill(50 * i,100,0);
        if(i == 2){
            rect(0,0,4,0.5);
        }
        else if(i < 2){
            rect(0,0,0.5,0.5);
        }
        else{
            rect(0,0,0.3,0.3);
        }
        
        
        pop();
    }
    
}

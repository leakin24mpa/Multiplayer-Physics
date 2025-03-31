
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
    sendUpdate();
    
    background(0);
    fill(255);
    noStroke();
    translate(width/2, height/2);
    scale(50);
    
   
    renderWorld(physicsObjects);
    
}

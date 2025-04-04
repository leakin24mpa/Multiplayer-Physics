


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
    document.getElementById("defaultCanvas0").style.visibility = false;
}


function draw(){
    sendUpdate();
    
    background(0);
    fill(255,100,100,128);

    stroke(255,100,100);
    strokeWeight(0.1);
    strokeJoin(ROUND);
    translate(width/2, height/2);
    scale(50);
    
    //rotate(PI/2);
    scale(1, -1);
    
   
    renderWorld(physicsObjects);
    
}
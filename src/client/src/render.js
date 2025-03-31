function renderPhysicsObject(o){
    push();
        translate(o.position.x, o.position.y);
        rotate(o.angle);
        for(let i = 0; i< o.shapes.length; i++){
            if(o.shapes[i].isCircle){
                push();
                    ellipseMode(RADIUS);
                    translate(o.shapes[i].position.x);
                    ellipse(0,0,o.shapes[i].radius);
                pop();
            }
            else{
                beginShape();
                let shape = o.shapes[i];
                for(let i = 0; i < shape.vertices.length; i++){
                    vertex(shape.vertices[i].x, shape.vertices[i].y);
                }
                endShape(CLOSE);
            }
            
        }
    pop();
}
function renderWorld(objects){
    for(let i = 0; i < objects.length; i++){
        renderPhysicsObject(objects[i]);
    }
}
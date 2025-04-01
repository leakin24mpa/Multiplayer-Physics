function renderPhysicsObject(o){
    push();
        translate(o.position.x, o.position.y);
        rotate(o.angle);

        for(let i = 0; i< o.shapes.length; i++){
            if(o.shapes[i].isCircle){
                push();
                    ellipseMode(RADIUS);
                    translate(o.shapes[i].center.x, o.shapes[i].center.y);
                    ellipse(0,0,o.shapes[i].radius);
                pop();
            }
            else{
                let shape = o.shapes[i];
                //ellipse(shape.vertices[0].x, shape.vertices[0].y, 0.2);
                beginShape();
                
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
import { GameManager } from "./game.js";
import { PhysicsObject } from "./physics/body.js";
import { Rotation, vec2 } from "./physics/calc.js";
import { Collision, PolygonCollsion } from "./physics/collision.js";
import { Circle, Polygon, Shape, ShapeType } from "./physics/geometry.js";
import { World } from "./physics/world.js";
import { Player } from "./user.js";

function formatNumber(n: number){
    return Math.round(n * 1000)/1000
}
function vec2string(v: vec2): string{
    return "(" + formatNumber(v.x) +", " + formatNumber(v.y) + ")";
}

function logShape(shape: Shape){
    switch(shape.type){
        case ShapeType.POLYGON:
           console.log("\nPolygon:\n")
           break;
        case ShapeType.CIRCLE:
            console.log("\nCircle:\n")
            break;

    }
    console.log("COM: (" + formatNumber(shape.COM.x) + ", " + formatNumber(shape.COM.y) + ") , area: " + formatNumber(shape.area) + "m^2 , inertia: " + formatNumber(shape.inertia) + "kg*m^2");
    switch(shape.type){
        case ShapeType.POLYGON:
           shape = shape as Polygon;
            console.log(shape.vertices.length);
            for(let i = 0; i < shape.vertices.length; i++){
                let vertex = shape.vertices[i];
                console.log("vertex " + i + "- position: " + vec2string(vertex.position) + " normal: " + vec2string(vertex.normal));
            }
            break;
        case ShapeType.CIRCLE:
            shape = shape as Circle;
            console.log("Radius: " + formatNumber(shape.radius) + "m");
            break;

    }
}
function logBody(b: PhysicsObject ){
    console.log("\nPhysics Object:");
    console.log("mass: " + formatNumber(b.mass) + "kg , inertia: " + formatNumber(b.inertia) + "kg*m^2");
    for(let i = 0; i < b.colliders.length; i++){
        logShape(b.colliders[i]);
    }
}
let rect2 = PhysicsObject.rectangle(new vec2(2,1), 2, 2);
//console.log(rect2);

let rect = PhysicsObject.rectangle(new vec2(1,0), 2, 2);
//logShape(rect);


//logShape(rect2);



//let b1 = new PhysicsObject(vec2.zero, Rotation.zero, [rect, rect2]);
//logBody(b1);

//console.log(Collision(rect2, rect));
console.dir(rect.packForExport(), {depth: null})

let r1 = Rotation.new(Math.PI / 4);
let r2 = Rotation.new(Math.PI / 4);

r1.subtract(r2);
//console.log(r1);

let r = PhysicsObject.rectangle(new vec2(0,0), 2, 2);
let c = PhysicsObject.regularPolygon(new vec2(4,0), 1, 7, {angularVelocity: Rotation.new(Math.PI * 2)});


let world = new World(r,c);

let player = new Player("Leo", "awf2afasdfeAAAA");
let m = new GameManager();

m.createGame(player, true);



console.log(m.games);
//console.log(b1);
console.log(m.getPublicGameInfo());






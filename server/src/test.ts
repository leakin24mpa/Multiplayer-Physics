import { Rotation, vec2 } from "./physics/calc";
import { Polygon } from "./physics/geometry";

function vec2string(v: vec2): string{
    return "(" + v.x +", " + v.y + ")";
}
let points = [new vec2(0,0), new vec2(1,0), new vec2(1,1), new vec2(0,1),]

let rect = new Polygon(points);
console.log("COM: (" + rect.COM.x + ", " + rect.COM.y + ") , area: " + rect.area + ", inertia: " + rect.inertia);
console.log(rect.vertices.length);
for(let i = 0; i < rect.vertices.length; i++){
    let vertex = rect.vertices[i];
    console.log("vertex " + i + "- position: " + vec2string(vertex.position) + " normal: " + vec2string(vertex.normal));
}



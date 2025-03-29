import { Rotation, vec2 } from "./calc.js";

export class Vertex{
    position: vec2;
    normal: vec2;
    isInternal: boolean;
}
export interface Shape{
    isCircle: boolean;
    area: number;
    inertia: number;
    COM: vec2;
}
export class Polygon implements Shape{
    isCircle = false;
    area: number;
    inertia: number;
    COM: vec2;

    vertices: Vertex[];
    constructor(points: vec2[]){
        let totalArea = 0;
        let COM = vec2.zero;
        let lastPoint = points[points.length - 1];
        this.vertices = [];
        this.inertia = 0;
        for(let i = 0; i < points.length; i++){
            let triArea = vec2.cross(lastPoint, points[i]) / 2;
            let triCom = vec2.times(vec2.plus(lastPoint, points[i]), triArea);
            this.inertia += (lastPoint.magSqr() + vec2.dot(lastPoint, points[i]) + points[i].magSqr()) * triArea;

            totalArea += triArea;
            COM.add(triCom);

            this.vertices.push(
                {position: points[i], 
                 normal: vec2.minus(points[i], lastPoint).normalize().rotateBy(Rotation.cw90deg), 
                 isInternal: false});
            lastPoint = points[i];
        }
        COM.divideBy(totalArea * 3);
        this.inertia /= 6;
        this.area = totalArea;
        this.COM = COM;
    }
}
export class Circle implements Shape{
    isCircle = true;
    area: number;
    inertia: number;
    COM: vec2;
    radius: number;
    
    constructor(position: vec2 , radius: number){
        this.area = Math.PI * radius * radius;
        this.inertia = this.area * radius * radius + 0.5 * position.magSqr() * this.area;
        this.COM = position;
        this.radius = radius;
    }
}
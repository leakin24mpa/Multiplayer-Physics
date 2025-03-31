import { Rotation, vec2 } from "./calc.js";

export class Vertex{
    position: vec2;
    normal: vec2;
    isInternal: boolean;
}
export enum ShapeType{
    POLYGON,
    CIRCLE
}
export type Shape = Polygon | Circle;


export class Polygon{
    type = ShapeType.POLYGON;
    area: number;
    inertia: number;
    COM: vec2;
    vertices: Vertex[];
    constructor(points: vec2[], internalEdges?: boolean[]){
        let totalArea = 0;
        this.COM = vec2.zero();
        let lastPoint = points[points.length - 1];
        this.vertices = [];
        this.inertia = 0;
        for(let i = 0; i < points.length; i++){
            let triArea = vec2.cross(lastPoint, points[i]) / 2;
            let triCom = vec2.times(vec2.plus(lastPoint, points[i]), triArea);
            this.inertia += (lastPoint.magSqr() + vec2.dot(lastPoint, points[i]) + points[i].magSqr()) * triArea;

            totalArea += triArea;
            this.COM.add(triCom);

            this.vertices.push(
                {position: points[i], 
                 normal: vec2.minus(points[i], lastPoint).normalize().rotateBy(Rotation.cw90deg()), 
                 isInternal: internalEdges? internalEdges[i]: false});
            lastPoint = points[i];
        }
        this.COM.divideBy(totalArea * 3);
        this.inertia /= 6;
        this.area = totalArea;
    }
    translate(t: vec2){
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].position.add(t);
        }
        this.inertia -= this.COM.magSqr() * this.area;
        this.COM.add(t);
        this.inertia += this.COM.magSqr() * this.area;

    }
    static rectangle(position: vec2, width: number , height: number){
        let x = position.x;
        let y = position.y;
        let hw = width / 2;
        let hh = height / 2;
        return new Polygon(
            [new vec2(x - hw, y - hh),
             new vec2(x + hw, y - hh),
             new vec2(x + hw, y + hh),
             new vec2(x - hw, y + hh)]);
    }
    static regularPolygon(position: vec2, radius: number, sides: number){
        let points = [];
        let rot = new Rotation(2 * Math.PI / sides)
        let vertex = vec2.rotatedBy(new vec2(0, -radius), Rotation.times(rot, 0.5));
        for(let i = 0; i < sides; i++){
            points.push(vec2.plus(vertex, position));
            vertex.rotateBy(rot);
        }
        return new Polygon(points);
    }
}
export class Circle{
    type = ShapeType.CIRCLE;
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
    translate(t: vec2){
        this.inertia -= this.COM.magSqr() * this.area;
        this.COM.add(t);
        this.inertia += this.COM.magSqr() * this.area;

    }
}
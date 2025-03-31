import { Rotation, vec2 } from "./calc.js";
import { Circle, Polygon, Shape, ShapeType } from "./geometry.js";

export class Material{
    bounciness: number; 
    friction: number;
    staticFriction: number;
    density: number;

    constructor(bounciness: number, friction: number, staticFriction: number, density: number){
        this.bounciness = bounciness;
        this.friction = friction;
        this.staticFriction = staticFriction;
        this.density = density;
    }
    static default = new Material(0.2, 0.3, 0.4, 1);
}
export interface GameObject{
    isCollection: boolean;
    getAllObjects(): any;
}
export class Collection implements GameObject{
    isCollection = true;
    children: GameObject[] = [];

    constructor(children: GameObject[]){
        this.children = children;
    }
    static ofObjects(...objects: GameObject[]){
        return new Collection(objects)
    }
    addObjects(objects: GameObject | GameObject[]){
        if(Array.isArray(objects)){
            this.children = [].concat(objects)
        }
        else{
            this.children.push(objects);
        }
        return this;
    }
    getAllObjects(): PhysicsObject[]{
        let objects = [];
        for(let i = 0; i < this.children.length; i++){
            if( this.children[i].isCollection){
                objects.push(this.children[i].getAllObjects())
            }
            else{
                objects.push(this.children[i]);
            }
        }
        return objects;
    }
}
interface PhysicsObjectOptions{
    velocity?: vec2;
    angularVelocity?: Rotation;
    bounciness?: number;
    staticFriction?: number;
    friction?: number;
    density?: number;
    material?: Material;
    static?: boolean;

}
export class PhysicsObject implements GameObject{
    getAllObjects() {
        return null;
    }
    isCollection = false;
    position: vec2;
    angle: Rotation;

    lastPosition: vec2;
    lastAngle: Rotation;

    acceleration: vec2 = vec2.zero();
    angularAccerleration: Rotation = Rotation.zero();

    mass: number;
    inverseMass: number;

    inertia: number;
    inverseInertia: number;

    material: Material;

    colliders: Shape[];
    constructor(position: vec2, angle: Rotation, colliders: Shape[], options?: PhysicsObjectOptions){
        this.position  = position;
        this.angle = angle;

        this.lastPosition = position.copy();
        this.lastAngle = angle.copy();

        this.colliders = colliders;
        if(options){
            if(options.velocity){
                this.lastPosition.subtract(options.velocity);
            }
            if(options.angularVelocity){
                this.lastAngle.subtract(options.angularVelocity);
            }
            if(options.material){
                this.material = options.material;
            }
            else{
                this.material = Material.default;
            }
            if(options.bounciness){
                this.material.bounciness = options.bounciness;
            }
            if(options.density){
                this.material.density = options.density;
            }
            if(options.staticFriction){
                this.material.staticFriction = options.staticFriction;
            }
            if(options.friction){
                this.material.friction = options.friction;
            }
        }
        else{
            this.material = Material.default;
        }
        this.calculateProperties();
        if(options && options.static){
            this.inverseMass = 0;
            this.inverseInertia = 0;
        }
    }
    private calculateProperties(){
        let COM = new vec2(0,0);
        let totalArea = 0;
        for(let i = 0; i < this.colliders.length; i++){
            totalArea += this.colliders[i].area;
            COM.add(vec2.times(this.colliders[i].COM, this.colliders[i].area));
        }
        COM.divideBy(totalArea);
        this.mass = totalArea * this.material.density;

        let inertia = 0;
        for(let i = 0; i < this.colliders.length; i++){
            this.colliders[i].translate(COM.inverse());
            inertia += this.colliders[i].inertia;
        }
        this.inertia = inertia * this.material.density;

        this.inverseMass = 1/this.mass;
        this.inverseInertia = 1/this.inertia;
    }
    worldToLocalSpace(v: vec2): vec2{
        return vec2.worldToLocalSpace(v, this.position, this.angle);
    }
    localToWorldSpace(v: vec2): vec2{
        return vec2.localToWorldSpace(v, this.position, this.angle);
    }
    applyForce(force: vec2, location: vec2){
        this.acceleration.add(vec2.times(force, this.inverseMass));
        this.angularAccerleration.add(new Rotation(vec2.cross(location, force) * this.inverseInertia));
    }
 

    //static readonly empty = new PhysicsObject(vec2.zero, Rotation.zero, [], {density: Infinity});
    static rectangle(position: vec2, width: number, height: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, Rotation.zero(), [Polygon.rectangle(vec2.zero(), width, height)], options);
    }
    static regularPolygon(position: vec2, radius: number, sides: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, Rotation.zero(), [Polygon.regularPolygon(vec2.zero(), radius, sides)], options);
    }
    static circle(position: vec2, radius: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, Rotation.zero(), [new Circle(vec2.zero(), radius)], options);
    }
    packForExport(){
        let shapes = [];
        for(let i = 0; i < this.colliders.length; i++){
            if(this.colliders[i].type == ShapeType.CIRCLE){
                shapes.push({
                    isCircle: true,
                    center: this.colliders[i].COM,
                    radius: (this.colliders[i] as Circle).radius
                });
            }
            else{
                shapes.push({
                    isCircle: false,
                    vertices: (this.colliders[i] as Polygon).vertices.map((v) => {return {x: v.position.x, y: v.position.y}})
                });
            }
        }

        return{
            position: {x: this.position.x, y: this.position.y},
            angle: this.angle.angle,
            shapes: shapes
        }
    }
}
import { Rotation, vec2 } from "./calc.js";
import { Shape } from "./geometry.js";

export class MaterialData{
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
    static default = new MaterialData(0.2, 0.3, 0.4, 1);
}
export interface GameObject{
    isCollection: boolean;
    getAllObjects(): any;
}
export class Collection implements GameObject{
    isCollection = true;
    children: GameObject[] = [];

    constructor(children: GameObject | GameObject[]){
        if(Array.isArray(children)){
            this.children = children;
        }
        else{
            this.children = [children];
        }
    }
    static ofObjects(objects: GameObject | GameObject[]){
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
export class PhysicsObject implements GameObject{
    getAllObjects() {
        return null;
    }
    isCollection = false;
    position: vec2;
    angle: Rotation;

    lastPosition: vec2;
    lastAngle: Rotation;

    acceleration: vec2;
    angularAccerleration: Rotation;

    mass: number;
    inverseMass: number;

    inertia: number;
    inverseInertia: number;

    materialData: MaterialData;

    colliders: Shape[];

    applyForce(force: vec2, location: vec2){
        this.acceleration.add(vec2.times(force, this.inverseMass));
        this.angularAccerleration.add(new Rotation(vec2.cross(location, force) * this.inverseInertia));
    }
 


}
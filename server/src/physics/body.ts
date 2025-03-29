import { Rotation, vec2 } from "./calc";

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
}
export class Body{
    position: vec2;
    angle: Rotation;

    velocity: vec2;
    angularVelocity: Rotation;

    acceleration: vec2;
    angularAccerleration: vec2;

    mass: number;
    inverseMass: number;

    inertia: number;
    inverseInertia: number;

    materialData: MaterialData;

    //colliders: Shape[];

}
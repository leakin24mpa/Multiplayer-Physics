import { Collection, GameObject, PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "./calc.js";

export class World{
    root: Collection;
    gravity: vec2 = new vec2(0,0);
    positionIterations: number = 5;
    velocityIterations: number = 5;
    constructor( ...objects: GameObject[]){
        this.root = new Collection(objects);
    }
    addObjects(...objects: GameObject[]){
            this.root.addObjects(objects);
    }
    
    step(dt: number){
        let objects = this.root.getAllObjects();
        for(let i = 0; i < objects.length; i++){
            let object = objects[i];

            //verlet integration: p(t + 1) = 2 * p(t) - p(t - 1) + a(t) * dt^2
            let newPosition = vec2.times(object.position, 2).subtract(object.lastPosition).add(vec2.times(object.acceleration, dt * dt));
            let newAngle = Rotation.plus(object.angle, object.angle).subtract(object.lastAngle) //.add(Rotation.times(object.angularAccerleration, dt * dt));

            object.lastPosition = object.position;
            object.lastAngle = object.angle;

            object.position = newPosition;
            object.angle = newAngle;

            object.acceleration = vec2.zero();
            object.angularAccerleration = Rotation.zero();
        }

    }
    packForExport(){
        return this.root.getAllObjects().map((o)=> o.packForExport());
    }
}



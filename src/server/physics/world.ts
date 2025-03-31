import { Collection, GameObject, PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "./calc.js";
import { Collision, Contact } from "./collision.js";
import { Solver } from "./solver.js";

export class World{
    root: Collection;
    gravity: vec2 = new vec2(0,0);
    
    solver: Solver = new Solver();

    constructor(...objects: GameObject[]){
        this.root = new Collection(objects);
    }
    addObjects(...objects: GameObject[]){
            this.root.addObjects(...objects);
    }
    
    step(dt: number){
        let objects = this.root.getAllObjects();

        //update objects positions based on velocity & acceleration
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

        //check for collisions
        let contacts: Contact[] = [];
        for(let i = 0; i < objects.length; i++){
            let objectA = objects[i];
            for(let j = i + 1; j < objects.length; j++){
                let objectB = objects[j];
                contacts.push(...Collision(objectA, objectB))
            }
        }
        //correct positions (stop colliding objects from overlapping)
        this.solver.resolvePositions(contacts);

    }
    packForExport(){
        return this.root.getAllObjects().map((o)=> o.packForExport());
    }
}



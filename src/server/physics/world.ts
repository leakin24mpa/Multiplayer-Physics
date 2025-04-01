import { Collection, GameObject, PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "./calc.js";
import { Collision, Contact } from "./collision.js";
import { Solver } from "./solver.js";

export class World{
    root: Collection;
    gravity: vec2 = new vec2(0,-1);
    
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
            let newPosition = vec2.minus(object.position, object.lastPosition).multiplyBy(dt / object.deltaTime).add(object.position);
            if(object.inverseMass != 0){
                newPosition.add(vec2.times(this.gravity, dt * dt));
            }

            let newAngle = Rotation.new(((object.angle.angle - object.lastAngle.angle) * dt / object.deltaTime) + object.angle.angle);


            object.lastPosition = object.position;
            object.lastAngle = object.angle;

            object.position = newPosition;
            object.angle = newAngle;

            object.acceleration = vec2.zero();
            object.angularAccerleration = Rotation.zero();

            //console.log(object.deltaTime);
            object.deltaTime = dt;
            
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
        //Apply collision impulse forces
        this.solver.resolveVelocities(contacts);
        this.applyAccelerations(objects, dt);
        //correct positions (stop colliding objects from overlapping)
        this.solver.resolvePositions(contacts);
        

    }
    applyAccelerations(objects: PhysicsObject[], dt: number){
        for(let i = 0; i < objects.length; i++){
            objects[i].lastPosition.subtract(vec2.times(objects[i].acceleration, dt));
            objects[i].lastAngle.subtract(Rotation.times(objects[i].angularAccerleration, dt));

            objects[i].acceleration = vec2.zero();
            objects[i].angularAccerleration = Rotation.zero();
        }

    }
    packForExport(){
        return this.root.getAllObjects().map((o)=> o.packForExport());
    }
}



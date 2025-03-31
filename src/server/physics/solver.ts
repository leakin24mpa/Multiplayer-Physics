import { exit } from "process";
import { PhysicsObject } from "./body.js";
import { vec2 } from "./calc.js";
import { Contact } from "./collision.js";

interface massFactor{
    a: number;
    b: number;  
}
function getMassFactor(am: number, bm: number): massFactor{
    let sum = 1 / (am + bm);
    return {a: am * sum, b: bm * sum}
}
export class Solver{
    positionIterations: number;
    velocityIterations: number = 1;
    positionCorrectionPercent: number = 0.6;

    resolvePositions(contacts: Contact[]){
        contacts.map((c) => this.resolvePosition(c));
    }
    resolveVelocities(contacts: Contact[]){

        contacts.map((c) => this.applyImpulses(c));
    }
    
    resolvePosition(c: Contact){
       let factor = getMassFactor(c.objectA.inverseMass, c.objectB.inverseMass);

       c.objectA.translate(vec2.times(c.normal, factor.a * c.depth * this.positionCorrectionPercent), false);
       c.objectB.translate(vec2.times(c.normal, -1 * factor.b * c.depth * this.positionCorrectionPercent), false);
    }

    applyImpulses(c: Contact){
        let objectA = c.objectA;
        let objectB = c.objectB;

        let normal = c.normal;
        let depth = c.depth;

        let nContacts = c.contactPoints.length;
        for(let i = 0; i < nContacts; i++){
            let contactA = vec2.minus(c.contactPoints[i], objectA.position);
            let contactB = vec2.minus(c.contactPoints[i], objectB.position);

            let relativeVelocity = vec2.minus(objectA.getVelocityOfPoint(contactA), objectB.getVelocityOfPoint(contactB));

            let dot = vec2.dot(relativeVelocity, normal);
            if(dot > 0){
                continue;
            }
            
            let restitution = Math.min(objectA.material.bounciness, objectB.material.bounciness);

            let impulseMagnitude = -(restitution + 1) * dot / (objectA.inverseMass + objectB.inverseMass) / nContacts;

            objectA.applyForce(vec2.times(normal, impulseMagnitude), vec2.zero());
            objectB.applyForce(vec2.times(normal, -impulseMagnitude), vec2.zero());

        }
    }
}

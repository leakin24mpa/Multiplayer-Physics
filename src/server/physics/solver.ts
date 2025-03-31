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
        let avgContact = vec2.zero();
        for(let i = 0; i < nContacts; i++){
            avgContact.add(c.contactPoints[i]);
        }
        avgContact.divideBy(nContacts);
        let avgA = vec2.minus(avgContact, objectA.position);
        let avgB = vec2.minus(avgContact, objectB.position);


        for(let i = 0; i < nContacts; i++){
            let contactA = vec2.minus(c.contactPoints[i], objectA.position);
            let contactB = vec2.minus(c.contactPoints[i], objectB.position);

            let relativeVelocity = vec2.minus(objectA.getVelocityOfPoint(contactA), objectB.getVelocityOfPoint(contactB));

            let dot = vec2.dot(relativeVelocity, normal);
            if(dot > 0){
                continue;
            }
            
            let restitution = Math.min(objectA.material.bounciness, objectB.material.bounciness);
            let AxN = vec2.cross(avgA, normal);
            let BxN = vec2.cross(avgB, normal);
            let massFactors = nContacts * (objectA.inverseMass + objectB.inverseMass + objectA.inverseInertia * AxN * AxN + objectB.inverseInertia * BxN * BxN);
            let impulseMagnitude = -(restitution + 1) * dot / massFactors;

            objectA.applyForce(vec2.times(normal, impulseMagnitude), contactA); 
            objectB.applyForce(vec2.times(normal, -impulseMagnitude), contactB);

        }
    }
}

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
    velocityIterations: number;
    positionCorrectionPercent: number = 0.6;

    resolvePositions(contacts: Contact[]){
        contacts.map((c) => this.resolvePosition(c));
    }
    
    resolvePosition(c: Contact){
        /*3     2
          1/3   1/2

          1/3 + 1/2 = 5/6

          1/3 / 5/6 = 1/3 * 6/5 = 2/5
          1/2 / 5/6 = 1/2 * 6/5 = 3/5
        
        
        */
       let factor = getMassFactor(c.objectA.inverseMass, c.objectB.inverseMass);

       c.objectA.position.add(vec2.times(c.normal, factor.a * c.depth * this.positionCorrectionPercent));
       c.objectB.position.subtract(vec2.times(c.normal, factor.b * c.depth * this.positionCorrectionPercent));
    }
}

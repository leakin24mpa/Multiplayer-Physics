import { PhysicsObject } from "./body.js";
import { vec2 } from "./calc.js";
import { Polygon, Shape } from "./geometry.js";

export interface Contact{
    depth: number;
    normal: vec2;
    objectA: PhysicsObject;
    objectB: PhysicsObject;

    shapeA: Shape;
    shapeB: Shape;

    contactPoints: vec2[];
}

export interface SATresult{
    axis: vec2;
    depth: number;
    Aindex: number;
    Bindex: number;
}
export function SAT(shapeA: Polygon, shapeB: Polygon, objectA: PhysicsObject, objectB: PhysicsObject): SATresult | false{
    let bestResult: SATresult = {axis: new vec2(0,0), depth: Infinity, Aindex: 0, Bindex: 0}

    for(let axis = 0; axis < shapeB.vertices.length; axis++){
        let AminProjection = Infinity;
        let mindex: number;

        let normal = shapeB.vertices[axis].normal;
        let BmaxProjection = vec2.dot(shapeB.vertices[axis].position, normal);

        for(let vertex = 0; vertex < shapeA.vertices.length; vertex++){
            let worldPosition = objectA.localToWorldSpace(shapeA.vertices[vertex].position);
            let localPosition = objectB.worldToLocalSpace(worldPosition);

            let proj = vec2.dot(localPosition, normal);
            if(proj < AminProjection){
                AminProjection = proj;
                mindex = vertex;
            }

        }
        if(AminProjection > BmaxProjection){
            return false;
        }
        if(BmaxProjection - AminProjection < bestResult.depth){
            bestResult.depth = BmaxProjection - AminProjection;
            bestResult.axis = normal;
            bestResult.Bindex = axis;
            bestResult.Aindex = mindex;
        }
    }
    return bestResult;
}
import { PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "./calc.js";
import { Polygon, Shape, Vertex } from "./geometry.js";

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
function objectToVertexSpace(v: vec2, vert: Vertex): vec2{
    return vec2.worldToLocalSpace(v , vert.position, {angle: 0, cos: vert.normal.x, sin: vert.normal.y} as Rotation)
}
function worldToVertexSpace(v: vec2, objectA: PhysicsObject, objectB: PhysicsObject, vert: Vertex): vec2{
    return objectToVertexSpace(objectB.worldToLocalSpace(objectA.localToWorldSpace(v)), vert);
}
function vertexToWorldSpace(v: vec2, objectB: PhysicsObject, vert: Vertex){
    return objectB.localToWorldSpace(vec2.localToWorldSpace(v , vert.position, {angle: 0, cos: vert.normal.x, sin: vert.normal.y} as Rotation));
}
function SAT(shapeA: Polygon, shapeB: Polygon, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    let bestResult: SATresult = {axis: new vec2(0,0), depth: Infinity, Aindex: 0, Bindex: 0}

    //find which normal of shapeB has the least overlap
    for(let axis = 0; axis < shapeB.vertices.length; axis++){
        if(shapeB.vertices[axis].isInternal){
            continue;
        }
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
    //find which face of shapeA is intersecting shapeB
    let n1idx = bestResult.Aindex; 
    let n1 = shapeA.vertices[n1idx].normal;

    let n2idx = (n1idx + 1) % shapeA.vertices.length;
    let n0idx = (n1idx - 1) % shapeA.vertices.length;

    let b1idx = bestResult.Bindex == 0? shapeB.vertices.length - 1 :bestResult.Bindex - 1;

    
    let n2 = shapeA.vertices[n1idx].normal;

    n1.rotateBy(objectA.angle).rotateBy(Rotation.inverse(objectB.angle));
    n2.rotateBy(objectA.angle).rotateBy(Rotation.inverse(objectB.angle));

    let contactPoints: vec2[];
    if(vec2.dot(n1, bestResult.axis) < vec2.dot(n2, bestResult.axis)){
        contactPoints = [shapeA.vertices[n0idx].position, shapeA.vertices[n1idx].position];
    }
    else{
        contactPoints = [shapeA.vertices[n1idx].position, shapeA.vertices[n2idx].position];
    }
    contactPoints = contactPoints.map((v) => (worldToVertexSpace(v, objectA, objectB, shapeB.vertices[bestResult.Bindex])));
    let b2 = objectToVertexSpace(shapeB.vertices[b1idx].position, shapeB.vertices[bestResult.Bindex]);

    for(let i = contactPoints.length - 1; i >= 0; i--){
        if(contactPoints[i].x > 0){
            contactPoints.splice(i);
            continue;
        }
        else{
            contactPoints[i].x = 0;
        }
        if(contactPoints[i].y > 0){
            contactPoints[i].y = 0;
        }
        if(contactPoints[i].y < b2.y){
            contactPoints[i].y = b2.y;
        }
    }
    contactPoints = contactPoints.map((v) => (vertexToWorldSpace(v, objectB, shapeB.vertices[bestResult.Bindex])));
    return {
        shapeA: shapeA,
        shapeB: shapeB,

        objectA: objectA,
        objectB: objectB,

        normal: bestResult.axis.rotateBy(objectB.angle),
        depth: bestResult.depth,

        contactPoints: contactPoints

    }
    //return bestResult;
}
export function PolygonCollsion(shapeA: Polygon, shapeB: Polygon, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    let rA = SAT(shapeA, shapeB, objectA, objectB);
    if(!rA){
        return false;
    }
    let rB = SAT(shapeB, shapeA, objectB, objectA);
    if(!rB){
        return false;
    }
    if(rB.depth < rA.depth){
        return rB;
    }
    else{
        return rA;
    }
}
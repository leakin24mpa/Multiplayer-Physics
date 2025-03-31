import { PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "./calc.js";
import { Circle, Polygon, Shape, ShapeType, Vertex } from "./geometry.js";

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
function invert(r: Contact){
    r.normal = r.normal.inverse();

    let objectB = r.objectB;
    r.objectB = r.objectA;
    r.objectA = objectB;

    let shapeB = r.shapeB;
    r.shapeB = r.shapeA;
    r.shapeA = shapeB;
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
        if(shapeB.vertices[axis].isInternal){
            continue;
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

    
    n1 = vec2.rotatedBy(n1, objectA.angle).rotateBy(Rotation.inverse(objectB.angle));
    n2 = vec2.rotatedBy(n2, objectA.angle).rotateBy(Rotation.inverse(objectB.angle));

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

        normal: vec2.rotatedBy(bestResult.axis,objectB.angle),
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
        invert(rB);
        return rB;
    }
    else{
        return rA;
    }
}
export function CirclePolygonCollision(shapeA: Circle, shapeB: Polygon, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    let localCenter = objectB.worldToLocalSpace(objectA.localToWorldSpace(shapeA.COM));
    let minDepth = Infinity;
    let normal: vec2;
    let bestContact: vec2;

    for(let i = 0; i < shapeB.vertices.length; i++){
        let vertex = shapeB.vertices[i];
        
        let contact: vec2;
        let relativeCenter = objectToVertexSpace(localCenter, vertex);
        if(relativeCenter.x > shapeA.radius){
            return false;
        }
        let depth = 0;
        if(relativeCenter.y > 0){
            depth = shapeA.radius - relativeCenter.mag();
            contact = new vec2(0,0);
            if(depth < 0){
                return false;
            }
        }
        else{
            depth = shapeA.radius - relativeCenter.x;
            contact = new vec2(0, relativeCenter.y);
        }
        if(vertex.isInternal){
            continue;
        }
        if(depth < minDepth){
            minDepth = depth;
            normal = vertex.normal;
            bestContact = contact;
        }

    }
    return {
        shapeA: shapeA,
        shapeB: shapeB,

        objectA: objectA,
        objectB: objectB,

        normal: normal.rotateBy(objectB.angle),
        depth: minDepth,

        contactPoints: [bestContact]
    }
}
export function PolygonCircleCollsion(shapeA: Polygon, shapeB: Circle, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    let ret = CirclePolygonCollision(shapeB, shapeA, objectB, objectA);
    if(!ret){
        return false;
    }
    else{
        invert(ret);
        return ret;
    }
}

export function CircleCircleCollision(shapeA: Circle, shapeB: Circle, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    let Acenter = objectB.worldToLocalSpace(objectA.localToWorldSpace(shapeA.COM));
    let between = vec2.minus(Acenter, shapeB.COM);
    let dist = between.mag();
    if(dist> shapeA.radius + shapeB.radius){
        return false;
    }
    else{
        let normal = vec2.dividedBy(between, dist);
        return{
            depth: shapeA.radius + shapeB.radius - dist,
            normal: normal.rotateBy(objectB.angle),

            shapeA: shapeA,
            shapeB: shapeB,

            objectA: objectA,
            objectB: objectB,

            contactPoints: [objectB.localToWorldSpace(vec2.times(normal, shapeB.radius))]
        }
    }
}
export function ShapeCollision(shapeA: Shape, shapeB: Shape, objectA: PhysicsObject, objectB: PhysicsObject): Contact | false{
    if(shapeA.type == ShapeType.CIRCLE){
        if(shapeB.type == ShapeType.CIRCLE){
            return CircleCircleCollision(shapeA as Circle, shapeB as Circle, objectA, objectB);
        }
        else{
            return CirclePolygonCollision(shapeA as Circle, shapeB as Polygon, objectA, objectB);
        }
    }
    else{
        if(shapeB.type == ShapeType.CIRCLE){
            return PolygonCircleCollsion(shapeA as Polygon, shapeB as Circle, objectA, objectB);
        }
        else{
            return PolygonCollsion(shapeA as Polygon, shapeB as Polygon, objectA, objectB);
        }
    }
}
export function Collision(objectA: PhysicsObject, objectB: PhysicsObject){
    let results: Contact[] = [];
    for(let i = 0; i < objectA.colliders.length; i++){
        for(let j = 0; j < objectB.colliders.length; j++){
            let res = ShapeCollision(objectA.colliders[i], objectB.colliders[j], objectA, objectB);
            if(res){
                results.push(res);
            }
        }
    }
    return results;
}
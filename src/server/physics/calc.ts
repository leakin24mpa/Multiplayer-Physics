//if you're new here, calc stands for calculator (i'm just using slang)

export class vec2{
    x: number;
    y: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    add(other: vec2): vec2{
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subtract(other: vec2): vec2{
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    multiplyBy(scalar: number): vec2{
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    divideBy(scalar: number): vec2{
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    normalize(): vec2{
        let length = this.mag();
        this.x /= length;
        this.y /= length;
        return this;
    }
    magSqr(): number{
        return this.x * this.x + this.y * this.y;
    }
    mag(): number{
        return Math.sqrt(this.magSqr());
    }
    rotateBy(r: Rotation): vec2{
        let x = this.x * r.cos - this.y * r.sin;
        let y = this.y * r.cos + this.x * r.sin;
        this.x = x;
        this.y = y;
        return this;
    }
    invert():vec2{
        this.x *= -1;
        this.y *= -1;
        return this;
    }
    inverse():vec2{
        return new vec2(-this.x, -this.y);
    }
    static plus(a: vec2, b: vec2): vec2{
        return new vec2(a.x + b.x, a.y + b.y);
    }
    static minus(a: vec2, b: vec2): vec2{
        return new vec2(a.x - b.x, a.y - b.y);
    }
    static dot(a: vec2, b: vec2): number{
        return a.x * b.x + a.y * b.y;
    }
    static cross(a: vec2, b: vec2): number{
        return a.x * b.y - a.y * b.x;
    }
    static times(vector: vec2, scalar: number){
        return new vec2(vector.x * scalar, vector.y * scalar);
    }
    static dividedBy(vector: vec2, scalar: number){
        return new vec2(vector.x / scalar, vector.y / scalar);
    }
    static asUnitVector(vector: vec2): vec2{
        let length = vector.mag();
        return new vec2(vector.x / length, vector.y / length);
    }
    static rotatedBy(v: vec2, r: Rotation): vec2{
        let x = v.x * r.cos - v.y * r.sin;
        let y = v.y * r.cos + v.x * r.sin;
        return new vec2(x, y);
    }
    static worldToLocalSpace(v: vec2, localOrigin: vec2, localRotation: Rotation){
        return vec2.minus(v, localOrigin).rotateBy(localRotation.inverse());
    }
    static localToWorldSpace(v: vec2, localOrigin: vec2, localRotation: Rotation){
        return vec2.rotatedBy(v, localRotation).add(localOrigin);
    }

    static readonly ihat = new vec2(1,0);
    static readonly jhat = new vec2(0,1);
    static readonly zero = new vec2(0,0);
}
export class Rotation{
    cos: number;
    sin: number;
    angle: number;
    constructor(angle: number){
        this.angle = angle;
        this.cos = Math.cos(angle);
        this.sin = Math.sin(angle);
    }
    add(other: Rotation){
        this.angle = this.angle + other.angle;
        this.cos = this.cos * other.cos - this.sin * other.sin;
        this.sin = this.sin * other.cos + this.cos * other.sin;
        return this;
    }
    subtract(other: Rotation){
        this.add(other.inverse());
        return this;
    }
    invert(){
        this.angle = -this.angle;
        this.sin = -this.sin;
        return this;
    }
    inverse(): Rotation{
        return {cos: this.cos, sin: -this.sin, angle: -this.angle} as Rotation;
    }
    unitVector(): vec2{
        return new vec2(this.cos, this.sin);
    }
    getDegrees(): number{
        return this.angle * 180 / Math.PI;
    }
    static plus(a: Rotation, b: Rotation): Rotation{
        let angle = a.angle + b.angle;
        let cos = a.cos * b.cos - a.sin * b.sin;
        let sin = a.sin * b.cos + a.cos * b.sin;
        return {cos: cos, sin: -sin, angle: -angle} as Rotation;
    }
    static minus(a: Rotation, b: Rotation): Rotation{
        return Rotation.plus(a,b.inverse());
    }
    static times(r: Rotation, n: number){
        return new Rotation(r.angle * n);
    }
    static fromDegrees(d: number): Rotation{
        return new Rotation(d * Math.PI / 180);
    }
    static readonly ccw90deg = {angle: Math.PI/2, cos: 0, sin: 1} as Rotation;
    static readonly cw90deg = {angle: -Math.PI/2, cos: 0, sin: -1} as Rotation;
    static readonly zero = {angle: 0, cos: 1, sin: 0} as Rotation;
}
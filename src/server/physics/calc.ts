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
    copy():vec2{
        return new vec2(this.x, this.y);
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
    static worldToLocalSpace(v: vec2, localOrigin: vec2, localRotation: Rotation): vec2{
        return vec2.minus(v, localOrigin).rotateBy(Rotation.inverse(localRotation));
    }
    static localToWorldSpace(v: vec2, localOrigin: vec2, localRotation: Rotation): vec2{
        return vec2.rotatedBy(v, localRotation).add(localOrigin);
    }

    static ihat(): vec2{
        return new vec2(1,0);
    }
    static jhat(): vec2{
        return new vec2(0,1);
    }
    static zero(): vec2{
        return new vec2(0,0);
    }
}
export class Rotation{
    cos: number;
    sin: number;
    angle: number;

    constructor(angle: number, cos: number, sin: number){
        this.angle = angle;
        this.cos = cos;
        this.sin = sin;
    }
    add(other: Rotation){
        this.angle = this.angle + other.angle;
        let cos = this.cos * other.cos - this.sin * other.sin;
        let sin = this.sin * other.cos + this.cos * other.sin;
        this.cos = cos;
        this.sin = sin;
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
        return new Rotation(-this.angle, this.cos, -this.sin);
    }
    unitVector(): vec2{
        return new vec2(this.cos, this.sin);
    }
    getDegrees(): number{
        return this.angle * 180 / Math.PI;
    }
    copy():Rotation{
        return new Rotation(this.angle, this.cos, this.sin);
    }
    static new(radians: number){
        return new Rotation(radians, Math.cos(radians), Math.sin(radians));
    }
    static plus(a: Rotation, b: Rotation): Rotation{
        let angle = a.angle + b.angle;
        let cos = a.cos * b.cos - a.sin * b.sin;
        let sin = a.sin * b.cos + a.cos * b.sin;
        return new Rotation(angle, cos, sin);
    }
    static inverse(r: Rotation): Rotation{
        return new Rotation(-r.angle, r.cos, -r.sin);
    }
    static minus(a: Rotation, b: Rotation): Rotation{
        return Rotation.plus(a,b.inverse());
    }
    static times(r: Rotation, n: number){
        return Rotation.new(r.angle * n);
    }
    static fromDegrees(d: number): Rotation{
        return Rotation.new(d * Math.PI / 180);
    }

    static ccw90deg(): Rotation{
        return new Rotation(Math.PI / 2, 0, 1);
    }
    static cw90deg(): Rotation{
        return new Rotation( -Math.PI/2, 0, -1);
    }
    static zero():Rotation{
        return new Rotation(0, 1, 0);
    }
}

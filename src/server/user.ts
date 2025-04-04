import { PhysicsObject } from "./physics/body.js";

export class User{
    name: string;
    id: string;
    game: string;
    isPlaying: boolean;


}
export class Spectator extends User{
    isPlaying = false;
    constructor(name: string, id: string, game: string){
        super();
        this.name = name;
        this.id = id; 
        this.game = game;
    }
}
export class Player extends User{
    isPlaying = true;
    object: PhysicsObject;
    constructor(name: string, id: string){
        super();
        this.name = name;
        this.id = id; 
    }
}

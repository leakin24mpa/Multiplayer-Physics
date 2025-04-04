import { PhysicsObject } from "./physics/body.js";
import { Rotation, vec2 } from "./physics/calc.js";
import { Polygon } from "./physics/geometry.js";
import { World } from "./physics/world.js";
import { Player, User } from "./user.js";
export interface PlayerInput{
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
}
export class Game{
    code: string;
    host: User;
    isPublic: boolean;
    players: Player[];
    world: World;

    constructor(host: User, code: string, isPublic: boolean){
        this.host = host;
        this.code = code;
        this.isPublic = isPublic;
        this.players = [];
        let r = PhysicsObject.rectangle(new vec2(0,0), 2, 2, {velocity: new vec2(-1,0)});
        let p = PhysicsObject.regularPolygon(new vec2(3,0), 1, 7, {velocity: new vec2(-3,0), angle: Rotation.fromDegrees(180)});
        let c = PhysicsObject.circle(new vec2(0, 3), 1,{bounciness: 1});
        
        let floor = Polygon.rectangle(new vec2(0,-5), 10, 1);
        let leftWall = Polygon.rectangle(new vec2(-5,0), 1, 10);
        let rightWall = Polygon.rectangle(new vec2(5,0), 1, 10);
        let roof = Polygon.rectangle(new vec2(0,5), 10, 1);
        
        let boundaries = new PhysicsObject(vec2.zero(), [floor, leftWall, rightWall, roof], {static: true, bounciness: 0.8, angularVelocity: Rotation.new(0.4)});
        this.world = new World(r,p,c,boundaries);
    }
    addPlayers(...players: Player[]){
        this.players.push(...players);

        this.world.addObjects(...(players.map((p) => {
            let obj = PhysicsObject.rectangle(new vec2(0,0), 1, 1, {bounciness: 1});
            p.object = obj;
            return obj;
        })));
    }
    update(dt: number){
        this.world.step(dt);
    }
    removePlayer(id: string){
        for(let i = this.players.length; i >=0; i--){
            if(this.players[i].id == id){
                this.players.splice(i);
            }
        }
    }

}
export class GameManager{
    games = {};
    connectedUsers = {};
    createGame(host: User, isPublic: boolean): Game{
        

        let code: string;
        do{
            code = (Math.random() * 900000 + 100000).toFixed(0);
        }while(code in this.games);
        
        let game = new Game(host, code, isPublic);
        this.games[code] = game;
        host.game = code;
        if(host.isPlaying){
            this.addPlayerToGame(host as Player, code);
        }
        
        return game;
    }
    addPlayerToGame(player: Player, gameCode: string){
        player.game = gameCode;
        let game = this.games[gameCode];
        game.addPlayers(player);
    }
    handleInputs(inputs: PlayerInput, player: Player){
        let f = new vec2(0,0);

        // '+' casts the booleans to numbers
        f.add(new vec2(+inputs.d - +inputs.a, +inputs.w - +inputs.d));

        f.multiplyBy(0.01);
        player.object.applyForce(f, new vec2(0,0));
    }
    getPublicGameInfo(){
        let info = [];
        for(var code in this.games){
            let game = this.games[code];
            info.push({
                code: code,
                hostName: game.host.name,
                numPlayers: game.players.length

            })
        }
        return info;
    }
    gameExists(code: string){
        return code in this.games;
    }
    getGameData(code: string){
        return this.games[code].world.packForExport();
    }
    updateAll(dt: number){
        for(var code in this.games){
            this.games[code].update(dt);
        }
    }

}
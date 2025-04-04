# Multiplayer Physics
### A custom 2D physics engine running on a nodejs server

## How it works
- The physics engine runs on the server and sends updates to the clients about what objects exist and where in the world they are

- Each client has a simple rendering script using P5.js to display the state of the simulation to the user.

- The clients can interact with the simulation by sending data to the server.


## Commands
- `npm run test` runs the [test.ts](https://github.com/leakin24mpa/Multiplayer-Physics/blob/main/src/server/test.ts) file (I use this for testing/debugging)
- `npm run build` compiles the typescript files to javascript
- `npm run local` runs the server locally on your computer. You can connect to it at `localhost:3000`
- `npm run public`runs the server on your computer, but makes it accessible to your local network. Other devices on your WiFi network will be able to connect to the server and join the games`


var socket;
socket = io.connect();

document.getElementById("game code").addEventListener('submit',(e) => {
    e.preventDefault();
    let numbers = document.getElementById("digits").children;
    let code = "";
    for(let i = 0; i < numbers.length; i++){
        code += numbers[i].value;
    }
    console.log(code);
})

let games = document.getElementsByClassName("gamelisting");



let availableGames = [];

socket.on('games', (games) => {
    clearPublicGames();
    for(let i = 0; i < games.length; i++){
        let g = addPublicGame(games[i]);
        g.addEventListener('click', (e) => {
            let username = document.getElementById("name").value;
            console.log(username);
            if(username == "" || username.length > 16){
                return;
            }
            socket.emit("join",
                {
                    name: username,
                    code: availableGames[i].code
                });
        });
        
    }
    availableGames = games;
});







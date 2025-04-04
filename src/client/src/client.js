
var socket;
socket = io.connect();



let users = [];

let physicsObjects = [];
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);


if(params.get("code")){

}

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

socket.on('update', (data) => {users = data});

socket.on('physics', (data) => {physicsObjects = data});

socket.on('success', (code) => {
    
    params.set('code', code); // Add or update a parameter
    url.search = params.toString();
    window.history.replaceState({}, '', url.href);
    
    document.getElementById("defaultCanvas0").style.visibility = true;


})





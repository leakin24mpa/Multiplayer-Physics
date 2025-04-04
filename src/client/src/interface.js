function newElement(type, id, className){
    let element = document.createElement(type,);
    if(id){
        element.id = id;
    }
    if(className){
        element.className = className;
    }

    return element;
}
const newForm = (id, className) => newElement('form', id, className);
const newDiv = (id, className) => newElement('div', id, className);
const newSpan = (id, className) => newElement('span', id, className);
const newInput = (id, className) => newElement('input', id, className);
const newP = (id, className) => newElement('p', id, className);
const newLi = (id, className) => newElement('li', id, className);

function addPublicGame(game){
    let element = newLi();
    element.className = 'gamelisting'
    element.innerHTML = `<p class="gamename">Public Game</p>
                         <p class="hostname">Hosted By: ${game.hostName}</p>
                         <p class="playercount">Players Online: ${game.numPlayers}</p>
                         <p class="gamecode"> #${game.code}</p>`
    document.getElementById("public-games").appendChild(element);
    return element;
}
function createInputForm(prompt, id, correctInputfn, callback){
    let form = newForm(id);
    let container = newDiv(null, "form-container");
    let inputBox = newInput(null, "greytext input");
    let sizer = newSpan(null, "greytext resizer");
    let promptText = newP();
    promptText.innerHTML = prompt;
    form.appendChild(promptText);
    form.appendChild(container);
    container.appendChild(inputBox);
    container.appendChild(sizer);

    inputBox.addEventListener('input', (e) =>{
        if(correctInputfn){
            inputBox.value = correctInputfn(inputBox.value);
        }
        sizer.innerHTML = inputBox.value;
        
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        callback(inputBox.value);
    });
    form.getInputBox = () => inputBox;
    return form;
}
function clearPublicGames(){
    document.getElementById("public-games").innerHTML = '';
}


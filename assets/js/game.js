const divFlashcards = document.querySelector('#flashcards');
const divAvisoPrevio = document.querySelector('#aviso-previo');
const spanJogador1 = document.querySelector('#jogador1');
const spanJogador2 = document.querySelector('#jogador2');
const cartasJogador1 = document.querySelector('#cartasJogador1');
const cartasJogador2 = document.querySelector('#cartasJogador2');
const vezJogador = document.querySelector('#vezJogador');

const socket = io();
socket.on('connect', () => {
    socket.emit('get-info', window.location.href.split('/').pop());
});

socket.on('get-info', (info) => {
    spanJogador1.innerHTML = info.jogador1;
    spanJogador2.innerHTML = info.jogador2;
    vezJogador.innerHTML = info.jogador1;
});

// Configurações inicias
let MAX_TEMPO_PREVIO = 4000;
setInterval(() => {
    if (MAX_TEMPO_PREVIO < 1) {
        divAvisoPrevio.innerHTML = "Jogar!!!";
        return;
    }
    divAvisoPrevio.innerHTML = `Começando em ${MAX_TEMPO_PREVIO/1000}...`;
    MAX_TEMPO_PREVIO -= 1000;
    console.log('object');
}, 1000);

let frutas = [
    'abacaxi', 'pera', 'uva',
    'apple', 'cereja', 'abacate',
    'melancia', 'morango', 'laranja',
    'pessego', 'mirtilos', 'kiwi', 'banana'
];

frutas = [...frutas, ...frutas];

function desenhar_cartas() {
    divFlashcards.innerHTML += ``;
    frutas.forEach((fruta, i) => {
        divFlashcards.innerHTML += `
        <div class="flashcard">
            <div class="flashcard-inner" id="flashcard-${i}" onclick="escolher_flashcard(event)" >
                <div class="flashcard-front bg-primary" id="ff-${i}">
                    <!-- ${fruta} -->
                </div>
                <div class="flashcard-back bg-light" id="fb-${i}">
                    <img src="/assets/img/fruits/${fruta}.png" alt="${fruta}">
                </div>
            </div>
        </div>
        `;
    });
}
desenhar_cartas();

function escolher_flashcard(e) {}


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
    desenhar_cartas(info.frutas_id);
});

socket.on('flip-card', (obj) => {
    console.log("Algume virou: id="+obj.cardId);
    console.log(document.getElementById(obj.cardId)); 
    const carta = document.getElementById(obj.cardId);
    carta.classList.toggle('flip');
});

// Configurações inicias
let MAX_TEMPO_PREVIO = 4000;
setInterval(() => {
    if (MAX_TEMPO_PREVIO < 1) {
        divAvisoPrevio.innerHTML = "Jogar!!!";
        return;
    }
    divAvisoPrevio.innerHTML = `Começando em ${MAX_TEMPO_PREVIO / 1000}...`;
    MAX_TEMPO_PREVIO -= 1000;
    console.log('object');
}, 1000);


// ######################### PASSAR PARA O SERVIDOR(???) #########################
// frutas - [OK]

// frutas = [...frutas, ...frutas];

function desenhar_cartas(frutas_id) {
    divFlashcards.innerHTML = '';
    Object.keys(frutas_id).forEach((fruta, i) => {
        console.log(fruta);
        divFlashcards.innerHTML += `
        <div class="flashcard">
            <div class="flashcard-inner" id="flashcard-${i}" onclick="escolher_flashcard(event)" >
                <div class="flashcard-front bg-primary fs-5" id="ff-${i}">
                    ${frutas_id[fruta]}
                </div>
                <div class="flashcard-back bg-light" id="fb-${i}">
                    <img src="/assets/img/fruits/${frutas_id[fruta]}.png" alt="${frutas_id[fruta]}">
                </div>
            </div>
        </div>
        `;
    });
}

function escolher_flashcard(e) {
    const flashcard = e.target.closest('.flashcard-inner');

    if (!flashcard) return; // Se não encontrou o elemento, interrompe a execução

    // Enviar o ID do flashcard para o servidor
    socket.emit('click-in-card', [flashcard.id, window.location.href.split('/').pop()]);
}

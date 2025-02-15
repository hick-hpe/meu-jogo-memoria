const divFlashcards = document.querySelector('#flashcards');
const divAvisoPrevio = document.querySelector('#aviso-previo');
const spanJogador1 = document.querySelector('#jogador1');
const spanJogador2 = document.querySelector('#jogador2');
const cartasJogador1 = document.querySelector('#cartasJogador1');
const cartasJogador2 = document.querySelector('#cartasJogador2');
const vezJogador = document.querySelector('#vezJogador');
const strongVencedor = document.querySelector('#vencedor');
const strongPerdedor = document.querySelector('#perdedor');
const btnAbrirModal = document.querySelector('#btn-abrir-modal');
btnAbrirModal.style.display = 'none';
const btnJogarNovamente = document.querySelector('#jogar-novamente');
btnJogarNovamente.style.display = 'none';
const btnTheme = document.querySelector('#toggle-theme');
// const barraJogada = document.querySelector('#barra-jogada');
// const tempoJogada = document.querySelector('#tempo-jogada');

// let tempo = 1000;
// setInterval(() => {
//     tempoJogada.innerHTML = 'Tempo: ' + (tempo/1000);
//     // barra.innerHTML = 'Barra: ' +
// }, 5000);

let eu = '';
let fimDeJogo = true;
let interval_contagem_regressiva;
let interval_tempo_jogada;
let realizou_jogada = 0;
const MAX_TEMPO_PREVIO = 3000;
const MAX_TEMPO_JOGADA = 5000;

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("recarregado") === "true") {
        localStorage.removeItem("recarregado");
        // abrir_modal('abandonoMe');
        // redirecionar para '/salas'
        // setTimeout(() => window.location.href = '/salas', 3000);
    }
});

// Salva um valor antes da página ser recarregada ou fechada
window.addEventListener("beforeunload", function () {
    localStorage.setItem("recarregado", "true");
});


const socket = io(`/${window.location.href.split('/').pop()}`);
socket.on('connect', () => {
    const gameKey = window.location.href.split('/').pop();
    socket.emit('get-info', gameKey);
});

socket.on('get-info', (info) => {
    spanJogador1.innerHTML = info.jogador1;
    spanJogador2.innerHTML = info.jogador2;
    vezJogador.innerHTML = info.jogador1;
    eu = info.eu;
    console.log('EU: ' + eu);
    desenhar_cartas(info.frutas_id);
    
    // comecar contar MAX_TEMPO_JOGADA
    interval_tempo_jogada = setInterval(() => {
        // 
    }, MAX_TEMPO_JOGADA);
});

socket.on('flip-card', (obj) => {
    console.log("Algume virou: id=" + obj.cardId);
    const carta = document.getElementById('flashcard-' + obj.cardId);
    console.log("carta: " + carta);
    carta.classList.toggle('flip');
});

socket.on('troca-vez', ([VEZ_JOGADOR, cartasViradas]) => {
    console.log("TROCA-VEZ");
    console.log(VEZ_JOGADOR);
    console.log(cartasViradas);
    vezJogador.innerHTML = VEZ_JOGADOR;
    cartasViradas.forEach((cartasVirada) => {
        const flashcard = document.querySelector('#flashcard-' + cartasVirada);
        console.log('flashcard: => ', flashcard);
        setTimeout(() => {
            flashcard.classList.remove('flip');
            vezJogador.innerHTML = VEZ_JOGADOR;
        }, 1000);
    });
});

socket.on('pontos', ([jogador, pontos]) => {
    console.log('Pontos:' + jogador + '=' + pontos);
    if (spanJogador1.innerHTML === jogador) {
        cartasJogador1.innerHTML = pontos;
    } else {
        cartasJogador2.innerHTML = pontos;
    }
});

socket.on('fim-de-jogo', ({ vencedor, perdedor }) => {
    fimDeJogo = true;
    if (vencedor === eu) {
        abrir_modal('vitoria');
    } else {
        strongPerdedor.innerHTML = perdedor;
        strongVencedor.innerHTML = vencedor;
        abrir_modal('derrota');
    }
    btnJogarNovamente.style.display = '';
});

socket.on('reiniciar-jogo', (user) => {
    btnJogarNovamente.innerHTML = `<i>${user}</i> quer jogar novamente`;
});

socket.on('session-expired', () => {
    alert('Sua sessão expirou, por favor refaça o login.');
    window.location.href = '/';
});

socket.on('somioo', (user) => {
    abrir_modal('abandonoAdv');
    // redirecionar para '/salas'
    setTimeout(() => window.location.href = '/salas', 3000);
});


socket.on('ambos-aceitaram', (frutas_id) => {
    // alert('------- AMBOS ACEITARAM -------');
    fimDeJogo = true;
    cartasJogador1.innerHTML = 0;
    cartasJogador2.innerHTML = 0;
    btnJogarNovamente.style.display = "none";
    btnJogarNovamente.innerHTML = "Jogar Novamente";
    btnJogarNovamente.disabled = false;
    desenhar_cartas(frutas_id);
    setTimeout(() => {
        fimDeJogo = false;
        console.log('JOGARRRR');
    }, MAX_TEMPO_PREVIO + 1000);
    mostrar_contagem_regressiva(MAX_TEMPO_PREVIO);
});

socket.on('achou-par', () => {
    mostrar_toast('sucesso', 'Par encontrado!');
});

socket.on('nao-achou-par', () => {
    mostrar_toast('erro', 'Par não encontrado, passe a vez!');
});


// Configurações inicias
function mostrar_contagem_regressiva(MAX_TEMPO_PREVIO) {
    divAvisoPrevio.innerHTML = '';
    let tempo = MAX_TEMPO_PREVIO;

    interval_contagem_regressiva = setInterval(() => {
        divAvisoPrevio.innerHTML = `Começando em ${tempo / 1000}...`;
        console.log('---------------- aviso tempo restante ----------------');

        if (tempo <= 1000) {  // Corrigido: <= para garantir que exibe "Começando em 1..."
            setTimeout(() => {
                divAvisoPrevio.innerHTML = "Jogar!!!";
                console.log('---------------- aviso jogar ----------------');
                fimDeJogo = false;
            }, 1000);
            clearInterval(interval_contagem_regressiva);
        }

        tempo -= 1000;
    }, 1000);

}
mostrar_contagem_regressiva(MAX_TEMPO_PREVIO);


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
                    <!-- ${frutas_id[fruta]} -->
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
    if (fimDeJogo) {
        mostrar_toast('erro', 'Jogo ainda está carregando!!!');
    } else if (vezJogador.innerHTML !== eu) {
        mostrar_toast('erro', 'Não é sua vez!!!');
    } else {
        const flashcard = e.target.closest('.flashcard-inner');

        if (!flashcard) return; // Se não encontrou o elemento, interrompe a execução

        if (flashcard.classList.contains('flip')) return;

        // Enviar o ID do flashcard para o servidor
        socket.emit('click-in-card', flashcard.id.replace('flashcard-', ''));
    }
}

function abrir_modal(modalId) {
    btnAbrirModal.setAttribute('data-bs-target', `#${modalId}`);
    btnAbrirModal.click();
}

function mostrar_toast(tipoMensagem, mensagem) {
    // mensagem
    const bodyToast = document.querySelector('#toastMessage .toast-body');
    console.log('bodyToast: ' + bodyToast);
    bodyToast.textContent = mensagem;

    const toastMessage = document.getElementById('toastMessage');

    if (tipoMensagem === 'sucesso') {
        toastMessage.classList.remove('text-bg-danger');
        toastMessage.classList.add('text-bg-success');
    } else {
        toastMessage.classList.remove('text-bg-success');
        toastMessage.classList.add('text-bg-danger');
    }

    // showToastBtn
    const toastEl = new bootstrap.Toast(toastMessage, {
        delay: 2000 // Exibe por 5 segundos
    });
    toastEl.show();
}



btnJogarNovamente.addEventListener('click', () => {
    if (btnJogarNovamente.innerHTML.includes('quer jogar novamente')) {
        socket.emit('ambos-aceitaram');
    } else {
        btnJogarNovamente.disabled = true;
        const jogador = spanJogador1.innerHTML === eu ? spanJogador2.innerHTML : spanJogador1.innerHTML;
        btnJogarNovamente.innerHTML = `<img src="/assets/img/loading.gif" alt=""> Esperando <i>${jogador}</i> aceitar...`;
        socket.emit('reiniciar-jogo');
    }
});

// btnTheme.addEventListener('click', () => {
//     console.log('themeeeeeeee')
//     const currentTheme = document.body.classList.contains('dark-theme') ? '' : 'dark-theme';
//     toggle_theme(currentTheme);
// });

function toggle_theme(theme) {
    const icon = btnTheme.querySelector('.bi');

    if (theme === 'dark-theme') {
        document.body.classList.add('dark-theme');
        btnTheme.classList.replace('btn-light', 'btn-dark');

        icon.classList.replace('bi-brightness-high-fill', 'bi-moon-fill');
        icon.classList.replace('text-dark', 'text-light');

        localStorage.setItem('theme', 'dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        btnTheme.classList.replace('btn-dark', 'btn-light');

        icon.classList.replace('bi-moon-fill', 'bi-brightness-high-fill');
        icon.classList.replace('text-light', 'text-dark');

        localStorage.setItem('theme', '');
    }
}

const theme = localStorage.getItem('theme') || '';
toggle_theme(theme);
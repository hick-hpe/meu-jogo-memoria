const btnJogar = document.getElementById('btn-jogar');
const inputSalaEscolhida = document.getElementById('sala-escolhida');
const listaSalas = document.getElementById('salas');
const btnClose = document.getElementById('btn-close');
const btnCloseX = document.getElementById('btn-closeX');
const inputUsername = document.getElementById('username');
const btnSave = document.getElementById('btn-save');
const btnDelete = document.getElementById('btn-delete');
const btnDeleteConfirm = document.getElementById('deletar-conta');
const btnAcceptGame = document.getElementById('accept-invite');

let escolher_sala = true;
let usersCurrent = [];
let users_conectados;
const TEMPO_CONVITE_ATIVO = 10000;
let data = {};
let interval_convite;
let user_cancel_invite = false;

document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("recarregado");
});

// Conexão com o servidor Socket.io
const socket = io();

socket.on('connect', () => {
    console.log('Conectado ao Socket.IO');
});

socket.on('disconnect', () => {
    console.log('Desconectado do Socket.IO');
});

socket.on('updateUsers', (users) => {
    // Atualiza a lista de usuários conectados
    usersCurrent = users;
    users_conectados = new Set(users.map(user => user.nome));
    listar_usuarios();
});

socket.on('invite-ply', ({ userFrom, userTo }) => {
    data = { userFrom, userTo };
    let tempo = 1000;
    exibir_modal_convite(userTo.nome);
    interval_convite = setInterval(() => {
        if (tempo >= TEMPO_CONVITE_ATIVO) {
            // Fechar o modal de convite
            fechar_modal_convite();
            socket.emit('cancel-invite', data);
        }

        tempo += 1000;
    }, 1000);
});

socket.on('cancel-invite', () => {
    mostrar_toast('erro', 'Pedido recusado 😫');
    escolher_sala = true;
    btnJogar.innerHTML = `Jogar`;
});

socket.on('accept-invite', (gameKey) => {
    mostrar_toast('sucesso', 'Convite aceito 😁');
    setTimeout(() => window.location.href = '/game/' + gameKey, 3000);
    clearInterval(interval_convite);
    fechar_modal_convite();
    escolher_sala = true;
    btnJogar.innerHTML = `Jogar`;
});

socket.on('session-expired', () => {
    alert('Sua sessão expirou, por favor refaça o login.');
    window.location.href = '/';
});

function listar_usuarios() {
    console.log('[SIZE]: ' + users_conectados.size);
    listaSalas.innerHTML = "";
    console.log('placeholder: ' + inputUsername.placeholder);
    users_conectados.forEach((user) => {
        if (user !== inputUsername.placeholder) {
            const li = document.createElement('li');
            li.innerText = user;
            li.classList.add('list-group-item');

            // Adiciona o evento de clique para selecionar/desmarcar a sala
            li.addEventListener('click', () => {
                if (escolher_sala) {
                    if (li.classList.contains('active')) {
                        // Se já está ativo, desmarca e limpa o input
                        li.classList.remove('active');
                        inputSalaEscolhida.value = "";
                    } else {
                        // Remove a classe 'active' de todos os itens antes de adicionar ao novo
                        document.querySelectorAll('li').forEach((el) => el.classList.remove('active'));

                        // Adiciona a classe 'active' apenas ao item clicado
                        li.classList.add('active');
                        inputSalaEscolhida.value = user;
                    }
                }
            });
            listaSalas.appendChild(li);
        }
    });
}

function enviar_pedido() {
    console.log('-------------------------- enviar_pedido --------------------------');
    let userFrom = {};
    let userTo = {};
    let achouOsDois = 0;

    for (const user of usersCurrent) {
        if (user.nome === inputSalaEscolhida.value) {
            userFrom = user;
            achouOsDois++;

            if (achouOsDois === 2) {
                break;
            }
        }

        if (user.nome === inputUsername.placeholder) {
            userTo = user;
            achouOsDois++;

            if (achouOsDois === 2) {
                break;
            }
        }
    }

    data = { userFrom, userTo };

    console.log('--- Enviando pedido ---');
    console.log(`from ${inputUsername.value} to ${inputSalaEscolhida.value}`);
    socket.emit('invite-ply', data);
}

// Aceitar pedido
btnAcceptGame.addEventListener('click', () => {
    console.log('-------------------------- aceitar_pedido --------------------------');
    socket.emit('accept-invite', data);
});

// Evento do botão jogar
btnJogar.addEventListener('click', () => {
    if (btnJogar.textContent === "Jogar") {
        if (!inputSalaEscolhida.value) {
            mostrar_toast("erro", "Escolha uma sala para jogar!!!");
            return;
        }

        // Esperando por jogador
        btnJogar.innerHTML = `
        <img src="/assets/img/loading.gif" alt="gif" height="25" /> <i>Esperando</i>
        `;
        esperando_por_jogador();
        enviar_pedido();
    } else {
        // Resetando escolha
        escolher_sala = true;
        btnJogar.innerHTML = `Jogar`;
    }
});

// Fechar modal
btnClose.addEventListener('click', () => {
    socket.emit('cancel-invite', data);
});

btnSave.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Tentando atualizar nome...");

    try {
        const userId = document.getElementById("userId").value;
        const newName = inputUsername.value;

        const response = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome: newName })
        });

        const data = await response.json();

        if (response.ok) {
            mostrar_toast("sucesso", "Nome atualizado com sucesso!");
        } else {
            mostrar_toast("erro", data.error || "Erro ao atualizar nome!");
        }
    } catch (e) {
        console.error("Erro ao atualizar nome:", e);
    }
});


// Botão de deletar
btnDelete.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Excluir conta');
    document.getElementById('btn-modal-delete').click();
});

btnDeleteConfirm.addEventListener('click', excluir_conta);
async function excluir_conta() {
    try {
        // Obter o ID do usuário do campo hidden
        const userId = document.getElementById('userId').value;

        // Fazer a requisição para deletar o usuário
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE', // Usando DELETE para remover o usuário
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Usuário deletado com sucesso!');
            window.location.href = '/';  // Redireciona para a página inicial
        } else {
            console.error('Erro ao deletar usuário:', await response.text());
        }
    } catch (e) {
        console.error('Erro ao deletar usuário:', e);
    }
}


// Função para esperar por 5 segundos antes de permitir a escolha de sala novamente
function esperando_por_jogador() {
    escolher_sala = false;
    let tempo = 1000;

    interval_convite = setTimeout(() => {
        if (tempo >= TEMPO_CONVITE_ATIVO) {
            btnJogar.innerHTML = `Jogar`;
            escolher_sala = true;
            btnCloseX.click();
        }
    }, 1000); // 5 segundos
}

function exibir_modal_convite(nome) {
    const elemStrong = document.getElementById('user-modal');
    elemStrong.innerText = nome;
    document.getElementById('btn-abrir-modal').click();
}

function fechar_modal_convite() {
    btnCloseX.click();
}

async function get_and_set_username() {
    try {
        const response = await fetch('/auth/me');
        const data = await response.json();
        inputUsername.value = data.nome;
        inputUsername.placeholder = data.nome;
        document.getElementById('userId').value = data.id;
    } catch (err) {
        console.error('Erro ao tentar pegar o nome do usuário:', err);
    }
}
get_and_set_username();

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


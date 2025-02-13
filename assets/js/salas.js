const btnJogar = document.getElementById('btn-jogar');
const inputSalaEscolhida = document.getElementById('sala-escolhida');
const listaSalas = document.getElementById('salas');
const btnClose = document.getElementById('btn-close');
const inputUsername = document.getElementById('username');
const btnSave = document.getElementById('btn-save');
const btnDelete = document.getElementById('btn-delete');
const btnDeleteConfirm = document.getElementById('deletar-conta');

let escolher_sala = true;
let users_conectados;

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
    // users_conectados = new Set(Object.keys(users));
    users_conectados = new Set(users.map(user => user.nome));
    console.log('users');
    console.log(users_conectados);
    listar_usuarios();
});

function listar_usuarios() {
    console.log('[SIZE]: ' + users_conectados.size);
    listaSalas.innerHTML = "";
    users_conectados.forEach((user) => {
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
                    inputSalaEscolhida.value = sala.nome;
                }
            }
        });

        listaSalas.appendChild(li);
    });
}

// Evento do botão jogar
btnJogar.addEventListener('click', () => {
    if (btnJogar.textContent === "Jogar") {
        if (!inputSalaEscolhida.value) {
            alert("Escolha uma sala para jogar!!!");
            return;
        }

        // Esperando por jogador
        btnJogar.innerHTML = `
        <img src="/assets/img/loading.gif" alt="gif" height="25" /> <i>Esperando</i>
        `;
        esperando_por_jogador();
        exibir_modal_convite();
    } else {
        // Resetando escolha
        escolher_sala = true;
        btnJogar.innerHTML = `Jogar`;
    }
});

// Fechar modal
btnClose.addEventListener('click', () => {
    escolher_sala = true;
    btnJogar.innerHTML = `Jogar`;
});

btnSave.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Atualizar nome');

    try {
        // Obter o ID do usuário do campo hidden
        const userId = document.getElementById('userId').value;

        // Obter o novo nome a ser atualizado
        const newName = inputUsername.value;

        // Fazer a requisição para atualizar o nome
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT', // ou 'PATCH' dependendo da sua lógica
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: newName
            })
        });

        if (response.ok) {
            console.log('Nome atualizado com sucesso!');
        } else {
            console.error('Erro ao atualizar nome:', await response.text());
        }
    } catch (e) {
        console.error('Erro ao atualizar nome:', e);
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
// <scholarship@compass.uol>
// https://teams.microsoft.com/l/meetup-join/19%3ameeting_NjNkNzkyMDMtN2U5Yy00NDE5LTkwMmMtNjY2MmNkNWIwMzk3%40thread.v2/0?context=%7b%22Tid%22%3a%2297fa1f96-7877-469f-aa37-1f8568e3a3ff%22%2c%22Oid%22%3a%224cda66c2-c0b1-426a-8562-55bcbf6170fd%22%7d
// henrique.emerick.pb@compasso.com.br
function esperando_por_jogador() {
    escolher_sala = false;
    setTimeout(() => {
        btnJogar.innerHTML = `Jogar`;
        escolher_sala = true;
        btnClose.click();
    }, 5000); // 5 segundos
}

function exibir_modal_convite() {
    document.getElementById('btn-abrir-modal').click();
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



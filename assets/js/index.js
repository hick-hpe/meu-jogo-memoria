const inputNome = document.querySelector('#nome');
const inputSenha = document.querySelector('#senha');
const btnCriar = document.querySelector('#btn-criar');
const btnEntrar = document.querySelector('#btn-entrar');

btnCriar.addEventListener('click', criar_conta);
btnEntrar.addEventListener('click', entrar_conta);

async function criar_conta(e) {
    e.preventDefault();
    console.log('Tentando criar...');

    const nome = inputNome.value.trim();
    const senha = inputSenha.value.trim();

    if (nome === '' || senha === '') {
        alert('Preencha todos os campos');
        return;
    }

    const data = await criar_usuario(nome, senha);

    if (data && data.username) {
        alert('Conta criada com sucesso!');
        window.location.href = '/salas'; // Redireciona para a tela de jogo
    } else {
        alert('Erro ao criar conta! Nome de usuário pode estar em uso.');
    }
}


async function criar_usuario(nome, senha) {
    const settings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, senha }),
    }

    try {
        const response = await fetch('/auth/register', settings);
        if (!response.ok) {
            throw new Error(`Erro ao cadastrar usuário: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (err) {
        alert('Erro ao cadastrar usuário:' + err.message);
    }
}

async function entrar_conta(e) {
    e.preventDefault();
    console.log('Tentando entrar...');

    const nome = inputNome.value.trim();
    const senha = inputSenha.value.trim();

    if (nome === '' || senha === '') {
        alert('Preencha todos os campos');
        return;
    }

    const data = await entrar_usuario(nome, senha);

    if (data && data.username) {
        alert('Login bem-sucedido!');
        window.location.href = '/salas'; // Redireciona para a tela de jogo
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

async function entrar_usuario(nome, senha) {
    const settings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, senha }),
    };

    try {
        const response = await fetch('/auth/login', settings);
        
        if (!response.ok) {
            throw new Error('Erro ao entrar no sistema: ' + response.status);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        alert('Erro ao entrar no sistema: ' + err.message);
    }
}



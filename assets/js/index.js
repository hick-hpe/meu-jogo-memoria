const inputNome = document.querySelector('#nome');
const inputSenha = document.querySelector('#senha');
const btnCriar = document.querySelector('#btn-criar');
const btnEntrar = document.querySelector('#btn-entrar');
const showToastBtn = document.querySelector('#showToastBtn');
const btnTheme = document.querySelector('#toggle-theme');

btnCriar.addEventListener('click', criar_conta);
btnEntrar.addEventListener('click', entrar_conta);
btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    theme();
})

function theme() {
    if (btnTheme.classList.contains('btn-dark')) {
        btnTheme.classList.remove('btn-dark');
        btnTheme.classList.add('btn-light');
    } else {
        btnTheme.classList.remove('btn-light');
        btnTheme.classList.add('btn-dark');
    }

    const icon = btnTheme.querySelector('.bi');
    if (icon) {
        icon.classList.toggle('bi-moon-fill');
        icon.classList.toggle('bi-brightness-high-fill');
        icon.classList.toggle('text-light');
        icon.classList.toggle('text-dark');
    }
}
theme();

async function criar_conta(e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const senha = inputSenha.value.trim();

    if (nome === '' || senha === '') {
        mostrar_toast('erro', '⚠️ ERRO ⚠️ Preencha todos os campos!!!');
        return;
    }

    const data = await criar_usuario(nome, senha);

    if (data && data.username) {
        mostrar_toast('sucesso', '✅ SUCESSO ✅ Conta criada com sucesso!!!');
        setTimeout(() => window.location.href = '/salas', 3000);
    } else {
        mostrar_toast('erro', '⚠️ ERRO ⚠️ Erro ao criar conta! Nome de usuário pode estar em uso.');
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
            // throw new Error(`Erro ao cadastrar usuário: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (err) {
        // alert('Erro ao cadastrar usuário:' + err.message);
    }
}

async function entrar_conta(e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const senha = inputSenha.value.trim();

    if (nome === '' || senha === '') {
        mostrar_toast('erro', '⚠️ ERRO ⚠️ Preencha todos os campos!!!');
        return;
    }

    const data = await entrar_usuario(nome, senha);

    if (data && data.username) {
        mostrar_toast('sucesso', '✅ SUCESSO ✅ Login bem-sucedido!!!');
        setTimeout(() => window.location.href = '/salas', 3000);
    } else {
        mostrar_toast('erro', '⚠️ ERRO ⚠️ Usuário ou senha incorretos!!!');
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
            // throw new Error('Erro ao entrar no sistema: ' + response.status);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        // mostrar_toast
        // alert('Erro ao entrar no sistema: ' + err.message);
    }
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
        delay: 3000 // Exibe por 5 segundos
    });
    toastEl.show();
}

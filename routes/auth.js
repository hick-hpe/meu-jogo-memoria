// const bcrypt = require('bcrypt'); // Para hash de senhas
// const crypto = require('crypto');
const User = require('../models/User'); // Importa o modelo correto
const express = require('express');
const router = express.Router();

// const SALT_ROUNDS = 10; // Define a força da criptografia da senha

router.get('/', (req, res) => {
    // Cálculo do tempo restante
    const now = Date.now();  // Obtém a data e hora atual em milissegundos
    const createdAt = req.session.createdAt || now;  // Usa o timestamp de criação da sessão, ou o momento atual
    const maxAge = req.session.cookie.maxAge || 60000; // Define o tempo máximo de vida da sessão (60s por padrão)
    const expiresIn = Math.max(0, Math.floor((maxAge - (now - createdAt)) / 1000)); // Calcula o tempo restante em segundos
    console.log(`Rota Auth - ${expiresIn}(s) para finalizar a sessão...`);  // Envia a resposta com o tempo restante
    res.send(`Rota Auth - ${expiresIn}(s) para finalizar a sessão...`);  // Envia a resposta com o tempo restante
});

// Rota de login segura
router.post('/login', async (req, res) => {
    const { nome, senha } = req.body;

    try {
        const user = await User.findOne({ nome, senha });

        if (!user) {
            return res.status(401).json({ error: 'Nome de usuário ou senha inválidos' });
        }

        // // Comparar a senha fornecida com a senha criptografada armazenada
        // const senhaValida = await bcrypt.compare(senha, user.senha);
        // if (!senhaValida) {
        //     return res.status(401).json({ error: 'Nome de usuário ou senha inválidos' });
        // }

        // Bloquear login simultâneo
        // if (user.sessionToken) {
        //     return res.status(403).json({ error: 'Usuário já está logado em outro dispositivo' });
        // }

        // Criar um token único para a sessão
        // const sessionToken = crypto.randomBytes(32).toString('hex');

        // Armazena o token no banco de dados
        // user.sessionToken = sessionToken;
        await user.save();

        // Salva o token na sessão do Express
        // req.session.username = nome;
        req.session.userId = user._id;
        // req.session.sessionToken = sessionToken;

        return res.json({ message: 'Login bem-sucedido', username: nome });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro ao processar login' });
    }
});

// Rota para logout
router.get('/logout', async (req, res) => {
    try {
        // Destruir a sessão do usuário
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao tentar encerrar a sessão.' });
            }

            // Opcionalmente, você pode excluir o cookie da sessão
            res.clearCookie('connect.sid'); // Nome do cookie padrão da sessão (caso esteja usando express-session)

            // Responder com sucesso
            console.log('[LOGOUT] Sessão encerrada com sucesso!!');
            return res.redirect('/'); // Redireciona para a rota '/'
        });
    } catch (error) {
        console.error('Erro ao encerrar a sessão:', error);
        res.status(500).json({ error: 'Erro interno ao tentar encerrar a sessão.' });
    }
});


// Rota de registro de usuário com senha segura
router.post('/register', async (req, res) => {
    const { nome, senha } = req.body;

    try {
        const existingUser = await User.findOne({ nome });
        if (existingUser) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        // Criptografar senha antes de armazenar
        // const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        // const newUser = new User({ nome, senha: senhaHash });
        const newUser = new User({ nome, senha });
        await newUser.save();

        req.session.userId = newUser._id;
        return res.json({ message: 'Conta criada com sucesso', username: nome });
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        return res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

// Rota para recuperar nome de usuário
router.get('/me', async (req, res) => {
    try {
        // Obter o nome da sessão
        const userId = req.session.userId;
        // const user = await User.findOne({ _id: req.session.userId })
        // const nome = req.session.username;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Procurar o usuário no banco de dados
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Enviar o nome e o id do usuário
        res.json({ nome: user.nome, id: user._id });
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});


module.exports = router;

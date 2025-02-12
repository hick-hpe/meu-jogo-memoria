const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configuração do middleware para processar JSON
app.use(express.json());

// Configuração da sessão com MemoryStore
app.use(session({
    secret: 'minha-chave-secreta',
    resave: false,  
    saveUninitialized: false,
    cookie: { 
        maxAge: 60000,  // Sessão expira em 60 segundos
        httpOnly: true
    }
}));

// Rota de login (inicializa a sessão)
app.post('/login', (req, res) => {
    req.session.username = "usuarioTeste"; // Simula um login
    req.session.createdAt = Date.now(); // Marca o tempo de criação da sessão

    console.log(`[/login] Sessão criada: ${req.sessionID}`);
    res.json({ message: 'Sessão iniciada! Expira em 1 minuto.' });
});

// Rota para verificar se a sessão está ativa e mostrar tempo restante
app.get('/session', (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Sessão expirada ou não iniciada.' });
    }

    // Cálculo do tempo restante
    const now = Date.now();
    const createdAt = req.session.createdAt || now;
    const maxAge = req.session.cookie.maxAge || 60000; // 60s padrão
    const expiresIn = Math.max(0, Math.floor((maxAge - (now - createdAt)) / 1000)); // Converte para segundos

    console.log(`[/session] Sessão ativa (${req.sessionID}) - Restam ${expiresIn} segundos`);

    res.json({ 
        message: `Sessão ativa para ${req.session.username}`,
        expiresIn: `${expiresIn} segundos`
    });
});

// Rota de logout (destrói a sessão)
app.post('/logout', (req, res) => {
    console.log(`[/logout] Encerrando sessão: ${req.sessionID}`);
    
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Erro ao encerrar sessão' });

        res.json({ message: 'Sessão encerrada com sucesso!' });
    });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const templatesRoutes = require('./routes/templates');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db'); // Importa a função para conectar ao banco de dados
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const User = require('./models/User');
const Room = require('./models/room');
const crypto = require('crypto');

// Inicializa o Express
const app = express();
const httpServer = createServer(app);

// Middleware para processar JSON (corpo das requisições)
app.use(express.json());

// Middleware para processar arquivos estáticos
app.set('views engine', 'ejs');
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// Configura a conexão com o banco de dados
connectDB();

// Configuração do middleware para processar sessões
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'chave-secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD}@${process.env.CLUSTER}.bq0oj.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.CLUSTER}`,
        collectionName: 'sessions',
        autoRemove: 'interval',
        autoRemoveInterval: 1,
        ttl: 60 // Tempo de vida da sessão no MongoDB (30 minutos)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // Sessão expira em 30 minutos
    }
});
app.use(sessionMiddleware);

// Configuração do Socket.IO
const io = new Server(httpServer);
io.engine.use(sessionMiddleware);

// Recarregar sessões a cada 2 segundos (2 * 1000 ms)
const SESSION_RELOAD_INTERVAL = 60 * 1000;

// Armazena usuários conectados
const users = {};

// Game datas
let frutas = [
    'abacaxi', 'pera', 'uva',
    'apple', 'cereja', 'abacate',
    'melancia', 'morango', 'laranja',
    'pessego', 'mirtilos', 'kiwi', 'banana'
];
frutas = [...frutas, ...frutas].sort(() => Math.random() - 0.5);
let frutas_id = {};

// Cria um novo ID para cada fruta
frutas.forEach((fruta, i) => {
    console.log(i + ': ' + fruta);
    frutas_id[i] = fruta;
});
console.log('SIZE: ' + frutas.length);
console.log('SIZE: ' + Object.keys(frutas_id).length);


io.on("connection", async (socket) => {
    console.log('connection with SocketIO');
    const session = socket.request.session;
    const sessionId = session.id;
    console.log('--------------------------------------------------')
    console.log(`Novo cliente conectado - Sessão ID: ${sessionId}`);
    console.log('session');
    console.log(session);
    console.log('sessionId: ' + sessionId);

    try {
        const user = await User.findOne({ _id: session.userId }); // Corrigindo a busca do usuário

        // Adiciona o usuário ao objeto
        users[sessionId] = {
            id: sessionId,
            userId: session.userId,
            nome: user ? user.nome : "Desconhecido"
        };

        // Envia a lista atualizada para todos os clientes
        console.log('user conectados');
        console.log(JSON.stringify(users));
        io.emit("updateUsers", Object.values(users));

        // Cliente entra na sala correspondente ao ID da sessão
        socket.join(sessionId);

        console.log(`Usuário ${users[sessionId].nome} conectado.`);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
    }

    // Emite a lista atualizada para todos os clientes
    io.emit("updateUsers", Object.values(users));

    // Cliente entra na sala correspondente ao ID da sessão
    socket.join(sessionId);

    // Monitoramento da sessão e atualização periódica
    const req = socket.request;

    // Recarregar a sessão periodicamente para evitar expiração
    const timer = setInterval(() => {
        socket.request.session.reload((err) => {
            if (err) {
                console.warn(`Sessão ${sessionId} expirada ou inacessível. Desconectando cliente.`);
                socket.conn.close();
            }
            console.log('reloading session');
            console.log(socket.request.session);
        });
    }, SESSION_RELOAD_INTERVAL);

    socket.on('invite-ply', ({ userFrom, userTo }) => {
        console.log(`Enviando convite de ${userFrom.nome} para ${userTo.nome}`);
        io.to(userFrom.id).emit('invite-ply', { userFrom, userTo });
    });

    socket.on('cancel-invite', ({ userFrom, userTo }) => {
        console.log(`Cancelando convite de ${userFrom.nome} para ${userTo.nome}`);
        io.to(userTo.id).emit('cancel-invite');
    });

    socket.on('accept-invite', async ({ userFrom, userTo }) => {
        console.log(`Aceitando convite de ${userFrom.nome} para ${userTo.nome}`);

        // Criar uma sala protegida para os jogadores
        const jogador1 = await User.findOne({ nome: userFrom.nome });
        const jogador2 = await User.findOne({ nome: userTo.nome });

        if (!jogador1 || !jogador2) {
            return res.status(404).json({ error: "Um ou ambos os jogadores não foram encontrados." });
        }

        console.log('Criando sala...');
        const gameKey = crypto.createHash('sha256').update(jogador1.nome + jogador2.nome + Date.now()).digest('hex');
        console.log('gameKey: ' + gameKey);

        const newRoom = new Room({
            nome: gameKey,
            jogadores: [jogador1, jogador2]
        });

        await newRoom.save();

        // conectar ambos a sala 'gameKey'
        socket.join(gameKey);

        console.log('-------------  JOIN FAZIDO ----------------');
        io.in(gameKey).fetchSockets().then((sockets) => {
            console.log(`Usuários na sala ${gameKey}:`, sockets.map(s => s.id));
        });
        console.log('-------------------------------------');

        // Envia as notificações para ambos os clientes
        io.to(userFrom.id).emit('accept-invite', gameKey);
        io.to(userTo.id).emit('accept-invite', gameKey);
    });

    socket.on('get-info', async (gameKey) => {
        console.log('--- INICIANDO PARTIDA ---');
        const room = await Room.findOne({ nome: gameKey });

        if (!room) {
            throw new Error("Sala não encontrada.");
        }

        socket.join(gameKey);

        console.log('room');
        console.log(room.jogadores);
        const idJogador1 = room.jogadores[0];
        const idJogador2 = room.jogadores[1];
        const jogador1 = await User.findById(idJogador1);
        const jogador2 = await User.findById(idJogador2);
        console.log('jogador1: ' + jogador1.nome);
        console.log('jogador2: ' + jogador2.nome);

        const info = {
            jogador1: jogador1.nome,
            jogador2: jogador2.nome,
            frutas_id
        }
        io.to(sessionId).emit('get-info', info);
    });

    // ############################# GAME CONTROLLER #############################
    socket.on('click-in-card', ([cardId, gameKey]) => {
        console.log(`Jogador ${users[sessionId].nome} clicou na carta ${cardId}`);
        console.log('flip-card: ' + gameKey);
        console.log('-------------  ROOOM ----------------');
        io.in(gameKey).fetchSockets().then((sockets) => {
            console.log(`Usuários na sala ${gameKey}:`, sockets.map(s => s.id));
        });
        console.log('-------------------------------------');
        io.to(gameKey).emit('flip-card', { userId: users[sessionId].userId, cardId });
    });


    socket.on("disconnect", () => {
        console.log(`Cliente desconectado - Sessão ID: ${sessionId}`);
        clearInterval(timer);

        // Remove o usuário do objeto
        delete users[sessionId];

        // Atualiza a lista de usuários conectados
        io.emit("updateUsers", Object.values(users));
    });
});

// Usar as rotas
app.use('/', templatesRoutes); // Rota principal
app.use('/auth', authRoutes); // Rota principal
app.use('/api/users', userRoutes); // Rota de usuários
app.use('/api/rooms', roomRoutes); // Rota de salas

// app.use((req, res, next) => {
//     const error = new Error('Página não encontrada');
//     error.status = 404;
//     next(error);
// });

// Iniciar o servidor
httpServer.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando em http://localhost:3000');
});


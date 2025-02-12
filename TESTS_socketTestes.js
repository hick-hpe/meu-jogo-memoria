const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const session = require("express-session");

const port = process.env.PORT || 8080;
const app = express();
const httpServer = createServer(app);

console.log("Inicializando servidor...");

// Configuração da sessão
const sessionMiddleware = session({
    secret: "changeit",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 600000}
});

app.use(sessionMiddleware);
console.log("Middleware de sessão configurado.");

// Configuração do Socket.IO
const io = new Server(httpServer);
io.engine.use(sessionMiddleware);
console.log("Socket.IO configurado com suporte à sessão.");

// Rota principal
app.get("/", (req, res) => {
    console.log("Requisição recebida em '/'");
    res.sendFile(join(__dirname, "TESTS_index.html"));
});

app.get("/login", (req, res) => {
    console.log("Requisição recebida em '/'");
    res.sendFile(join(__dirname, "TESTS_login_successfully.html"));
});

// Rota para incrementar contagem na sessão
app.post("/incr", (req, res) => {
    const session = req.session;
    session.count = (session.count || 0) + 1;
    console.log(`Sessão ${session.id} - Contagem atualizada: ${session.count}`);

    res.status(200).send(session.count.toString());
    io.to(session.id).emit("current count", session.count);
    console.log('enviado: ' + session.count);
});

const SESSION_RELOAD_INTERVAL = 2 * 1000;

const users = {}; // Armazena usuários conectados

io.on("connection", (socket) => {
    const session = socket.request.session;
    const sessionId = session.id;
    console.log('--------------------------------------------------')
    console.log(`Novo cliente conectado - Sessão ID: ${sessionId}`);
    console.log('session');
    console.log(session);
    console.log('sessionId: ' + sessionId);

    // Adiciona o usuário ao objeto
    users[sessionId] = { id: sessionId };

    // Emite a lista atualizada para todos os clientes
    io.emit("updateUsers", Object.values(users));

    // Cliente entra na sala correspondente ao ID da sessão
    socket.join(sessionId);

    // Monitoramento da sessão e atualização periódica
    const req = socket.request;
    
    socket.on("yet-expires", () => {
        req.session.reload((err) => {
            if (err) {
                console.error("Erro ao recarregar sessão:", err);
                socket.emit("expires");
                return socket.disconnect();
            }
            req.session.count++;
            req.session.save();
            console.log(`Evento recebido: Sessão ${sessionId} - Contagem: ${req.session.count}`);
        });
    });

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

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado - Sessão ID: ${sessionId}`);
        clearInterval(timer);

        // Remove o usuário do objeto
        delete users[sessionId];

        // Atualiza a lista de usuários conectados
        io.emit("updateUsers", Object.values(users));
    });
});

// Logout e encerramento da sessão
app.post("/logout", (req, res) => {
    const sessionId = req.session.id;
    console.log(`Logout solicitado para sessão ${sessionId}`);

    req.session.destroy(() => {
        io.in(sessionId).disconnectSockets();
        console.log(`Sessão ${sessionId} encerrada e conexões Socket.IO desconectadas.`);
        res.status(204).end();
    });
});

httpServer.listen(port, () => {
    console.log(`Servidor rodando em: http://localhost:${port}`);
});

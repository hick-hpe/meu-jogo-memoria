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

const app = express(); // Inicializa o Express

// Middleware para processar JSON (corpo das requisições)
app.use(express.json());

// Middleware para processar arquivos estáticos
app.set('views', path.join(__dirname, 'views')); 
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configura a conexão com o banco de dados
connectDB();

// Configuração do middleware para processar sessões
app.use(session({
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
}));

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
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando em http://localhost:3000');
});


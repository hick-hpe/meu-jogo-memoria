const express = require('express');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../config/auth');

// Rota para o arquivo index.html
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

// Rota para o arquivo salas.html
router.get('/salas', authMiddleware, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/salas.html'));
});

// Rota para o arquivo game.html
router.get('/game/:key', authMiddleware, (req, res) => {
    console.log('ID Connected: ' + req.session.userId);
    res.sendFile(path.resolve(__dirname, '../views/game.html'));
});

// router.get('/game/:key/', authMiddleware, (req, res) => {
//     s
// });

module.exports = router;

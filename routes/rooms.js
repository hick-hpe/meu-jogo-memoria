const express = require('express');
const router = express.Router();
const Room = require('../controllers/roomController');

// Rota para criar uma nova sala
router.post('/', Room.createRoom);

// Rota para pegar todas as salas
router.get('/', Room.getRooms);

// Rota para atualizar uma sala
router.put('/:id', Room.updateRoom);

// Rota para deletar uma sala
router.delete('/:id', Room.deleteRoom);

module.exports = router;

const mongoose = require('mongoose');

// Definição do esquema da sala
const RoomSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
    },
    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    acertosJogador1: {
        type: Number,
        default: 0
    },
    acertosJogador2: {
        type: Number,
        default: 0
    }
});

// Criar o modelo baseado no esquema
const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;

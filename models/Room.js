const mongoose = require('mongoose');

// Definição do esquema da sala
const RoomSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
    },
    dono: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// Criar o modelo baseado no esquema
const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;

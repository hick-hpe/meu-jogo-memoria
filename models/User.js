const mongoose = require('mongoose');

// Definição do esquema do usuário
const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true, // O nome do usuário deve ser único
        trim: true,
    },
    senha: {
        type: String,
        required: true,
    },
    // sessionToken: { type: String, default: null }
});

// Criar o modelo baseado no esquema
const User = mongoose.model('User', UserSchema);

module.exports = User;

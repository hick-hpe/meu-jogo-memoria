const mongoose = require('mongoose');
const Room = require('../models/Room');

// Criar uma nova sala
exports.createRoom = async (req, res) => {
    try {
        console.log("Recebendo dados:", req.body);

        const { nome, dono, jogadores } = req.body;

        // Validação básica
        if (!nome || !dono) {
            return res.status(400).json({ message: "Nome e dono da sala são obrigatórios." });
        }

        // Converter dono para ObjectId (se necessário)
        const donoObjectId = new mongoose.Types.ObjectId(dono);

        // Validar jogadores (se existirem)
        const jogadoresObjectId = jogadores.map(id => new mongoose.Types.ObjectId(id));

        const novaSala = new Room({
            nome,
            dono: donoObjectId,
            jogadores: jogadoresObjectId
        });

        await novaSala.save();

        res.status(201).json(novaSala);
    } catch (error) {
        console.error("Erro ao criar sala:", error);
        res.status(500).json({ message: "Erro interno ao criar sala." });
    }
};

// Obter todas as salas
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).send(rooms);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Atualizar uma sala
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            return res.status(404).send();
        }
        res.status(200).send(room);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Deletar uma sala
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).send();
        }
        res.status(200).send(room);
    } catch (error) {
        res.status(500).send(error);
    }
};

const Room = require('../models/room');

// Criar uma nova sala
exports.createRoom = async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).send(room);
    } catch (error) {
        res.status(400).send(error);
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

const User = require('../models/User');

// Criar um novo usuário
exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Obter todos os usuários
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Obter um usuário pelo ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send(user);
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Atualizar um usuário
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send(user);
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Deletar um usuário
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send(user);
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

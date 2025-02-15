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
        const { nome } = req.body;
        const userId = req.params.id;

        // Verificar se já existe um usuário com esse nome (excluindo o próprio usuário)
        const existingUser = await User.findOne({ nome, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ error: "Já existe um usuário com esse nome!" });
        }

        // Atualizar o usuário
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado!" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: "Erro ao atualizar usuário!" });
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

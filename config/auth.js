const User = require('../models/User'); // Supondo que você tenha um modelo User

// Middleware para verificar se o usuário está autenticado
const authMiddleware = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            // return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
            console.log('[NOT SESSION USER] Sessão inválida. Faça login novamente.');
            return res.redirect('/'); // Redireciona para a rota '/'
        }

        // Verifica se o usuário existe no banco de dados
        const user = await User.findOne({ _id: req.session.userId });

        if (!user) {
            // return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
            console.log('[USER DOESN\'T EXISTS] Sessão inválida. Faça login novamente.');
            return res.redirect('/'); // Redireciona para a rota '/'
        }

        return next(); // Se o usuário for encontrado, permite o acesso à próxima rota
    } catch (error) {
        console.error('Erro ao validar sessão:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

module.exports = authMiddleware;

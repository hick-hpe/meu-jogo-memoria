const mongoose = require('mongoose');

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Configuração do banco de dados
const USER_DB = process.env.USER_DB;
const PASSWORD = process.env.PASSWORD;
const CLUSTER = process.env.CLUSTER;

// Verifique se as variáveis de ambiente estão corretamente definidas
if (!USER_DB || !PASSWORD || !CLUSTER) {
    console.error('[ERROR] As variáveis de ambiente USER_DB, PASSWORD ou CLUSTER não estão definidas!');
    process.exit(1); // Encerra o processo com erro se faltar alguma variável
}

// URL de conexão com o MongoDB usando as variáveis de ambiente
const URL_CONNCETION = `mongodb+srv://${USER_DB}:${PASSWORD}@${CLUSTER}.bq0oj.mongodb.net/?retryWrites=true&w=majority&appName=${CLUSTER}`;

// Função para conectar ao banco de dados
const connectDB = async () => {
    try {
        await mongoose.connect(URL_CONNCETION);
        console.log('[CONNECT_SUCCESSFULLY] MongoDB conectado com sucesso...');
    } catch (err) {
        console.error('[ERROR_CONNECTION] Falha na conexão com o MongoDB: ' + err.message);
        process.exit(1); // Encerra o processo se a conexão falhar
    }
};

module.exports = connectDB; // Exporta a função para ser usada em outros arquivos

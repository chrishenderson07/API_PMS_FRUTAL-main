require('dotenv').config();
const app = require('./src/config/server');
const porta = process.env.PORTA | 3000;

app.listen(porta, () => console.log('API Rodando na porta '+ porta))
const express = require('express')
const routes = express.Router()
const usuarioService = require('./src/services/usuarioService')

const UsuarioController = require('./src/controllers/UsuarioController')
const PmsController = require('./src/controllers/PmsController')
const usuarioController = new UsuarioController()
const pmsController = new PmsController()
const calc = require('./src/Pms/Calculos/calcBME')

const db = require('./src/Pms/db/funcsDb')
const steam = require('./src/Pms/Calculos/modulos/steamTables')

function timeoutMiddleware(req, res, next) {
	// Definindo o tempo limite em milissegundos (por exemplo, 30 segundos)
	const timeout = 60000

	// Configurando o timeout para a requisição
	req.setTimeout(timeout, () => {
		// Se a requisição exceder o tempo limite, retornar um erro de timeout
		const err = new Error('Timeout de requisição excedido')
		err.status = 408 // HTTP 408: Request Timeout
		next(err)
	})

	// Continuar com o próximo middleware
	next()
}

// routes.use(async(req, res, next) => {
//     const { authorization } = req.headers;
//     let autenticado = await usuarioService.validarAutenticacao(authorization)
//     if(!autenticado && req.originalUrl !== '/login'){
//         return res.status(401).json({
//             status: 401,
//             message: 'Usuário não autenticado',
//             name: 'NaoAutorizado'
//         })
//     }

//     next();
// });

// Rotas do Usuário
routes.post('/login', usuarioController.login)
routes.delete('/logout', usuarioController.logout)

routes.get('/usuarios/:id', usuarioController.obterPorId)
routes.post('/usuarios', usuarioController.cadastrar)
routes.put('/usuarios/:id', usuarioController.atualizar)

routes.get('/pms/:codigo', pmsController.obterPorCodigo)
routes.put('/pms/setValue', pmsController.setValue)
routes.put('/calcAll', pmsController.calcAll)
routes.put('/calcBME', calc.calcBME)
routes.get('/bme', calc.calcBME)

routes.get('/updateDb', db.updateDb)
routes.get('/updateDbValues', db.updateDbValues)
routes.get('/createDbEnum', db.createDbEnum)

routes.get('/getAll', timeoutMiddleware, pmsController.getAll)
routes.get('/getAllFromKey', pmsController.obterVarsFromKey)
// routes.get('/teste/:pressao', steam.Teste)
routes.get('/home', (req, res) => {
	res.send('Hello World!')
})

routes.get('/teste:id', pmsController.obterPorCodigo)

module.exports = routes

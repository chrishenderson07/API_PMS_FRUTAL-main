const pmsService = require('../services/pmsService')
const { NaoAutorizadoErro, ModeloInvalidoErro } = require('../erros/typeErros')
const PmsDTO = require('../dtos/PmsDTO')
const { ne } = require('sequelize/lib/operators')
const calcBME = require('../Pms/Calculos/calcBME')

class PmsController {
	async obterPorCodigo(req, res) {
		const { codigo } = req.params
		try {
			if (!codigo) {
				throw new ModeloInvalidoErro(
					400,
					'O Código é obrigatório para obter a variável',
				)
			}
			let psVar = await pmsService.obterPorCodigo(codigo)
			return res.json(psVar)
		} catch (error) {
			console.log(error)
		}
	}

	async setValue(req, res) {
		const { codigo, newValue } = req.body
		console.log('codigo: ' + codigo)
		try {
			if (!codigo) {
				throw new ModeloInvalidoErro(
					400,
					'O Código é obrigatório para alterar o valor',
				)
			}
			let pmsDTO = new PmsDTO(req.body)
			pmsDTO.valor = newValue
			let valorAtualizado = await pmsService.setValue(pmsDTO)
			return res.json(valorAtualizado)
		} catch (error) {
			console.log(error)
			return res.status(error.status).json(error)
		}
	}

	async calcAll(req, res) {
		await pmsService.calcAll()
	}

	async obterVars(req, res) {
		try {
			let variaveis = await pmsService.obterVars()
			return res.json(variaveis)
		} catch (error) {
			console.log(error)
			return res.status(error.status).json(error)
		}
	}

	async getAll(req, res) {
		try {
			await pmsService.calcAll()
			let variaveis = await pmsService.obterVars()
			return res.json(variaveis)
		} catch (error) {
			console.log(error)
			return res.status(error.status).json(error)
		}
	}

	async obterVarsFromKey(req, res) {
		try {
			let variaveis = await pmsService.obterVarsFromKey('perdaArt')
			return res.json(variaveis)
		} catch (error) {
			console.log(error)
			return res.status(error.status).json(error)
		}
	}

	// async cadastrar(req, res){
	//     try {
	//         let usuarioDTO = new UsuarioDTO(req.body);
	//         usuarioDTO.modeloValidoCadastro();
	//         let usuarioCadastrado = await usuarioService.cadastrar(usuarioDTO);
	//         return res.json(usuarioCadastrado);
	//     } catch (error){
	//         console.log(error);
	//         return res.status(error.status).json(error);
	//     }
	// }

	inativar(req, res) {}
}

module.exports = PmsController

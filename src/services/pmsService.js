const { Sequelize } = require('sequelize')
const PmsDTO = require('../dtos/PmsDTO')
const {
	NaoAutorizadoErro,
	NaoEncontradoErro,
	AplicacaoErro,
} = require('../erros/typeErros')
const Pms = require('../models/Pms')
const { calcBME } = require('../Pms/Calculos/calcBME')

async function obterPorCodigo(id) {
	let pmsVar = await Pms.findOne({ where: { id } })
	if (!pmsVar) {
		throw new NaoEncontradoErro(
			404,
			'Não foi possível encontrar a variável pelo ' + codigo,
		)
	}
	return pmsVar
}

async function getValue(codigo) {
	let pmsVar = await Pms.findOne({ where: { codigo } })
	if (!pmsVar) {
		throw new NaoEncontradoErro(
			404,
			'Não foi possível encontrar a variável pelo ' + codigo,
		)
	}
	return pmsVar.valor
}

async function setValue(pmsDTO) {
	let pmsVar = await Pms.findOne({ where: { codigo: pmsDTO.codigo } })
	if (!pmsVar) {
		throw new NaoEncontradoErro(
			404,
			'Não foi possível encontrar a variável pelo ' + codigo,
		)
	}
	pmsVar = await Pms.update(pmsDTO, { where: { codigo: pmsDTO.codigo } })

	if (!pmsVar || !pmsVar[0]) {
		throw new AplicacaoErro(
			500,
			'Falaha ao atualizar a variável com código ' + pmsVar.codigo,
		)
	}

	// calcbme.calcBME();

	return pmsDTO
}

async function obterVars() {
	let variaveis = await Pms.findAll()
	return variaveis.map((v) => new PmsDTO(v) || [])
}

async function obterVarsFromKey(key) {
	let variaveis = await Pms.findAll({
		where: { codigo: { [Sequelize.Op.iLike]: '%' + key + '%' } },
	})
	return variaveis.map((v) => new PmsDTO(v) || [])
}

async function calcAll() {
	await calcBME()
	console.log('calcBME')
}

// async function cadastrar(usuarioDTO){
//     usuarioDTO.senha = geradorToken.gerarHashDaSenha(usuarioDTO.senha);
//     let usuario = await Usuario.create(usuarioDTO);
//     if(!usuario){
//         throw new AplicacaoErro(500, 'Falaha ao cadastrar o usuario');
//     }
//     let dto = new UsuarioDTO(usuario);
//     dto.senha = undefined
//     dto.perfil = new PerfilDTO(await Perfil.findByPk(dto.idPerfil));
//     return dto;
// }

// function _criarCredencial(usuario){

//     let dataExpiracao = geradorToken.gerarDataExpiracao();

//     let credencial = UsuarioCache.obterCredencial(usuario);

//     if(credencial){
//         if(credencial.dataExpiracao < new Date()){
//             UsuarioCache.removerNoCache(credencial.token);
//         }else{
//             UsuarioCache.atualizarDataExpiracao(credencial.token, dataExpiracao);
//             return res.json(credencial)
//         }
//     }

//     let token = geradorToken.criarToken(usuario);
//     usuario.senha = undefined;

//     credencial = {token, usuario, dataExpiracao}
//     UsuarioCache.adicionarNoCache(credencial);
//     return credencial;
// }

module.exports = {
	obterPorCodigo,
	setValue,
	getValue,
	calcAll,
	obterVars,
	obterVarsFromKey,
}

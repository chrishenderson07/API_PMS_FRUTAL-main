const { NaoAutorizadoErro, NaoEncontradoErro, AplicacaoErro } = require('../erros/typeErros');
const Usuario = require('../models/Usuario')
const Perfil = require('../models/Perfil')
const geradorToken = require('../utils/geradorToken');
const UsuarioCache = require('../cache/usuarioCache');
const UsuarioDTO = require('../dtos/UsuarioDTO');
const PerfilDTO = require('../dtos/PerfilDTO');


async function validarUsuario(email, senha){
    //1. Saber se o usuario existe no banco de dados
    email = email.toString().toLowerCase();
    let usuario = await Usuario.findOne({where: { email }});
    // Gerar um hash da senha
    senha = geradorToken.gerarHashDaSenha(senha);

    if (!usuario || (usuario.senha !== senha)){
        throw new NaoAutorizadoErro(401, "Usuário ou senha Inválidos");
    }

    let credencial = _criarCredencial(usuario)

    return credencial;
    //2. Preciso saber se a senha que ele passou é a correta,
    // Se estiver errada, eu mando uma mensagem de usuário e senha inválidos
    //se correnta vou gerar um token, uma credencial e enviar para o usuario
}

async function logout(token){
    UsuarioCache.removerNoCache(token);
}

async function obterPorId(id){
    let usuario = await Usuario.findByPk(id);
    if(!usuario){
        throw new NaoEncontradoErro(404, "Não foi possível encontrar o usuário pelo id "+ id);
    }
    usuario.senha = undefined;

    let usuarioDTO = new UsuarioDTO(usuario);
    let perfil = await Perfil.findByPk(usuario.idPerfil);

    usuarioDTO.perfil = new PerfilDTO(perfil);

    return usuarioDTO;
}

async function validarAutenticacao(token){
    let credencial = UsuarioCache.obterCredencialPorToken(token);
    if(!credencial || credencial.dataExpiracao < new Date()){
        if(credencial){
            UsuarioCache.removerNoCache(credencial.token);
        }
        return false;
    }
    return true;
}

async function cadastrar(usuarioDTO){
    usuarioDTO.senha = geradorToken.gerarHashDaSenha(usuarioDTO.senha);
    let usuario = await Usuario.create(usuarioDTO);
    if(!usuario){
        throw new AplicacaoErro(500, 'Falaha ao cadastrar o usuario');
    }
    let dto = new UsuarioDTO(usuario);
    dto.senha = undefined
    dto.perfil = new PerfilDTO(await Perfil.findByPk(dto.idPerfil));
    return dto;
}

async function atualizar(usuarioDTO){
    let usuario = await Usuario.findByPk(usuarioDTO.id);
    if(!usuario){
        throw new NaoEncontradoErro(404, "Não foi possível encontrar o usuário pelo id "+ usuarioDTO.id);
    }
    usuarioDTO.senha = usuario.senha;
    usuario = await Usuario.update(usuarioDTO, 
        { where: { id: usuarioDTO.id }}
    );

    if(!usuario || !usuario[0]){
        throw new AplicacaoErro(500, 'Falaha ao atualizar usuario com id ' + usuarioDTO.id);
    }
    usuarioDTO.senha = undefined;
    return UsuarioDTO;
}

function _criarCredencial(usuario){

    let dataExpiracao = geradorToken.gerarDataExpiracao();

    let credencial = UsuarioCache.obterCredencial(usuario);

    if(credencial){
        if(credencial.dataExpiracao < new Date()){
            UsuarioCache.removerNoCache(credencial.token);
        }else{
            UsuarioCache.atualizarDataExpiracao(credencial.token, dataExpiracao);
            return res.json(credencial)
        }
    }

    let token = geradorToken.criarToken(usuario);
    usuario.senha = undefined;

    credencial = {token, usuario, dataExpiracao}
    UsuarioCache.adicionarNoCache(credencial);
    return credencial;
}

module.exports = {
    validarUsuario,
    logout,
    obterPorId,
    validarAutenticacao,
    cadastrar,
    atualizar
}
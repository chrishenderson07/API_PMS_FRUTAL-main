const ModeloInvalidoErro = class ModeloInvalidoErro{
    /**
     * Classe utilizada para exceções de modelos e dtos.
     * @param {Number} status 
     * @param {String} mensagem 
     */

    constructor(status, mensagem){
        this.status = status || 400;
        this.menssage = mensagem || 'O modelo informado é inválido';
        this.name = 'ModeloInvalido';
        this.stack = (new Error()).stack;
    }
}

const NaoAutorizadoErro = class NaoAutorizadoErro{
    /**
     * Classe utilizada para exceções de acessos ou recusros não autorizados.
     * @param {Number} status 
     * @param {String} mensagem 
     */

    constructor(status, mensagem){
        this.status = status || 403;
        this.menssage = mensagem || 'Recurso não autorizado';
        this.name = 'NaoAutorizado';
        this.stack = (new Error()).stack;
    }
}

const NaoEncontradoErro = class NaoEncontradoErro{
    /**
     * Classe utilizada para exceções de objetos recusros não encontrados.
     * @param {Number} status 
     * @param {String} mensagem 
     */

    constructor(status, mensagem){
        this.status = status || 404;
        this.menssage = mensagem || 'Não encontrado';
        this.name = 'NaoEncontrado';
        this.stack = (new Error()).stack;
    }
}

const AplicacaoErro = class AplicacaoErro{
    /**
     * Classe utilizada para exceções de modelos e dtos.
     * @param {Number} status 
     * @param {String} mensagem 
     */

    constructor(status, mensagem){
        this.status = status || 500;
        this.menssage = `Erro interno na aplicac'ão ${ mensagem && '- ' + mensagem}`;
        this.name = 'Aplicacao';
        this.stack = (new Error()).stack;
    }
}

module.exports = {
    ModeloInvalidoErro,
    NaoAutorizadoErro,
    NaoEncontradoErro,
    AplicacaoErro
}
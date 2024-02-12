module.exports = class PmsDTO{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.descricao = obj.descricao;
        this.codigo = obj.codigo;
        this.unidade = obj.unidade;
        this.valor = obj.valor;
        this.valorDefault = obj.valorDefault;
        this.limiteMax = obj.limiteMax;
        this.limiteMin = obj.limiteMin;
        this.input = obj.input;
        this.criadoEm = obj.criadoEm;
        this.atualizadoEm = obj.atualizadoEm;
    }
}


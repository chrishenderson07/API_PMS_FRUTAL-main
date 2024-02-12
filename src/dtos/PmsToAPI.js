module.exports = class PmsToAPI{
    constructor(obj){
        obj = obj || {};
        this.descricao = obj.desc;
        this.codigo = obj.cod;
        this.unidade = obj.unit;
        this.valor = obj.value;
        this.valorDefault = obj.value;
        this.input = obj.input === 1 ? true : false
    }
}
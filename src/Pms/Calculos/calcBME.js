const { Extracao } = require('./equipamentos/Extracao')
const { TratCaldoAcucar } = require('./equipamentos/tratCaldoAcucar')
const { TratCaldoEtanol } = require('./equipamentos/tratCaldoEtanol')
const { Cozimento_2M } = require('./equipamentos/Cozimento')
const { Fermentacao } = require('./equipamentos/Fermentacao')
const { Destilaria } = require('./equipamentos/Destilaria')
const { Evaporacao } = require('./equipamentos/Evaporacao')
const { BalancoHidrico } = require('./equipamentos/BalancoHidrico')
const { Vapor } = require('./equipamentos/Vapor')
const { ResumoProd, Receita } = require('./equipamentos/Producao')

async function calcBME(){
    let now = new Date()
    await Extracao()
    await TratCaldoAcucar()
    await TratCaldoEtanol()
    await Cozimento_2M()
    await Fermentacao()
    await Destilaria()
    await Evaporacao()
    await BalancoHidrico()

    await recalc()
    await recalc()

    await Extracao()
    await TratCaldoAcucar()
    await Vapor()
    await BalancoHidrico()
    await ResumoProd()
    await Receita()

    let after =  new Date()
    console.log(`Calculo BME: ` + (after - now)/1000)
}

module.exports = {
    calcBME,
}

async function recalc(){
    await TratCaldoAcucar()
    await TratCaldoEtanol()
    await Cozimento_2M()
    await Fermentacao()
    await Destilaria()
    await Evaporacao()
    await BalancoHidrico()
}




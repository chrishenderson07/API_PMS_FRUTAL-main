const db = require('./db.json');
const PmsDTO = require('../../dtos/PmsDTO');
const Pms = require('../../models/Pms');
const PmsToAPI = require('../../dtos/PmsToAPI');
const { Sequelize } = require('sequelize');

async function updateDb(){
    let now = new Date()
    
    for (const key in db){
        let item = new PmsToAPI(db[key]);
        let check = await isExist(item);
        if (!check){
            cadastrar(item);
        }else{
            console.log(`` + item.codigo +` já exite no banco de dados`)
        }
    }
    let after = new Date()
    console.log(`Update DB: ` + (after - now)/1000)
}

async function updateDbValues(){
    
    for (const key in db){
        let item = new PmsToAPI(db[key]);
        let check = await isExist(item);
        if (check){
            setValue(item.codigo, item.valor)
            setDefaultValue(item.codigo, item.valor)
        }
    }
    
}

async function getValue(codigo){
    let pmsVar = await Pms.findOne({where: { codigo }});
    let pmsDTO = new PmsDTO(pmsVar);
    let valor = pmsDTO.valor;
    return valor
}

async function getMax(codigo){
    let pmsVar = await Pms.findOne({where: { codigo }});
    let pmsDTO = new PmsDTO(pmsVar);
    let max = pmsDTO.limiteMax;
    if (!max){
        return 1000
    }else{
        return max
    }
}

async function getMin(codigo){
    let pmsVar = await Pms.findOne({where: { codigo }});
    let pmsDTO = new PmsDTO(pmsVar);
    let min = pmsDTO.limiteMin;
    if (!min){
        return 0
    }else{
        return min
    }
}

async function getDefault(codigo){
    let pmsVar = await Pms.findOne({where: { codigo }});
    let pmsDTO = new PmsDTO(pmsVar);
    let valor = pmsDTO.valorDefault;
    if (!valor){
        return 0
    }else{
        return valor
    }
}

async function isExist(pmsDTO){
    let pmsVar = await Pms.findOne({where: { codigo: pmsDTO.codigo }});
    if(pmsVar){
        return true
    }else{
        return false
    }
}

async function setValue(codigo, newValue){
    let pmsVar = await Pms.findOne({where: { codigo }});
    if (!pmsVar){
        throw console.log('codigo '+ codigo + ' esta indefinido')
    }
    let pmsDTO = new PmsDTO(pmsVar);
    pmsDTO.valor = !newValue ? await getDefault(codigo) : newValue
    pmsVar = await Pms.update(pmsDTO, { where: { codigo: pmsDTO.codigo }});
}

async function setDefaultValue(codigo, newValue){
    let pmsVar = await Pms.findOne({where: { codigo }});
    if (!pmsVar){
        throw console.log('codigo '+ codigo + ' esta indefinido')
    }
    let pmsDTO = new PmsDTO(pmsVar);
    pmsDTO.valorDefault = newValue 
    pmsVar = await Pms.update(pmsDTO, { where: { codigo: pmsDTO.codigo }});
}

async function cadastrar(pmsDTO){
    await Pms.create(pmsDTO);
    console.log(`Cadastro` + pmsDTO.codigo + ` cadastrado`)

    
}

function createDbEnum(){
    let str = ""
    for (const key in db){
        let item = new PmsToAPI(db[key]);
        let v = item.codigo + ": " + "value(\'" + item.codigo + "\'),\n";
        str = str + v
    }

    var fs = require('fs');
    var stream = fs.createWriteStream("/Users/eduardo_cp/downloads/my_file.txt");
    stream.once('open', function(fd) {
        stream.write(str);
        stream.end();
    });
    console.log(str)
    
}

async function obterVarsFromKey(key){
    let variaveis = await Pms.findAll({where: {codigo: {[Sequelize.Op.iLike]: '%' + key + '%'} }})
    return variaveis.map(v => new PmsDTO(v) || [])
}

async function getSumFromKey(key){
    let variaveis = await obterVarsFromKey(key);
    let sum = variaveis.reduce((total, variavel) => {
        return total + variavel.valor
    }, 0)
    return sum
}

String.prototype.value = async function(){
    let valor = await getValue(this)
    return valor
}

module.exports = {
    updateDb,
    createDbEnum,
    getValue,
    setValue,
    getSumFromKey,
    getMax,
    getMin,
    updateDbValues    
}
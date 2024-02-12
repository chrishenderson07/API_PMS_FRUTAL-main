const db = require('../../db/funcsDb');
const { setValue, getValue } = require('../../db/funcsDb')

async function FiltracaoLodo(){
    var flowEmbFiltroRot = 0
    var flowAguaLavRot = 0
    var flowEmbFiltroPre = 0
    var flowAguaLavPre = 0

    let prodTorta = await db.getValue('prodTorta');
    let perdaArtTorta = await db.getValue('perdaArtTorta');
    let flowCana = await db.getValue('flowCana');
    let artCana = await db.getValue('artCana');
    //let condTorta = db.embLodoFitroRot.value
    let flowTorta = prodTorta * flowCana / 1000
    let artMassaTorta = (flowCana * artCana/100) * perdaArtTorta / 100
    let artTorta = artMassaTorta * 100 / flowTorta
    db.setValue('flowTorta', flowTorta);
    db.setValue('artMassaTorta', artMassaTorta);
    db.setValue('artTorta', artTorta);

    let relFiltroPrensa = await db.getValue('relFiltroPrensa');
    let relFiltroRot = (1 - relFiltroPrensa/100)
    let relFiltroPre = relFiltroPrensa/100

    //ROTATIVO
    let embLodoFitroRot = await db.getValue('embLodoFitroRot');
    let flowLodo = await db.getValue('flowLodo');
    flowAguaLavRot = 0.0//db.flowAguaLavTelasFiltroRot.value
    let lodoRot = flowLodo * relFiltroRot
    flowEmbFiltroRot = lodoRot * embLodoFitroRot/100
    //PRENSA
    let embLodoFiltroPrensa = await db.getValue('embLodoFiltroPrensa');
    flowAguaLavPre = await db.getValue('flowAguaLavTelasFiltroPre');
    let lodoPre = flowLodo * relFiltroPre
    flowEmbFiltroPre = lodoPre * embLodoFiltroPrensa/100

    db.setValue('flowLodoFiltroRotativo', lodoRot);
    db.setValue('flowAguaEmbebicaoFiltroRot', flowEmbFiltroRot);
    db.setValue('flowLodoFiltroPrensa', lodoPre);
    db.setValue('flowAguaEmbebicaoFiltroPre', flowEmbFiltroPre);
    db.setValue('relFiltroRotativo', relFiltroRot*100);

    let artMassaLodoAcucar = await db.getValue('artMassaLodoAcucar');
    let artMassaLodoEtanol = await db.getValue('artMassaLodoEtanol');
    db.setValue('artMassaLodo', artMassaLodoAcucar + artMassaLodoEtanol);

    return {
        "flowEmbFiltroRot": flowEmbFiltroRot,
        "flowAguaLavRot": flowAguaLavRot,
        "flowEmbFiltroPre": flowEmbFiltroPre,
        "flowAguaLavPre": flowAguaLavPre
    }
}

async function Dosagem(){
    //CAL
    let grausB = await db.getValue('grausBaume'); 
    let dosCalAc = await db.getValue('dosagemCalAcucar'); 
    let dosCalEt = await db.getValue('dosagemCalEtanol'); 
    
    let concCal = 10.375 * grausB - 5.5793
    let flowAcucar = await db.getValue('flowAcucar'); 
    let flowAc = flowAcucar == 0 ? 65 : flowAcucar;
    let flowEtanolHid = await db.getValue('flowEtanolHid'); 
    let flowEt = flowEtanolHid == 0 ? 45 : flowEtanolHid;
    let consCalAc = flowAc * 20 * dosCalAc / 1000000
    let consCalEt = flowEt * dosCalEt / 1000
    
    let flowAguaLeiteCalAcucar = consCalAc/concCal * 1000
    let flowAguaLeiteCalEtanol = consCalEt/concCal * 1000
    let flowLeiteCalAcucar = flowAguaLeiteCalAcucar + consCalAc
    let flowLeiteCalEtanol = flowAguaLeiteCalEtanol + consCalEt

    setValue('concleiteCal', concCal);
    setValue('consCalAcucar', consCalAc);
    setValue('consCalEtanol', consCalEt);
    setValue('flowLeiteCalAcucar', flowLeiteCalAcucar);
    setValue('flowLeiteCalEtanol', flowLeiteCalEtanol);
    setValue('flowAguaLeiteCalAcucar', flowAguaLeiteCalAcucar);
    setValue('flowAguaLeiteCalEtanol', flowAguaLeiteCalEtanol);
    
    //POLIMERO
    let propPrep = await getValue('propPreparoPolimero');
    let propDosPolAcucar = await getValue('propDosagemPolAcucar');
    let propDosPolEtanol = await getValue('propDosagemPolEtanol');
    
    let flowCaldoAcucar = await getValue('flowCaldoAcucar');
    let flowCaldoEtanol = await getValue('flowCaldoEtanol');

    let consPolAcucar = flowCaldoAcucar * propDosPolAcucar / 1000
    let consPolEtanol = flowCaldoEtanol * propDosPolEtanol / 1000
    let consAguaPolAcucar = consPolAcucar / (propPrep/100)
    let consAguaPolEtanol = consPolEtanol / (propPrep/100)
    
    let flowCaldoDosAcucar = flowCaldoAcucar + flowAguaLeiteCalAcucar 
    let flowCaldoDosEtanol = flowCaldoEtanol + flowAguaLeiteCalEtanol 

    setValue('flowCaldoDosAcucar', flowCaldoDosAcucar);
    setValue('flowCaldoDosEtanol', flowCaldoDosEtanol);

    setValue('flowPolimeroAcucar', consPolAcucar);
    setValue('flowPolimeroEtanol', consPolEtanol);
    setValue('flowAguaPolimeroAcucar', consAguaPolAcucar);
    setValue('flowAguaPolimeroEtanol', consAguaPolEtanol);
    setValue('consAguaTratPrepPolimeto', consAguaPolAcucar + consAguaPolEtanol);
}

async function Decantacao(){
    let lodoAcucar = await getValue('lodoCaldoFlashAcucar');
    let lodoEtanol = await getValue('lodoCaldoFlashEtanol');
    let flowCaldoFlashAcucar = await getValue('flowCaldoFlashAcucar');
    let flowCaldoFlashEtanol = await getValue('flowCaldoFlashEtanol');
    let brixCaldoFlashAcucar = await getValue('brixCaldoFlashAcucar');
    let brixCaldoFlashEtanol = await getValue('brixCaldoFlashEtanol');
    let tempCaldoFlashAcucar = await getValue('tempCaldoFlashAcucar');
    let tempCaldoFlashEtanol = await getValue('tempCaldoFlashEtanol');
    let quedaTemp = await getValue('quedaTempDecantador');
        
    let flowLodoAcucar = flowCaldoFlashAcucar * lodoAcucar/100
    let brixLodoAcucar = brixCaldoFlashAcucar
    let flowLodoEtanol = flowCaldoFlashEtanol * lodoEtanol/100
    let brixLodoEtanol = brixCaldoFlashEtanol
    let flowCaldoClarifAcucar = flowCaldoFlashAcucar - flowLodoAcucar
    let tempCaldoClarAcucar = tempCaldoFlashAcucar - quedaTemp
    let flowCaldoClarifEtanol = flowCaldoFlashEtanol - flowLodoEtanol
    let tempCaldoClarEtanol = tempCaldoFlashEtanol - quedaTemp

    setValue('flowLodoAcucar', flowLodoAcucar);
    setValue('flowLodoEtanol', flowLodoEtanol);
    setValue('brixLodoAcucar', brixLodoAcucar);
    setValue('brixLodoEtanol', brixLodoEtanol);
    setValue('flowCaldoClarifAcucar', flowCaldoClarifAcucar);
    setValue('flowCaldoClarifEtanol', flowCaldoClarifEtanol);
    setValue('flowLodo', flowLodoAcucar + flowLodoEtanol);
    setValue('tempCaldoClarifAcucar', tempCaldoClarAcucar);
    setValue('tempCaldoClarifEtanol', tempCaldoClarEtanol);
}

module.exports = {
    FiltracaoLodo,
    Dosagem,
    Decantacao
}
const { setValue, getValue, getSumFromKey } = require('../../db/funcsDb');
const { pressaoAtm } = require('../utilities/constantes')
const { h_Tx, H_px, Tsat_p } = require('../modulos/steamTables')
const { Dosagem } = require('./tratCaldo')
const { AqCascoTuboVFL, AqCascoTuboVL } = require('./aquecimento')

module.exports = {
    TratCaldoEtanol,
    FlashEtanol,
}

async function TratCaldoEtanol(){
    let now = new Date()
    await RegCaldoEtanol()
    await CaldoDosadoEtanol()
    await CaldoAquecidoEtanol()
    await FlashEtanol()
    await CaldoClaroEtanol()
    
    let after =  new Date()
    console.log(`Calculo TratCaldoEtanol: ` + (after - now)/1000)
}

async function RegCaldoEtanol(){
    //REG CALDO X VINHACA
    let flowCaldoEtanol = await getValue('flowCaldoEtanol');
    let tempCaldoEtanol = await getValue('tempCaldoEtanol');
    let brixCaldoEtanol = await getValue('brixCaldoEtanol');

    //CALDO REG ETANOL
    setValue('flowCaldoRegEtanol', flowCaldoEtanol)
    setValue('brixCaldoRegEtanol', tempCaldoEtanol)
    setValue('tempCaldoRegEtanol', brixCaldoEtanol)
}

async function CaldoDosadoEtanol(){
    await Dosagem()

    let flowCaldoRegEtanol = await getValue('flowCaldoRegEtanol')
    let brixCaldoRegEtanol = await getValue('brixCaldoRegEtanol')
    let tempCaldoRegEtanol = await getValue('tempCaldoRegEtanol')

    let artMassaCaldoEtanol = await getValue('artMassaCaldoEtanol')
    let polMassaCaldoEtanol = await getValue('polMassaCaldoEtanol')
    let arMassaCaldoEtanol = await getValue('arMassaCaldoEtanol')
    let flowLeiteCalEtanol = await getValue('flowLeiteCalEtanol')

    let flow = flowCaldoRegEtanol + flowLeiteCalEtanol
    let brix = (flowCaldoRegEtanol * brixCaldoRegEtanol) / flow
    let temp = (tempCaldoRegEtanol * flowCaldoRegEtanol + flowLeiteCalEtanol * 30) / flow

    setValue('flowCaldoDosEtanol', flow)
    setValue('brixCaldoDosEtanol', brix)
    setValue('tempCaldoDosEtanol', temp)
    setValue('artMassaCaldoDosEtanol', artMassaCaldoEtanol)
    setValue('polMassaCaldoDosEtanol', polMassaCaldoEtanol)
    setValue('arMassaCaldoDosEtanol', arMassaCaldoEtanol)
}

async function CaldoAquecidoEtanol(){
    let flowCaldoDosEtanol = await getValue('flowCaldoDosEtanol')
    let brixCaldoDosEtanol = await getValue('brixCaldoDosEtanol')
    let tempCaldoDosEtanol = await getValue('tempCaldoDosEtanol')

    //AQUECIMENTO VAPOR FLASH
    let qtdeOpAqVFLEtanol = await getValue('qtdeOpAqVFLEtanol')
    let coefTrocaAqVFLEtanol = await getValue('coefTrocaAqVFLEtanol')
    let utilVFLEtanol = await getValue('utilVFLEtanol')
    let areaAqVFLEtanol = await getValue('areaAqVFLEtanol')
    let vzVFL = await getSumFromKey("flowVapFlash")

    let aqVFL = await AqCascoTuboVFL(flowCaldoDosEtanol, tempCaldoDosEtanol, brixCaldoDosEtanol, vzVFL, qtdeOpAqVFLEtanol, coefTrocaAqVFLEtanol, utilVFLEtanol, areaAqVFLEtanol)

    setValue('consVaporVFLAqEtanol', aqVFL.consVapor)
    setValue('utilAqVFLEtanol', aqVFL.util)
    setValue('tempOutAqVFLEtanol', aqVFL.tempOut)
    setValue('gerCondVGAqVFLEtanol', aqVFL.consVapor)


    //AQUECIMENTO VV2
    // let qtdeOpAqVV2Etanol = await getValue('qtdeOpAqVV2Etanol')
    // let coefTrocaAqVV2Etanol = await getValue('coefTrocaAqVV2Etanol')
    // let areaAqVV2Etanol = await getValue('areaAqVV2Etanol')
    // let tempOutAqVV2Etanol = await getValue('tempOutAqVV2Etanol')
    // let pressVV2 = await getValue('pressureVV2')

    // let aqVV2 = AqCascoTuboVL(flowCaldoDosEtanol, aqVFL.tempOut, tempOutAqVV2Etanol, tempCaldoDosEtanol, pressVV2, areaAqVV2Etanol, qtdeOpAqVV2Etanol, coefTrocaAqVV2Etanol)
    
    // setValue('consVaporVV2AqEtanol', aqVV2.consVapor)
    // setValue('utilAqVV2Etanol', aqVV2.util)
    // setValue('gerCondVGAqVV2Etanol', aqVV2.consVapor)

    //AQUECIMENTO VV1
    let qtdeOpAqVV1Etanol = await getValue('qtdeOpAqVV1Etanol')
    let coefTrocaAqVV1Etanol = await getValue('coefTrocaAqVV1Etanol')
    let areaAqVV1Etanol = await getValue('areaAqVV1Etanol')
    let tempOutAqVV1Etanol = await getValue('tempOutAqVV1Etanol')
    let pressVV1 = await getValue('pressureVV1')

    let aqVV1 = AqCascoTuboVL(flowCaldoDosEtanol, aqVFL.tempOut, tempOutAqVV1Etanol, brixCaldoDosEtanol, pressVV1, areaAqVV1Etanol, qtdeOpAqVV1Etanol, coefTrocaAqVV1Etanol)
    
    setValue('consVaporVV1AqEtanol', aqVV1.consVapor)
    setValue('utilAqVV1Etanol', aqVV1.util)
    setValue('gerCondVGAqVV1Etanol', aqVV1.consVapor)

    //CALDO AQUECIDO
    setValue('tempCaldoAquecEtanol', tempOutAqVV1Etanol)
    setValue('flowCaldoAquecEtanol', flowCaldoDosEtanol)
    setValue('brixCaldoAquecEtanol', brixCaldoDosEtanol)
}

async function FlashEtanol(){
    let pAtm = pressaoAtm
    let tempCaldoAquecEtanol = await getValue('tempCaldoAquecEtanol');
    let flowCaldoAquecEtanol = await getValue('flowCaldoAquecEtanol');
    let brixCaldoAquecEtanol = await getValue('brixCaldoAquecEtanol');

    let hc = await h_Tx(tempCaldoAquecEtanol, 0)
    let hfc = await H_px(pAtm, 0)
    let hfg = await H_px(pAtm, 1) - await H_px(pAtm, 0)
    let vz_vf = flowCaldoAquecEtanol * (hc - hfc)/hfg
    let flowVapFlash = vz_vf < 0.0 ? 0.0 : vz_vf
    
    let flowAguaPolimeroEtanol = await getValue('flowAguaPolimeroEtanol');
    
    let flowCaldoFlashEtanol = flowCaldoAquecEtanol - flowVapFlash + flowAguaPolimeroEtanol
    let brixCaldoFlashEtanol = flowCaldoAquecEtanol * brixCaldoAquecEtanol/flowCaldoFlashEtanol
    let tempCaldoFlashEtanol = (await Tsat_p(pAtm) * (flowCaldoAquecEtanol - flowVapFlash) + flowAguaPolimeroEtanol * 30)/flowCaldoFlashEtanol
    
    setValue('flowCaldoFlashEtanol', flowCaldoFlashEtanol);
    setValue('brixCaldoFlashEtanol', brixCaldoFlashEtanol);
    setValue('tempCaldoFlashEtanol', tempCaldoFlashEtanol);
    setValue('flowVapFlashEtanol', flowVapFlash);
}

async function CaldoClaroEtanol(){

    let brixCaldoFlashEtanol = await getValue('brixCaldoFlashEtanol')
    let flowCaldoDosEtanol = await getValue('flowCaldoDosEtanol')
    let brixCaldoDosEtanol = await getValue('brixCaldoDosEtanol')
    let lodoEtanol = await getValue('lodoCaldoFlashEtanol');
    let polMassaCaldoEtanol = await getValue('polMassaCaldoEtanol');
    let artMassaCaldoDosEtanol = await getValue('artMassaCaldoDosEtanol');
    let arMassaCaldoEtanol = await getValue('arMassaCaldoEtanol');
    let flowCaldoClarifEtanol = await getValue('flowCaldoClarifEtanol');

    let brix = brixCaldoFlashEtanol
    let brixMassa = flowCaldoDosEtanol * brixCaldoDosEtanol/100 * (1.0 - lodoEtanol / 100)
    let polMassa = polMassaCaldoEtanol * (1.0 - lodoEtanol / 100)
    let artMassa = artMassaCaldoDosEtanol * (1.0 - lodoEtanol / 100)
    let arMassa = arMassaCaldoEtanol* (1.0 - lodoEtanol / 100)
    let pol = polMassa * 100 / flowCaldoClarifEtanol
    let art = artMassa * 100 / flowCaldoClarifEtanol
    let ar = arMassa * 100 / flowCaldoClarifEtanol

    setValue('brixCaldoClarifEtanol', brix)
    setValue('brixMassaCaldoClarifEtanol', brixMassa)
    setValue('polMassaCaldoClarifEtanol', polMassa)
    setValue('artMassaCaldoClarifEtanol', artMassa)
    setValue('arMassaCaldoClarifEtanol', arMassa)
    setValue('polCaldoClarifEtanol', pol)
    setValue('artCaldoClarifEtanol', art)
    setValue('arCaldoClarifEtanol', ar)
    
    // //AQUECMENTO CALDO CLARIFICADO
    // let opVaporAqCCEtanol = await getValue('opVaporAqCCEtanol') //2.0
    // // setValue('opVaporAqCCEtanol', opVaporAqCCEtanol)
    // let tempCaldoClarifEtanol = await db.getValue('tempCaldoClarifEtanol')
    // let tempOutAqCCEtanol = await db.getValue('tempOutAqCCEtanol')
    // let areaAqCCEtanol = await db.getValue('areaAqCCEtanol')
    // let qtdeOpAqCCEtanol = await db.getValue('qtdeOpAqCCEtanol')
    // let coefTrocaAqCCEtanol = await db.getValue('coefTrocaAqCCEtanol')
    // let pressVP = 0
    // switch (opVaporAqCCEtanol){
    //     case 1.0: 
    //         pressVP = await getValue('pressureVV2') 
    //         break
    //     case 2.0: 
    //         pressVP = await getValue('pressureVV1') 
    //         break
    //     default:
    //         pressVP = await getValue('pressureVE')   
    // }
    // let aqCC = await AqCascoTuboVL(flowCaldoClarifEtanol, tempCaldoClarifEtanol, tempOutAqCCEtanol, brix, pressVP, areaAqCCEtanol, qtdeOpAqCCEtanol, coefTrocaAqCCEtanol)

    // setValue('utilAqCCEtanol', aqCC.util)

    // switch (opVaporAqCCEtanol){
    //     case 1.0: 
    //         setValue('consVaporVV2AqCCEtanol', aqCC.consVapor)
    //         setValue('gerCondVGAqCCEtanol', aqCC.consVapor)
    //         setValue('consVaporVV1AqCCEtanol', 0)
    //         setValue('consVaporVEAqCCEtanol', 0)
    //         setValue('gerCondVEAqCCEtanol', 0)
    //         break
    //     case 2.0: 
    //         setValue('consVaporVV1AqCCEtanol', aqCC.consVapor)
    //         setValue('gerCondVGAqCCEtanol', aqCC.consVapor)
    //         setValue('consVaporVV2AqCCEtanol', 0)
    //         setValue('consVaporVEAqCCEtanol', 0)
    //         setValue('gerCondVEAqCCEtanol', 0)
    //         break
    //     default:
    //         setValue('consVaporVEAqCCEtanol', aqCC.consVapor)
    //         setValue('gerCondVEAqCCEtanol', aqCC.consVapor)
    //         setValue('consVaporVV1AqCCEtanol', 0)
    //         setValue('consVaporVV2AqCCEtanol', 0)
    //         setValue('gerCondVGAqCCEtanol', 0)
    // }
    let tempCaldoClarifEtanol = await getValue('tempCaldoClarifEtanol')
    setValue('tempCaldoClarifAqEtanol', tempCaldoClarifEtanol)
}


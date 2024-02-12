const db = require('../../db/funcsDb');
const { setValue, getValue } = require('../../db/funcsDb');
const { pressaoAtm } = require('../utilities/constantes')
const { h_Tx, H_px, Tsat_p } = require('../modulos/steamTables')
const { RegenCaldoxVinhaca, RegenCaldoxCondensado } = require('./regeneracao')
const { getSumFromKey } = require('../../db/funcsDb')
const { Dosagem, Decantacao } = require('./tratCaldo')
const { AqCascoTuboVFL, AqCascoTuboVL } = require('./aquecimento')

module.exports = {
    TratCaldoAcucar,
    FlashAcucar
}

async function TratCaldoAcucar(){
    let now = new Date()
    await RegCaldoAcucar()
    await CaldoSulfitadoAcucar()
    await CaldoDosadoAcucar()
    await CaldoAquecidoAcucar()
    await FlashAcucar()
    await CaldoClaroAcucar()
    
    let after =  new Date()
    console.log(`Calculo TratCaldoAcucar: ` + (after - now)/1000)
}

async function RegCaldoAcucar(){
    //REG CALDO X VINHACA
    let flowCaldoAcucar = await getValue('flowCaldoAcucar');
    let tempCaldoAcucar = await getValue('tempCaldoAcucar');
    let brixCaldoAcucar = await getValue('brixCaldoAcucar');

    let flowVinhaca = await getValue('flowVinhaca');
    let tempVinhaca = await getValue('tempVinhaca');
    let tempVinhacaReg = await getValue('tempVinhacaReg');
    
    await RegenCaldoxVinhaca(flowCaldoAcucar, tempCaldoAcucar, brixCaldoAcucar, flowVinhaca, tempVinhaca, tempVinhacaReg)

    //REG CALDO X CONDENSADO
    let flowCondVGtoReg = await getSumFromKey('gerCondVG')
    setValue('flowCondVGtoReg', flowCondVGtoReg)
    
    let tempOutCaldoRegCaldoVinhaca = await getValue('tempOutCaldoRegCaldoVinhaca');
    let tempCondVG = await getValue('tempCondVG');
    let tempCondReg = await getValue('tempCondReg');

    await RegenCaldoxCondensado(flowCaldoAcucar, tempOutCaldoRegCaldoVinhaca, brixCaldoAcucar, flowCondVGtoReg, tempCondVG, tempCondReg, true)

    //CALDO REG ACUCAR
    let tempOutCaldoRegCaldoCond = await getValue('tempOutCaldoRegCaldoCond')
    setValue('flowCaldoRegAcucar', flowCaldoAcucar)
    setValue('brixCaldoRegAcucar', brixCaldoAcucar)
    setValue('tempCaldoRegAcucar', tempOutCaldoRegCaldoCond)
}

async function CaldoSulfitadoAcucar(){
    let flowCaldoRegAcucar = await getValue('flowCaldoRegAcucar')
    let brixCaldoRegAcucar = await getValue('brixCaldoRegAcucar')
    let tempCaldoRegAcucar = await getValue('tempCaldoRegAcucar')

    setValue('flowCaldoSulfAcucar', flowCaldoRegAcucar)
    setValue('brixCaldoSulfAcucar', brixCaldoRegAcucar)
    setValue('tempCaldoSulfAcucar', tempCaldoRegAcucar)
}

async function CaldoDosadoAcucar(){
    await Dosagem()

    let flowCaldoRegAcucar = await getValue('flowCaldoRegAcucar')
    let brixCaldoRegAcucar = await getValue('brixCaldoRegAcucar')
    let tempCaldoRegAcucar = await getValue('tempCaldoRegAcucar')

    let artMassaCaldoAcucar = await getValue('artMassaCaldoAcucar')
    let polMassaCaldoAcucar = await getValue('polMassaCaldoAcucar')
    let arMassaCaldoAcucar = await getValue('arMassaCaldoAcucar')
    let flowLeiteCalAcucar = await getValue('flowLeiteCalAcucar')

    flow = flowCaldoRegAcucar + flowLeiteCalAcucar
    brix = (flowCaldoRegAcucar * brixCaldoRegAcucar) / flow
    temp = (tempCaldoRegAcucar * flowCaldoRegAcucar + flowLeiteCalAcucar * 30) / flow

    setValue('flowCaldoDosAcucar', flow)
    setValue('brixCaldoDosAcucar', brix)
    setValue('tempCaldoDosAcucar', temp)
    setValue('artMassaCaldoDosAcucar', artMassaCaldoAcucar)
    setValue('polMassaCaldoDosAcucar', polMassaCaldoAcucar)
    setValue('arMassaCaldoDosAcucar', arMassaCaldoAcucar)
}

async function CaldoAquecidoAcucar(){
    let flowCaldoDosAcucar = await getValue('flowCaldoDosAcucar')
    let brixCaldoDosAcucar = await getValue('brixCaldoDosAcucar')
    let tempCaldoDosAcucar = await getValue('tempCaldoDosAcucar')

    //AQUECIMENTO VAPOR FLASH
    // let qtdeOpAqVFLAcucar = await getValue('qtdeOpAqVFLAcucar')
    // let coefTrocaAqVFLAcucar = await getValue('coefTrocaAqVFLAcucar')
    // let utilVFLAcucar = await getValue('utilVFLAcucar')
    // let areaAqVFLAcucar = await getValue('areaAqVFLAcucar')
    // let vzVFL = await getSumFromKey("flowVapFlash")

    // let aqVFL = await AqCascoTuboVFL(flowCaldoDosAcucar, tempCaldoDosAcucar, brixCaldoDosAcucar, vzVFL, qtdeOpAqVFLAcucar, coefTrocaAqVFLAcucar, utilVFLAcucar, areaAqVFLAcucar)

    // setValue('consVaporVFLAqAcucar', aqVFL.consVapor)
    // setValue('utilAqVFLAcucar', aqVFL.util)
    // setValue('tempOutAqVFLAcucar', aqVFL.tempOut)
    // setValue('gerCondVGAqVFLAcucar', aqVFL.consVapor)


    //AQUECIMENTO VV2
    let qtdeOpAqVV2Acucar = await getValue('qtdeOpAqVV2Acucar')
    let coefTrocaAqVV2Acucar = await getValue('coefTrocaAqVV2Acucar')
    let areaAqVV2Acucar = await getValue('areaAqVV2Acucar')
    let tempOutAqVV2Acucar = await getValue('tempOutAqVV2Acucar')
    let pressVV2 = await getValue('pressureVV2')

    let aqVV2 = AqCascoTuboVL(flowCaldoDosAcucar, tempCaldoDosAcucar, tempOutAqVV2Acucar, brixCaldoDosAcucar, pressVV2, areaAqVV2Acucar, qtdeOpAqVV2Acucar, coefTrocaAqVV2Acucar)
    
    setValue('consVaporVV2AqAcucar', aqVV2.consVapor)
    setValue('utilAqVV2Acucar', aqVV2.util)
    setValue('gerCondVGAqVV2Acucar', aqVV2.consVapor)

    //AQUECIMENTO VV1
    let qtdeOpAqVV1Acucar = await getValue('qtdeOpAqVV1Acucar')
    let coefTrocaAqVV1Acucar = await getValue('coefTrocaAqVV1Acucar')
    let areaAqVV1Acucar = await getValue('areaAqVV1Acucar')
    let tempOutAqVV1Acucar = await getValue('tempOutAqVV1Acucar')
    let pressVV1 = await getValue('pressureVV1')

    let aqVV1 = AqCascoTuboVL(flowCaldoDosAcucar, tempOutAqVV2Acucar, tempOutAqVV1Acucar, brixCaldoDosAcucar, pressVV1, areaAqVV1Acucar, qtdeOpAqVV1Acucar, coefTrocaAqVV1Acucar)
    
    setValue('consVaporVV1AqAcucar', aqVV1.consVapor)
    setValue('utilAqVV1Acucar', aqVV1.util)
    setValue('gerCondVGAqVV1Acucar', aqVV1.consVapor)

    //CALDO AQUECIDO
    setValue('tempCaldoAquecAcucar', tempOutAqVV1Acucar)
    setValue('flowCaldoAquecAcucar', flowCaldoDosAcucar)
    setValue('brixCaldoAquecAcucar', brixCaldoDosAcucar)
}

async function FlashAcucar(){
    let pAtm = pressaoAtm
    let tempCaldoAquecAcucar = await db.getValue('tempCaldoAquecAcucar');
    let flowCaldoAquecAcucar = await db.getValue('flowCaldoAquecAcucar');
    let brixCaldoAquecAcucar = await db.getValue('brixCaldoAquecAcucar');

    let hc = await h_Tx(tempCaldoAquecAcucar, 0)
    let hfc = await H_px(pAtm, 0)
    let hfg = await H_px(pAtm, 1) - await H_px(pAtm, 0)
    let vz_vf = flowCaldoAquecAcucar * (hc - hfc)/hfg
    let flowVapFlash = vz_vf < 0.0 ? 0.0 : vz_vf
    
    let flowAguaPolimeroAcucar = await db.getValue('flowAguaPolimeroAcucar');
    
    let flowCaldoFlashAcucar = flowCaldoAquecAcucar - flowVapFlash + flowAguaPolimeroAcucar
    let brixCaldoFlashAcucar = flowCaldoAquecAcucar * brixCaldoAquecAcucar/flowCaldoFlashAcucar
    let tempCaldoFlashAcucar = (await Tsat_p(pAtm) * (flowCaldoAquecAcucar - flowVapFlash) + flowAguaPolimeroAcucar * 30)/flowCaldoFlashAcucar
    
    db.setValue('flowCaldoFlashAcucar', flowCaldoFlashAcucar);
    db.setValue('brixCaldoFlashAcucar', brixCaldoFlashAcucar);
    db.setValue('tempCaldoFlashAcucar', tempCaldoFlashAcucar);
    db.setValue('flowVapFlashAcucar', flowVapFlash);
}

async function CaldoClaroAcucar(){
    await Decantacao()

    let brixCaldoFlashAcucar = await getValue('brixCaldoFlashAcucar')
    let flowCaldoDosAcucar = await getValue('flowCaldoDosAcucar')
    let brixCaldoDosAcucar = await getValue('brixCaldoDosAcucar')
    let lodoAcucar = await db.getValue('lodoCaldoFlashAcucar');
    let polMassaCaldoAcucar = await db.getValue('polMassaCaldoAcucar');
    let artMassaCaldoDosAcucar = await db.getValue('artMassaCaldoDosAcucar');
    let arMassaCaldoAcucar = await db.getValue('arMassaCaldoAcucar');
    let flowCaldoClarifAcucar = await db.getValue('flowCaldoClarifAcucar');

    let brix = brixCaldoFlashAcucar
    let brixMassa = flowCaldoDosAcucar * brixCaldoDosAcucar/100 * (1.0 - lodoAcucar / 100)
    let polMassa = polMassaCaldoAcucar * (1.0 - lodoAcucar / 100)
    let artMassa = artMassaCaldoDosAcucar * (1.0 - lodoAcucar / 100)
    let arMassa = arMassaCaldoAcucar* (1.0 - lodoAcucar / 100)
    let pol = polMassa * 100 / flowCaldoClarifAcucar
    let art = artMassa * 100 / flowCaldoClarifAcucar
    let ar = arMassa * 100 / flowCaldoClarifAcucar

    setValue('brixCaldoClarifAcucar', brix)
    setValue('brixMassaCaldoClarifAcucar', brixMassa)
    setValue('polMassaCaldoClarifAcucar', polMassa)
    setValue('artMassaCaldoClarifAcucar', artMassa)
    setValue('arMassaCaldoClarifAcucar', arMassa)
    setValue('polCaldoClarifAcucar', pol)
    setValue('artCaldoClarifAcucar', art)
    setValue('arCaldoClarifAcucar', ar)
    
    //AQUECMENTO CALDO CLARIFICADO
    let opVaporAqCCAcucar = await getValue('opVaporAqCCAcucar') //2.0
    // setValue('opVaporAqCCAcucar', opVaporAqCCAcucar)
    let tempCaldoClarifAcucar = await db.getValue('tempCaldoClarifAcucar')
    let tempOutAqCCAcucar = await db.getValue('tempOutAqCCAcucar')
    let areaAqCCAcucar = await db.getValue('areaAqCCAcucar')
    let qtdeOpAqCCAcucar = await db.getValue('qtdeOpAqCCAcucar')
    let coefTrocaAqCCAcucar = await db.getValue('coefTrocaAqCCAcucar')
    let pressVP = 0.0
    switch (opVaporAqCCAcucar){
        case 1.0: 
            pressVP = await getValue('pressureVV2') 
            break
        case 2.0: 
            pressVP = await getValue('pressureVV1') 
            break
        default:
            pressVP = await getValue('pressureVE')   
    }
    let aqCC = await AqCascoTuboVL(flowCaldoClarifAcucar, tempCaldoClarifAcucar, tempOutAqCCAcucar, brix, pressVP, areaAqCCAcucar, qtdeOpAqCCAcucar, coefTrocaAqCCAcucar)

    setValue('utilAqCCAcucar', aqCC.util)

    switch (opVaporAqCCAcucar){
        case 1.0: 
            setValue('consVaporVV2AqCCAcucar', aqCC.consVapor)
            setValue('gerCondVGAqCCAcucar', aqCC.consVapor)
            setValue('consVaporVV1AqCCAcucar', 0)
            setValue('consVaporVEAqCCAcucar', 0)
            setValue('gerCondVEAqCCAcucar', 0)
            break
        case 2.0: 
            setValue('consVaporVV1AqCCAcucar', aqCC.consVapor)
            setValue('gerCondVGAqCCAcucar', aqCC.consVapor)
            setValue('consVaporVV2AqCCAcucar', 0)
            setValue('consVaporVEAqCCAcucar', 0)
            setValue('gerCondVEAqCCAcucar', 0)
            break
        default:
            setValue('consVaporVEAqCCAcucar', aqCC.consVapor)
            setValue('gerCondVEAqCCAcucar', aqCC.consVapor)
            setValue('consVaporVV1AqCCAcucar', 0)
            setValue('consVaporVV2AqCCAcucar', 0)
            setValue('gerCondVGAqCCAcucar', 0)
    }
    setValue('tempCaldoClarifAqAcucar', tempOutAqCCAcucar)
}




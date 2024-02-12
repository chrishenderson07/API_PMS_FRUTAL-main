const { setValue, getValue } = require('../../db/funcsDb')
const { Tsat_p, H_px } = require('../modulos/steamTables')
const { getSumFromKey } = require('../../db/funcsDb')

module.exports = {
    Evaporacao
}

async function Evaporacao(){
    let now = new Date()

    let perdas = await getValue('perdasTermicaEvap')

    //PRE-EVAP ETANOL
    let flowCaldoClarifEtanol = await getValue('flowCaldoClarifEtanol')
    let brixCaldoClarifEtanol = await getValue('brixCaldoClarifEtanol')
    let tempCaldoClarifEtanol = await getValue('tempCaldoClarifEtanol')
    let artMAssaCaldoClarifEtanol = await getValue('artMAssaCaldoClarifEtanol')
    let brixSaidaPreEvapEtanol = await getValue('brixSaidaPreEvapEtanol')

    let desvioCaldoToPre = 0.0 //db.desvioCaldoToPreEvapEtanol.value
    let flowEntPreEt = desvioCaldoToPre/100 * flowCaldoClarifEtanol
    let flowAguaEvapPreEt = flowEntPreEt == 0 ? 0 : flowEntPreEt * (1 - flowCaldoClarifEtanol/brixSaidaPreEvapEtanol)
    let consVEPreEt = flowAguaEvapPreEt * (1+perdas/100)
    let flowVV1PreEt = flowAguaEvapPreEt
    let flowCaldoSaidaPreEt = flowEntPreEt - flowAguaEvapPreEt

    setValue('flowEntPreEvapEtanol', flowEntPreEt)
    setValue('flowSaidaPreEvapEtanol', flowCaldoSaidaPreEt)
    setValue('flowVV1PreEvapEtanol', flowVV1PreEt)
    setValue('consVaporVEPreEvapEtanol', consVEPreEt)

    let tempCaldoClarReg = await getValue('tempCaldoClarReg')
    let pressureVV1 = await getValue('pressureVV1')
    let tempVV1 = await Tsat_p(pressureVV1)

    let flowCaldoToFerm  = flowCaldoClarifEtanol - flowAguaEvapPreEt
    let brixCaldoToFerm = flowEntPreEt == 0 ? brixCaldoClarifEtanol : ((flowCaldoClarifEtanol - flowEntPreEt) * brixCaldoClarifEtanol + flowCaldoSaidaPreEt * brixSaidaPreEvapEtanol) / flowCaldoToFerm
    let tempCaldoToFerm = flowEntPreEt == 0 ? tempCaldoClarReg : ((flowCaldoClarifEtanol - flowEntPreEt) * tempCaldoClarifEtanol + flowCaldoSaidaPreEt * tempVV1) / flowCaldoToFerm
    let artMassaCaldoToFerm = artMAssaCaldoClarifEtanol

    setValue('flowCaldoToFerm', flowCaldoToFerm)
    setValue('brixCaldoToFerm', brixCaldoToFerm)
    setValue('tempCaldoToFerm', tempCaldoToFerm)
    setValue('artMassaCaldoToFerm', artMassaCaldoToFerm)

    let areaOpPreEvapEtanol = await getValue('areaOpPreEvapEtanol')
    setValue('tempCaldoSaidaPreEvapEtanol', tempVV1)
    setValue('taxaEvapPreEvapEtanol', areaOpPreEvapEtanol == 0 ? 0 : flowVV1PreEt/areaOpPreEvapEtanol * 1000)
    setValue('flowVV1PreEvapEtanol', flowVV1PreEt)

    //ACUCAR
    let sangriaVV1 = await getSumFromKey('consVaporVV1')
    let sangriaVV2 = await getSumFromKey('consVaporVV2')
    let sangriaVV3 = await getSumFromKey('consVaporVV3')

    let flowCaldoClarifAcucar = await getValue('flowCaldoClarifAcucar')
    let artMassaCaldoClarifAcucar = await getValue('artMassaCaldoClarifAcucar')
    let brixCaldoClarifAcucar = await getValue('brixCaldoClarifAcucar')
    let tempCaldoClarifAcucar = await getValue('tempCaldoClarifAcucar')

    let flowXarope = await getValue('flowXarope')
    let flowAguaEvap = flowCaldoClarifAcucar - flowXarope

    let flowVV5 = (flowAguaEvap - 3 * sangriaVV3 - 2 * sangriaVV2 - sangriaVV1 + flowVV1PreEt)/5
    let flowVV4 = flowVV5
    let flowVV3 = sangriaVV3 + flowVV5
    let flowVV2 = sangriaVV2 + sangriaVV3 + flowVV5
    let flowVV1 = sangriaVV1 + sangriaVV2 + sangriaVV3 + flowVV5 - flowVV1PreEt

    let pressureVV3 = await getValue('pressureVV3')
    let tempVV3 = await Tsat_p(pressureVV3)
    let sangriaCaldo3Ef = await getValue('flowSangriaCaldo3Ef')
    setValue('tempSangriaCaldo3Ef', tempVV3)

    let flowCaldo1Ef = flowCaldoClarifAcucar - flowVV1
    console.log(`Calculo flowCaldo1Ef ` + flowCaldo1Ef + ` ` + flowCaldoClarifAcucar + ` ` + flowVV1)
    let flowCaldo2Ef = flowCaldo1Ef - flowVV2
    let flowCaldo3Ef = flowCaldo2Ef - flowVV3 - sangriaCaldo3Ef
    var flowCaldo4Ef = flowCaldo3Ef - flowVV4

    let relSangriaCaldo = sangriaCaldo3Ef/(flowCaldo2Ef - flowVV3)
    let artMassaSaangriaCaldo = artMassaCaldoClarifAcucar * relSangriaCaldo
    setValue('massaArtSangriaCaldo3Ef', artMassaSaangriaCaldo)

    //CONS VE P AQUECIMENTO
    let cpCaldo = 1 - 0.006 * brixCaldoClarifAcucar
    let dT = 117.0 - tempCaldoClarifAcucar
    let pressureVE = await getValue('pressureVE')
    let hvVE = await H_px(pressureVE, 1)
    let hlVE = await H_px(pressureVE, 0)
    let calorLatenteVE = hvVE/4.18 - hlVE/4.18
    let consVEAquec = flowCaldoClarifAcucar * cpCaldo * dT / calorLatenteVE

    let consVaporVEEvapAcucar = flowVV1 * (1+perdas/100) + consVEAquec

    let brixCaldo1Ef = flowCaldoClarifAcucar * brixCaldoClarifAcucar/flowCaldo1Ef
    console.log(`Calculo brixCaldo1Ef ` + brixCaldo1Ef + ` ` + flowCaldoClarifAcucar + ` ` + brixCaldoClarifAcucar + ` ` + flowCaldo1Ef)
    let brixCaldo2Ef = flowCaldo1Ef * brixCaldo1Ef/flowCaldo2Ef
    let brixCaldo3Ef = flowCaldo2Ef * brixCaldo2Ef/(flowCaldo3Ef + sangriaCaldo3Ef)
    var brixCaldo4Ef = flowCaldo3Ef * brixCaldo3Ef/flowCaldo4Ef


    var gerCondVGEvapAcucar = flowVV3 + flowVV4 + flowVV5
    let gerCondVV1EvapAcucar = flowVV2 


    let areaOpPreEvapAc = await getValue('areaOpPreEvapAcucar')
    let areaOp2efEvapAc = await getValue('areaOp2EfEvapAcucar')
    let areaOp3efEvapAc = await getValue('areaOp3EfEvapAcucar')
    let areaOp4efEvapAc = await getValue('areaOp4EfEvapAcucar') 
    let areaOp5efEvapAc = await getValue('areaOp5EfEvapAcucar')

    var taxaEvapPrefAc = flowVV1/areaOpPreEvapAc * 1000
    var taxaEvap2EfAc = flowVV2/areaOp2efEvapAc * 1000
    var taxaEvap3EfAc = flowVV3/areaOp3efEvapAc * 1000
    var taxaEvap4EfAc = flowVV4/areaOp4efEvapAc * 1000
    var taxaEvap5EfAc = flowVV5/areaOp5efEvapAc * 1000

    let taxaMedia = (flowVV3 + flowVV4 + flowVV5) / (areaOp3efEvapAc + areaOp4efEvapAc + areaOp5efEvapAc) * 1000

    //XAROPE
    let brixXarope = await getValue('brixXarope')
    let purezaXarope = await getValue('purezaXarope')
    let polXarope = purezaXarope * brixXarope / 100
    let artMassaXarope = artMassaCaldoClarifAcucar - artMassaSaangriaCaldo
    flowXarope = (flowCaldoClarifAcucar * brixCaldoClarifAcucar - sangriaCaldo3Ef * brixCaldo3Ef) / brixXarope
    let artXarope = artMassaXarope * 100 / flowXarope
    let arXarope = artXarope - polXarope/0.95
    let polMassaXarope = polXarope/100 * flowXarope
    let arMassaXarope = arXarope/100 * flowXarope
    let densidadeXarope = 0.0168999 * Math.pow(brixXarope,2) + 3.95726 * brixXarope + 986.4844
    let brixMassaXarope = brixXarope/100 * flowXarope
    let pressureVV5 = await getValue('pressureVV5')
    let tempXarope = await Tsat_p(pressureVV5)

    setValue('polXarope', polXarope)
    setValue('artMassaXarope', artMassaXarope)
    setValue('flowXarope', flowXarope)
    setValue('artXarope', artXarope)
    setValue('arXarope', arXarope)
    setValue('polMassaXarope', polMassaXarope)
    setValue('arMassaXarope', arMassaXarope)
    setValue('densidadeXarope', densidadeXarope)
    setValue('brixMassaXarope', brixMassaXarope)
    setValue('tempXarope', tempXarope)

    //RECALC
    for (let i = 0; i <= 2; i++){
        flowXarope = ((flowCaldoClarifAcucar * brixCaldoClarifAcucar/100) - (sangriaCaldo3Ef * brixCaldo3Ef/100))*100/brixXarope
        let x  = (flowCaldo3Ef - flowXarope)/2
        flowVV4 = x
        flowVV5 = x
        brixCaldo4Ef = (flowCaldo3Ef * brixCaldo3Ef) / (flowCaldo3Ef - x)
        flowCaldo4Ef = flowCaldo3Ef * brixCaldo3Ef / brixCaldo4Ef
        gerCondVGEvapAcucar = flowVV3 + flowVV4 + flowVV5
        
        taxaEvapPrefAc = flowVV1/areaOpPreEvapAc * 1000
        taxaEvap2EfAc = flowVV2/areaOp2efEvapAc * 1000
        taxaEvap3EfAc = flowVV3/areaOp3efEvapAc * 1000
        taxaEvap4EfAc = flowVV4/areaOp4efEvapAc * 1000
        taxaEvap5EfAc = flowVV5/areaOp5efEvapAc * 1000
    }
    //FIM RECALC
    let desvioXaropeToEtanol = await getValue('desvioXaropeToEtanol')
    setValue('flowXaropeToFab', flowXarope - flowXarope * desvioXaropeToEtanol/100)
    setValue('flowXaropeToFerm', flowXarope * desvioXaropeToEtanol/100)

    let pressaoMultijato = await getValue('pressaoMultijatoEvap')
    let pressaoVV5 = (29.34 - pressaoMultijato) * 0.034

    setValue('flowAguaEvap', flowAguaEvap)

    setValue('sangriaVV1', sangriaVV1)
    setValue('sangriaVV2', sangriaVV2)
    setValue('sangriaVV3', sangriaVV3)

    setValue('flowVV5', flowVV5)
    setValue('flowVV4', flowVV4)
    setValue('flowVV3', flowVV3)
    setValue('flowVV2', flowVV2)
    setValue('flowVV1', flowVV1)

    setValue('flowCaldo1EfAc', flowCaldo1Ef)
    setValue('flowCaldo2Ef', flowCaldo2Ef)
    setValue('flowCaldo3Ef', flowCaldo3Ef)
    setValue('flowCaldo4Ef', flowCaldo4Ef)

    setValue('brixCaldo1EfAc', brixCaldo1Ef)
    setValue('brixCaldo2EfAc', brixCaldo2Ef)
    setValue('brixCaldo3EfAc', brixCaldo3Ef)
    setValue('brixCaldo4EfAc', brixCaldo4Ef)

    setValue('gerCondVEEvapAc', consVaporVEEvapAcucar + consVEPreEt)
    setValue('gerCondVGEvapAc', gerCondVGEvapAcucar)
    setValue('gerCondVG1EvapAc', gerCondVV1EvapAcucar)

    setValue('flowVaporVV12Efeito', flowVV1 - sangriaVV1)
    setValue('flowVaporVV23Efeito', flowVV2 - sangriaVV2)
    setValue('flowVaporVV34Efeito', flowVV3 - sangriaVV3)

    setValue('pressureVV5', pressaoVV5)

    setValue('taxaMediaEvapUltimosEf', taxaMedia)

    setValue('taxaEvapPreEvapAcucar', taxaEvapPrefAc)
    setValue('taxaEvap2EfEvapAcucar', taxaEvap2EfAc)
    setValue('taxaEvap3EfEvapAcucar', taxaEvap3EfAc)
    setValue('taxaEvap4EfEvapAcucar', taxaEvap4EfAc)
    setValue('taxaEvap5EfEvapAcucar', taxaEvap5EfAc)

    let after =  new Date()
    console.log(`Calculo Evaporacao: ` + (after - now)/1000)
    }
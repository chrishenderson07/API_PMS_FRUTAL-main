const { setValue, getValue } = require('../../db/funcsDb')
const { TorreDestilaria } = require('./TorresResfriamento')

module.exports = {
    Destilaria,
}

async function Destilaria(){
    let now = new Date()
    setValue('consEspVV1Anid', 0)
    setValue('flowVaporVEDestilaria', 0)
    
    //ConsEspVapor
    let consEspVaporDestManual = await getValue('consEspVaporDestManual')
    let consEspVaporDestilaria = await getValue('consEspVaporDestilaria')

    let glVinhoConsVapor = await getValue('glVinhoConsVapor')
    let concEtanolVinhoBruto = await getValue('concEtanolVinhoBruto')
    let glVinhoBoletim = await getValue('glVinhoBoletim')
    
    var consEspVapor = 0.0
    
    if (consEspVaporDestManual == 1){
        consEspVapor = consEspVaporDestilaria
    }else{
        consEspVapor  = glVinhoConsVapor == 0.0 ? concEtanolVinhoBruto * -0.2 + 4.1 : glVinhoBoletim * -0.2 + 4.1
    }
   
    
    //INPUTS
    let flowVolVinhoCent =  await getValue('flowVolVinhoCent')
    let concEtanolVinhoCent = concEtanolVinhoBruto
    let relEtanolSegProd = await getValue('relEtanolSegProd')
    let relOleoFuselProd = await getValue('relOleoFuselProd') 
    let relPerdaDegasProducao = await getValue('relPerdaDegasProducao')
    let consEspVaporColunaB = await getValue('consEspVaporColunaB')
    let concEtanolVinhaca = await getValue('concEtanolVinhaca')
    let concEtanolFlegmaca = await getValue('concEtanolFlegmaca')
    let concEtanolFlegma = await getValue('concEtanolFlegma')

    let consEspVaporColunaA = (consEspVapor - consEspVaporColunaB)
    setValue('consEspVaporColunaA', consEspVaporColunaA)
    setValue('consEspVaporColunaAFlegstil', consEspVapor)
    
    
    //CALCULOS COLUNA A
    let flowVolEtanolEntColA = flowVolVinhoCent * concEtanolVinhoCent/100
    let flowEtanolEntColA = flowVolEtanolEntColA * 0.79
    let flowEtanolSeg = relEtanolSegProd * flowVolEtanolEntColA * 0.83 / 100
    let flowFlegma = flowEtanolEntColA * 100 / (0.84 * concEtanolFlegma)
    var consVaporVV1ColA = flowVolEtanolEntColA * consEspVaporColunaA
    var flowVinhaca = flowVolVinhoCent - flowEtanolSeg - flowFlegma + consVaporVV1ColA
    let flowEtanolPerdVinhaca = flowVinhaca * concEtanolVinhaca * 0.79 / 100
    let flowEtanolPerdDegas = flowVolEtanolEntColA  * relPerdaDegasProducao / 100
    let prodEspVinhaca = flowVinhaca / flowVolEtanolEntColA
    
    setValue('flowVolEtanolEntColA', flowVolEtanolEntColA)
    setValue('flowEtanolEntColA', flowEtanolEntColA)
    setValue('flowEtanolSeg', flowEtanolSeg)
    setValue('flowFlegma', flowFlegma)
    setValue('consVaporVV1ColA', consVaporVV1ColA)
    
    setValue('flowEtanolPerdVinhaca', flowEtanolPerdVinhaca)
    setValue('flowEtanolPerdDegas', flowEtanolPerdDegas)
    setValue('prodEspVinhaca', prodEspVinhaca)
    
    //COLUNA A CONVENCIONAL
    let relEtanolHidConvencional = await getValue('relEtanolHidConvencional')
    
    //COLUNA A FLEGSTIL
    let relEtanolHidFlegstil = 100 - relEtanolHidConvencional
    setValue('relEtanolHidFlegstil', relEtanolHidFlegstil)
    let flowVolEtanolEntColAFleg = flowVolEtanolEntColA * relEtanolHidFlegstil/100
    
    
    //CALCULOS COLUNA B
    let flowEtanol = await getValue('flowEtanol')
    let flowVolEtanolEntColB = flowVolEtanolEntColA   - flowEtanolPerdVinhaca - flowEtanolPerdDegas - flowEtanolSeg - flowVolEtanolEntColAFleg
    
    let consVaporVV1ColB = flowEtanol * relEtanolHidConvencional/100 * consEspVaporColunaB
    let consVaporVEColB = 0.0
    
    let flowFlegmaca = flowFlegma + consVaporVV1ColB - flowVolEtanolEntColB - (relOleoFuselProd * flowEtanolEntColA/100)
    let flowEtanolPerdFlegmaca = flowFlegmaca * concEtanolFlegmaca * 0.79 / 100
    let proEspFlegmaca = flowFlegmaca  / flowVolEtanolEntColA
    
    setValue('flowVolEtanolEntColB', flowVolEtanolEntColB)
    setValue('consVaporVV1ColB', consVaporVV1ColB)
    setValue('consVaporVEColB', consVaporVEColB)
    setValue('flowFlegmaca', flowFlegmaca)
    setValue('flowEtanolPerdFlegmaca', flowEtanolPerdFlegmaca)
    setValue('proEspFlegmaca', proEspFlegmaca)
    setValue('flowVaporTotalColB', consVaporVV1ColB + consVaporVEColB)
    
    //CALCULOS EFICIENCIA
    let flowEtanolPerdTotal = flowEtanolPerdVinhaca + flowEtanolPerdDegas + flowEtanolPerdFlegmaca
    let flowEtanolProd100 = flowEtanolEntColA - flowEtanolPerdTotal
    let efDestilaria = flowEtanolProd100 * 100 / flowEtanolEntColA
    flowEtanol = flowEtanolProd100 / 0.9554 / 0.79
    let flowVolEtanolProd100 = flowEtanolProd100 / 0.79
    
    setValue('flowEtanolPerdTotal', flowEtanolPerdTotal)
    setValue('flowEtanolProd100', flowEtanolProd100)
    setValue('efDestilaria', efDestilaria)
    setValue('flowEtanol', flowEtanol)
    setValue('flowEtanolDia', flowEtanol * 24)
    setValue('flowVolEtanolProd100', flowVolEtanolProd100)
    
    //CONSUMO VAPOR
    //COL A
    let consEspVaporRepColunaA = await getValue('consEspVaporRepColunaA')
    consVaporVV1ColA = 0.0
    var flowVaporVEColAConv = 0.0
    var flowVaporVV1ColAConv = 0.0
    let vaporColAConv = await getValue('vaporColAConv')
    if (vaporColAConv == 0){
        flowVaporVV1ColAConv = flowEtanol * relEtanolHidConvencional/100 * consEspVaporColunaA + flowEtanol * consEspVaporRepColunaA
    }else{
        flowVaporVEColAConv = flowEtanol * relEtanolHidConvencional/100 * consEspVaporColunaA + flowEtanol * consEspVaporRepColunaA
    }
    setValue('flowVaporVV1ColAConv', flowVaporVV1ColAConv)
    setValue('flowVaporVEColAConv', flowVaporVEColAConv)
    
    //FLEGSTILL
    var flowVaporVEColAFleg = 0.0
    var flowVaporVV1ColAFleg = 0.0
    
    let vaporColAFleg = await getValue('vaporColAFleg')
    if (vaporColAFleg == 0){
        flowVaporVV1ColAFleg = flowEtanol * (100-relEtanolHidConvencional)/100 * consEspVapor
    }else{
        flowVaporVEColAFleg = flowEtanol * (100-relEtanolHidConvencional)/100 * consEspVapor
    }
    setValue('flowVaporVV1ColAFleg', flowVaporVV1ColAFleg)
    setValue('flowVaporVEColAFleg', flowVaporVEColAFleg)
    
    //RESULTANTE COL A
    setValue('consVaporVV1ColA', flowVaporVV1ColAConv + flowVaporVV1ColAFleg)
    setValue('consVaporVEColA', flowVaporVEColAConv + flowVaporVEColAFleg)
    setValue('flowVaporTotalColA', flowVaporVV1ColAConv + flowVaporVV1ColAFleg + flowVaporVEColAConv + flowVaporVEColAFleg)

    let taxaAquecIndConv = await getValue('taxaAquecIndConv')
    let isAquecIndConv = await getValue('isAquecIndConv')
    if (isAquecIndConv == 0.0){
        setValue('taxaAquecIndConv', 0.0)
    }
    
    let taxaAquecIndFleg = await getValue('taxaAquecIndFleg')
    let isAquecIndFleg = await getValue('isAquecIndFleg')
    if (isAquecIndFleg == 0.0){
        setValue('taxaAquecIndFleg', 0.0)
    }
    
    let flowVaporVV1IndColA = flowVaporVV1ColAConv * taxaAquecIndConv/100 + flowVaporVV1ColAFleg * taxaAquecIndFleg/100
    let flowVaporVV1DirColA = flowVaporVV1ColAConv * (100 - taxaAquecIndConv)/100 + flowVaporVV1ColAFleg * (100 - taxaAquecIndFleg)/100
    let flowVaporVEIndColA = flowVaporVEColAConv * taxaAquecIndConv/100 + flowVaporVEColAFleg * taxaAquecIndFleg/100
    let flowVaporVEDirColA = flowVaporVEColAConv * (100 - taxaAquecIndConv)/100 + flowVaporVEColAFleg * (100 - taxaAquecIndFleg)/100
    
    setValue('flowVaporVV1IndColA', flowVaporVV1IndColA)
    setValue('flowVaporVV1DirColA', flowVaporVV1DirColA)
    setValue('flowVaporVEIndColA', flowVaporVEIndColA)
    setValue('flowVaporVEDirColA', flowVaporVEDirColA)
    
    //DESIDRATACAO
    let flowEtanolAnidroDia = await getValue('flowEtanolAnidroDia')
    var prodAnidro = flowEtanolAnidroDia / 24

    var mixAnidro = 0.0
    
    var flowEtanolHidToAnidro = prodAnidro * 0.9953 / 0.9554
    var flowEtanolProdToHid = flowEtanol - flowEtanolHidToAnidro
    var flowEtanolTanqueToDesid = 0.0
    var prodHid =  0.0
    
    let repAnidro = await getValue('repAnidro')
    if (flowEtanolHidToAnidro > flowEtanol && repAnidro == 1){
        flowEtanolTanqueToDesid = flowEtanolHidToAnidro - flowEtanol
        flowEtanolProdToHid = 0.0
        prodHid = -flowEtanolTanqueToDesid
        mixAnidro = 100.0
    }else if (flowEtanolHidToAnidro > flowEtanol && repAnidro == 0){
        flowEtanolTanqueToDesid = 0.0
        prodAnidro = flowEtanol * 0.9554 / 0.9953
        flowEtanolProdToHid = 0.0
        flowEtanolHidToAnidro = flowEtanol
        mixAnidro = 100.0
    }else{
        prodHid = flowEtanol - flowEtanolHidToAnidro
        mixAnidro = (prodAnidro - flowEtanolTanqueToDesid * 0.9554 / 0.9953) / (flowEtanolProd100 / 0.79) * 100 * 0.9953
    }
    let flowEtanolProdToDes = flowEtanol - flowEtanolProdToHid
    
     //+ flowRepEtanol
    let consEspV22Anidro = await getValue('consEspV22Anidro')
    let consEspVEAnid = await getValue('consEspVEAnid')
    let consVaporVEDesidratacao = prodAnidro * consEspVEAnid
    let consVaporV10Desidratacao = prodAnidro * consEspV22Anidro
    let consEspVV1Anid = await getValue('consEspVV1Anid')
    setValue('consVaporVV1Desid', prodAnidro * consEspVV1Anid)
    
    setValue('flowEtanolAnidro', prodAnidro)
    setValue('flowEtanolHid', prodHid)
    setValue('flowEtanolProdToDesid', flowEtanolProdToDes)
    setValue('flowEtanolProdToHid', flowEtanolProdToHid)
    setValue('consVaporVEDesidratacao', consVaporVEDesidratacao)
    setValue('consVaporV10Desidratacao', consVaporV10Desidratacao)
    setValue('flowEtanolHidDia', prodHid * 24)
    setValue('flowEtanolAnidroDia', prodAnidro * 24)
    setValue('flowVolEtanolProd100Dia', flowVolEtanolProd100 * 24)
    setValue('flowEtanolHidAnidro', prodHid * 24 + prodAnidro * 24)
    setValue('mixEtanolAnidro', mixAnidro)
    setValue('flowEtanolTanqueToDesid', flowEtanolTanqueToDesid)
    setValue('flowEtanolTanqueToDesidDia', flowEtanolTanqueToDesid * 24)
    
    //TORRE DESTILARIA
    await TorreDestilaria()
    
    //RETORNO CONDENSADO
    let flowRetCondDest = consVaporVEDesidratacao  + flowVaporVV1IndColA + flowVaporVEIndColA //+  consVaporV10Desidratacao
    let flowRetCondColA = flowVaporVV1IndColA + flowVaporVEIndColA
    setValue('gerCDVGDestilaria', flowRetCondDest)
    setValue('flowRetCondColA', flowRetCondColA)
    
    flowVinhaca = flowVinhaca - flowRetCondColA
    flowVinhaca = !flowVinhaca ? 200.0 : flowVinhaca
    setValue('flowVinhaca', flowVinhaca)
    
    //LEVEDURA SECA
    let flowLeveduraTerceiros = await getValue('flowLeveduraTerceiros')
    let relMassaSecaTerceiros = await getValue('relMassaSecaTerceiros')
    let efLeveduraTerceiros = await getValue('efLeveduraTerceiros')
    let flowLevSecaTerceiros = flowLeveduraTerceiros * efLeveduraTerceiros/100 * relMassaSecaTerceiros/100

    let rendCelula = await getValue('rendCelula')
    let flowLevSecaTotal = (prodHid  + prodAnidro ) * rendCelula/1000 + flowLevSecaTerceiros
    setValue('flowLeveduraSeca', flowLevSecaTotal)
    setValue('flowLeveduraSecaDia', flowLevSecaTotal * 24)
    setValue('flowLevSecaTerceiros', flowLevSecaTerceiros)

    let after =  new Date()
    console.log(`Calculo Destilaria: ` + (after - now)/1000)
}
const { setValue, getValue } = require('../../db/funcsDb')
const { TorresDestilaria, TorreMancais, TorreVinhaca } = require('./TorresResfriamento')
const { getSumFromKey } = require('../../db/funcsDb')
const { hL_T, hV_T } = require('../modulos/steamTables')

module.exports = {
    BalancoHidrico
}

async function BalancoHidrico(){
    let now = new Date()

    let gerCDVGAqVFLAcucar = await getValue('gerCondVGAqVFLAcucar') 
    let gerCDVGAqVV3Acucar = await getValue('gerCondVGAqVV3Acucar')
    let gerCDVGAqVV2Acucar = await getValue('gerCondVGAqVV2Acucar')
    let gerCDVGAqVV1Acucar = await getValue('gerCondVGAqVV1Acucar')
    setValue('flowCDVGAqAcucar', gerCDVGAqVFLAcucar + gerCDVGAqVV3Acucar + gerCDVGAqVV2Acucar + gerCDVGAqVV1Acucar)
    
    let gerCDVGAqVV2Etanol = await getValue('gerCondVGAqVV2Etanol')
    let gerCDVGAqVV1Etanol = await getValue('gerCondVGAqVV1Etanol')
    setValue('flowCDVGAqEtanol', gerCDVGAqVV2Etanol + gerCDVGAqVV1Etanol)
    
    let gerCDVG1EvapAcucar = await getValue('gerCondVG1EvapAc')
    let flowCDVGtoTqCaldeira = gerCDVG1EvapAcucar //+ gerCDVGDestilaria - consCDVGFabrica
    let consCondVGDesaerador = await getValue('consCondVGDesaerador')
    let flowSobraCDVGTqCaldeira = flowCDVGtoTqCaldeira - consCondVGDesaerador
    setValue('flowCDVGtoTqCaldeira', flowCDVGtoTqCaldeira)
    setValue('flowSobraCDVGTqCaldeira', flowSobraCDVGTqCaldeira)
    
    //TORRES
    await TorresDestilaria()
    await TorreMancais()
    await TorreVinhaca()
    setValue('flowPerdasTorreCond', 0.0)
    //await TorreCDVG()
    
    //CONSUMO COND CONTAMINADO VV1
    let flowCondVegetal = await getValue('flowCondVegetal') 
    let flowPerdasTorreCond = await getValue('flowPerdasTorreCond') 
    let flowAguaEmbebicaoFiltroRot = await getValue('flowAguaEmbebicaoFiltroRot') 
    let flowAguaEmbebicaoFiltroPre = await getValue('flowAguaEmbebicaoFiltroPre') 
    let flowAguaLavTelasFiltroPre = await getValue('flowAguaLavTelasFiltroPre') 
    let flowAguaLeiteCalAcucar = await getValue('flowAguaLeiteCalAcucar') 

    let flowCondCont = flowSobraCDVGTqCaldeira + flowCondVegetal - flowPerdasTorreCond
    setValue('flowCondContaminado', flowCondCont)
    let consCondContFiltroLodo = flowAguaEmbebicaoFiltroRot + flowAguaEmbebicaoFiltroPre + flowAguaLavTelasFiltroPre
    setValue('consCondContFiltroLodo', consCondContFiltroLodo)
    setValue('consCondContPrepLeiteCal', flowAguaLeiteCalAcucar)


    let flowEmb = await getValue('flowEmbeb')
    setValue('consCondContEmbebicao', 0.0)
    let consCDVGFabrica = await getValue('consCDVGFabrica')
    let consCondCont = await getSumFromKey("consCondCont")
    var sobraCondCont = flowCondCont - consCondCont - consCDVGFabrica
    let tempCaixaCond = await getValue('tempCaixaCondProcesso') 
    let tempEmb = await getValue('tempEmbeb')
    
    var condToEmb = (tempEmb - 27) * flowEmb / (tempCaixaCond - 27)
    if (condToEmb > sobraCondCont){
       condToEmb = sobraCondCont
    }
    if (condToEmb > flowEmb){
        condToEmb = flowEmb
    }

    setValue('consCondContEmbebicao', condToEmb)
    let flowAguaBrutaToEmb = flowEmb - condToEmb
    setValue('consAguaBrutaEmb', flowAguaBrutaToEmb)
    consCondCont = await getSumFromKey("consCondCont")
    sobraCondCont = flowCondCont - consCondCont - consCDVGFabrica
    
    //AGUA TRATADA
    let consAguaTrat = await getSumFromKey("consAguaTrat")
    setValue('consAguaBrutaETA', consAguaTrat)
    
    //AGUA BRUTA
    let consAguaBruta = await getSumFromKey("consAguaBruta")
    setValue('flowAguaBrutaTotal', consAguaBruta)
    
    //AGUA RESIDUARIA
    let consCondContUsoGeral = await getValue("consCondContUsoGeral")
    let consAguaTratGeral = await getValue("consAguaTratGeral")
    let consAguaBrutaGeral = await getValue("consAguaBrutaGeral")
    setValue('gerAguaResUsoGeralCDCont', consCondContUsoGeral)
    setValue('gerAguaResUsoGeral', consAguaTratGeral)
    setValue('gerAguaResUsoGeralAguaBruta', consAguaBrutaGeral)
//    db.gerAguaResAbrandador.setValue(db.consAguaTratGeral.value)
//    db.gerAguaResETA.setValue(db.consAguaTratGeral.value)
    setValue('gerAguaResSobraCondCont', sobraCondCont)
    
    let consCondDesCaldeirasVA = await getValue("consCondDesCaldeirasVA")
    let gerVaporVACaldeiras = await getValue("gerVaporVACaldeiras")
    let consCondDesCaldeirasVM = await getValue("consCondDesCaldeirasVM")
    let gerVaporVMCaldeiras = await getValue("gerVaporVMCaldeiras")
    let gerAguaResDescCald =  (consCondDesCaldeirasVA - gerVaporVACaldeiras) + (consCondDesCaldeirasVM - gerVaporVMCaldeiras) //db.consCondVECaldeira1.value - db.gerVaporV22Caldeira1.value
    let flowFlegmaca = await getValue("flowFlegmaca")
    let consAguaTratLimpEvap = await getValue("consAguaTratLimpEvap")
    
    setValue('gerAguaResDescCaldeira', gerAguaResDescCald)
    setValue('gerAguaResFlegmaca', flowFlegmaca)
    setValue('gerAguaResLimpEvap', consAguaTratLimpEvap)
    setValue('gerAguaResFiltroLodo', flowAguaLavTelasFiltroPre)

    let flowAguaResToLavoura = await getSumFromKey("gerAguaRes") - await getSumFromKey("consAguaRes")
    setValue('flowAguaResParaLavoura', flowAguaResToLavoura)
    let flowVinhacaFria = await getValue('flowVinhacaFria')
    setValue('flowTotalToLavoura', flowAguaResToLavoura + flowVinhacaFria)
    
    await SistemaFuligem()
    
    //revisar variaveis
    // setValue('gerVaporV22Caldeira1', db.gerVaporVACaldeiras.value + db.gerVaporVMCaldeiras.value)
    // setValue('consBagacoCaldeira1', db.consBagCaldeirasVA.value + db.consBagCaldeirasVM.value)
    // setValue('consCondVECaldeira1', db.consCondDesCaldeirasVA.value + db.consCondDesCaldeirasVM.value)

    let after =  new Date()
    console.log(`Calculo BalancoHidrico: ` + (after - now)/1000)
}

async function SistemaFuligem(){
    //INPUTS
    let relAguaVapor = await getValue("relAguaVapor") 
    let flowFuligemCaldeira = await getValue("flowFuligemCaldeira")
    let umidFuligemCaldeira = await getValue("umidFuligemCaldeira")
    let tempAguaEntLavadorGases = await getValue("tempAguaEntLavadorGases") 
    let tempAguaSaidaLavadorGases = await getValue("tempAguaSaidaLavadorGases")
    
    let hltAguaFria = await hL_T(tempAguaEntLavadorGases)
    let hvtAguaFria = await hV_T(tempAguaEntLavadorGases)
    let hltAguaQuente = await hL_T(tempAguaSaidaLavadorGases)
    let flowVapor = await getValue("gerVaporVACaldeiras") + await getValue("gerVaporVMCaldeiras")//db.gerVaporV22Caldeira1.value
    
    //OUTPUTS
    let flowAguaLavadorGases = flowVapor * relAguaVapor
    let flowAguaEvapLavadorGases = flowAguaLavadorGases * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
    
    let flowAguaFuligem = flowFuligemCaldeira * umidFuligemCaldeira / 100
    let consAguaResRepSistFuligem = flowAguaEvapLavadorGases + flowAguaFuligem
    
    //UPDATE DB
    setValue('flowAguaLavadorGases', flowAguaLavadorGases)
    setValue('flowAguaEvapLavadorGases', flowAguaEvapLavadorGases)
    setValue('flowAguaFuligem', flowAguaFuligem)
    setValue('consAguaResRepSistFuligem', consAguaResRepSistFuligem)
}
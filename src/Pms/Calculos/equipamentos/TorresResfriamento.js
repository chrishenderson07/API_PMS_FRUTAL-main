const { setValue, getValue } = require('../../db/funcsDb')
const { hL_T, hV_T } = require('../modulos/steamTables')

module.exports = {
    TorreFabrica,
    TorreResfMosto,
    TorreResfDornas,
    TorreDestilaria,
    TorresDestilaria,
    TorreMancais,
    TorreVinhaca,
    TorreCDVG
}

async function TorreFabrica(){
    //INPUTS TORRE
    let tempAguaFriaTorreFab =  await getValue('tempAguaFriaTorreFab')
    let tempAguaQuenteTorreFab = await getValue('tempAguaQuenteTorreFab')
    let perdasArrasteTorreFab = await getValue('perdasArrasteTorreFab')
    let perdasPurgasTorreFab = await getValue('perdasPurgasTorreFab')
    
    let hltAguaFria = await hL_T(tempAguaFriaTorreFab)
    let hvtAguaFria = await hV_T(tempAguaFriaTorreFab)
    let hltAguaQuente = await hL_T(tempAguaQuenteTorreFab)
    let pressureVV5 = await getValue('pressureVV5')
    let hVapor = await hV_T(pressureVV5)
    let relHs = (hltAguaQuente - hVapor) / (hltAguaFria - hltAguaQuente)
    
    //EVAPORACAO
    let flowVV5 = await getValue('flowVV5')
    let flowAguaEvapTorreFab = flowVV5 * relHs
    let flowAguaQuenteEvapTorreFab = flowAguaEvapTorreFab + flowVV5
    setValue('flowAguaEvapTorreFab', flowAguaEvapTorreFab)
    setValue('flowAguaQuenteEvapTorreFab', flowAguaQuenteEvapTorreFab)
    
    //MASSA A
    let consVaporVV1CozedorMassaA = await getValue('consVaporVV1CozedorMassaA')
    let consVaporVV2CozedorMassaA = await getValue('consVaporVV2CozedorMassaA')
    let vaporToCondMA =  consVaporVV1CozedorMassaA + consVaporVV2CozedorMassaA
    let flowAguaMassaATorreFab = vaporToCondMA * relHs
    let flowAguaQuenteMassaATorreFab = flowAguaMassaATorreFab + vaporToCondMA
    setValue('flowAguaMassaATorreFab', flowAguaMassaATorreFab)
    setValue('flowAguaQuenteMassaATorreFab', flowAguaQuenteMassaATorreFab)
    
    //MASSA B
    let consVaporVV1CozedorMassaB = await getValue('consVaporVV1CozedorMassaB')
    let consVaporVV2CozedorMassaB = await getValue('consVaporVV2CozedorMassaB')
    let vaporToCondMB = await consVaporVV1CozedorMassaB + consVaporVV2CozedorMassaB
    let flowAguaMassaBTorreFab = vaporToCondMB * relHs
    let flowAguaQuenteMassaBTorreFab = flowAguaMassaBTorreFab + vaporToCondMB
    setValue('flowAguaMassaBTorreFab', flowAguaMassaBTorreFab)
    setValue('flowAguaQuenteMassaBTorreFab', flowAguaQuenteMassaBTorreFab)
    
    //VAZAO TORRE
    let flowAguaTorreFab = flowAguaEvapTorreFab + flowAguaMassaATorreFab + flowAguaMassaBTorreFab
    let flowAguaQuenteTorreFab = flowAguaQuenteEvapTorreFab + flowAguaQuenteMassaATorreFab + flowAguaQuenteMassaBTorreFab
    setValue('flowAguaTorreFab', flowAguaTorreFab)
    setValue('flowAguaQuenteTorreFab', flowAguaQuenteTorreFab)
    
    //PERDAS
    let flowPerdaArrasteTorreFab = flowAguaTorreFab * perdasArrasteTorreFab/100
    let gerAguaResPurgasTorreFab = flowAguaTorreFab * perdasPurgasTorreFab/100
    
    let flowPerdaEvapTorreFab = flowAguaQuenteTorreFab * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
//    let flowPerdaEvapArr = flowPerdasArraste + flowPerdasEvap
    
    setValue('flowPerdaEvapTorreFab', flowPerdaEvapTorreFab)
    setValue('flowPerdaArrasteTorreFab', flowPerdaArrasteTorreFab)
    setValue('gerAguaResPurgasTorreFab', gerAguaResPurgasTorreFab)
    //db.flowPerdaEvapAndArrTorreFab.setValue(flowPerdaEvapArr)
    
    
    //AGUA REPOSICAO
    let consAguaBrutaRepTorreFab = flowPerdaEvapTorreFab + flowPerdaArrasteTorreFab + gerAguaResPurgasTorreFab - flowVV5 - vaporToCondMA - vaporToCondMB
    setValue('consAguaBrutaRepTorreFab', consAguaBrutaRepTorreFab)
    
}

async function TorreResfMosto(){
    let brixMosto = await getValue('brixMosto')
    let flowMosto = await getValue('flowMosto')
    let tempMostoResf = await getValue('tempMostoResf') 
    let tempMostoReg = await getValue('tempMostoReg') 
    let tempAguaEntResfMosto = await getValue('tempAguaEntResfMosto')
    let tempAguaSaiResfMosto = await getValue('tempAguaSaiResfMosto')
    let coefTrocaResfMosto = await getValue('coefTrocaResfMosto')

    let cpMosto = 4.1868 * (1 - brixMosto/100 * (0.6 - 0.0018 * tempMostoReg + 0.11 * (1 - 80/100)))
    let qResfMosto = flowMosto/3600 * cpMosto * (tempMostoReg - tempMostoResf)
    let flowAguaResfMosto = qResfMosto * 3600 / (4.187 * (tempAguaSaiResfMosto - tempAguaEntResfMosto))
    let approachResfMosto = tempMostoResf - tempAguaEntResfMosto
   
    let dTml = ((tempMostoReg - tempAguaSaiResfMosto) - (tempMostoResf - tempAguaEntResfMosto)) / Math.log((tempMostoReg - tempAguaSaiResfMosto) / (tempMostoResf - tempAguaEntResfMosto))
    let areaNecessariaResfMosto = qResfMosto * 1000000 / (coefTrocaResfMosto * dTml)

    setValue('flowAguaResfMosto', flowAguaResfMosto)
    setValue('approachResfMosto', approachResfMosto)
    setValue('coefTrocaResfMosto', coefTrocaResfMosto)
    setValue('areaNecessariaResfMosto', areaNecessariaResfMosto)
}

async function TorreResfDornas(){
    let artMassaMosto = await getValue('artMassaMosto')
    let tempAguaFriaTorreFerm = await getValue('tempAguaFriaTorreFerm')
    let tempAguaQuenteTorreFerm = await getValue('tempAguaQuenteTorreFerm') 
    
    let fluxoArt = artMassaMosto
    let calorGerado = fluxoArt * 690
    let flowAguaTorreFerm = calorGerado / (4.18 * (tempAguaQuenteTorreFerm - tempAguaFriaTorreFerm))
    
    setValue('flowAguaTorreFerm', flowAguaTorreFerm)
    setValue('consAguaTratTorreFerm', 0)
}

async function TorreDestilaria(){
    
    let flowEtanol = await getValue('flowEtanol')
    let flowEtanolAnidro = await getValue('flowEtanolAnidro')
    
    let flowAguaTorreColA = flowEtanol * 70
    let flowAguaTorreColB = flowEtanol * 0
    let flowAguaTorreResfHid = flowEtanol * 0
    let flowAguaTorreAnidro = flowEtanolAnidro * 45
    let flowAguaTorreResfAnid = flowEtanolAnidro * 0
    
    let flowAguaTorreDest = flowAguaTorreColA + flowAguaTorreColB + flowAguaTorreResfHid + flowAguaTorreAnidro + flowAguaTorreResfAnid
    setValue('flowAguaTorreDestilatia', flowAguaTorreDest)
    setValue('flowAguaTorreColA', flowAguaTorreColA)
    setValue('flowAguaTorreColB', flowAguaTorreColB)
    setValue('flowAguaTorreResfHid', flowAguaTorreResfHid)
    setValue('flowAguaTorrePeneriraMol', flowAguaTorreAnidro)
    setValue('flowAguaTorreResfAnid', flowAguaTorreResfAnid)
}

async function TorresDestilaria(){
    
    let flowAguaMosto = await getValue('flowAguaResfMosto') 
    var flowAguaDornas = await getValue('flowAguaTorreFerm') 
    var flowAguaDest = await getValue('flowAguaTorreDestilatia')
    
    let tempAguaQuenteMosto = await getValue('tempAguaSaiResfMosto')
    let tempAguaQuenteDest = await getValue('tempAguaQuenteTorreDest')
//    let tempAguaQuenteDornas = db.tempAguaQuenteTorreFerm.value
    
    if (flowAguaDornas > flowAguaDest){
        flowAguaDest = flowAguaDornas
        setValue('flowAguaTorreDestilatia', flowAguaDest)
    }else{
        flowAguaDornas = flowAguaDest
        setValue('flowAguaTorreFerm', flowAguaDornas)
    }
    let flowAguaTotalDest = flowAguaMosto + flowAguaDest
    let tempAguaQuenteTotalDest = (flowAguaMosto * tempAguaQuenteMosto + flowAguaDest * tempAguaQuenteDest) / flowAguaTotalDest
    let tempAguaFriaTotalDest = await getValue('tempAguaEntResfMosto')
    
    setValue('flowAguaTotalTorreDest', flowAguaTotalDest)
    setValue('tempAguaQuenteTotalTorreDest', tempAguaQuenteTotalDest)
    
    //PERDAS
    let perdasArraste = await getValue('perdasArrasteTorreFerm')
    let perdasPurgas = await getValue('perdasPurgasTorreFerm')
    
    let flowPerdasArraste = flowAguaTotalDest * perdasArraste/100
    let flowPerdasPurgas = flowAguaTotalDest * perdasPurgas/100
    let hltAguaFria = await hL_T(tempAguaFriaTotalDest)
    let hvtAguaFria = await hV_T(tempAguaFriaTotalDest)
    let hltAguaQuente = await hL_T(tempAguaQuenteTotalDest)
    let flowPerdasEvap = flowAguaTotalDest * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
    let flowPerdaEvapArr = flowPerdasArraste + flowPerdasEvap
    
    setValue('flowPerdaTotalEvapTorreDest', flowPerdasEvap)
    setValue('flowPerdaTotalArrasteTorreDest', flowPerdasArraste)
    setValue('gerAguaResPurgasTorreDest', flowPerdasPurgas)
    setValue('flowPerdaEvapAndArrTorreDest', flowPerdaEvapArr)
    setValue('flowPerdaEvapTorreDest', flowPerdasEvap)
    setValue('flowPerdaArrasteTorreDest', flowPerdasArraste)
    
    //AGUA REPOSICAO
    let flowAguaRep = flowPerdasEvap + flowPerdasArraste + flowPerdasPurgas
    setValue('consAguaBrutaRepTorreDest', flowAguaRep)
}

async function TorreMancais(){
    //INPUTS TORRE
    let tempAguaFria = await getValue('tempAguaFriaTorreMancais')
    let tempAguaQuente = await getValue('tempAguaQuenteTorreMancais') 
    let perdasArraste = await getValue('perdasArrasteTorreMancais') 
    let perdasPurga = await getValue('perdasPurgasTorreMancais') 
    let flowAgua = await getValue('flowAguaTorreMancais')
    
    let hltAguaFria = await hL_T(tempAguaFria)
    let hvtAguaFria = await hV_T(tempAguaFria)
    let hltAguaQuente = await hL_T(tempAguaQuente)
    
    //PERDAS
    let flowPerdasArraste = flowAgua * perdasArraste/100
    let flowPerdasPurgas = flowAgua * perdasPurga/100
    let flowPerdasEvap = flowAgua * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
    
    setValue('flowPerdaEvapTorreMancais', flowPerdasEvap)
    setValue('flowPerdaArrasteTorreMancais', flowPerdasArraste)
    setValue('gerAguaResPurgasTorreMancais', flowPerdasPurgas)
    
    //AGUA REPOSICAO
    let flowAguaRep = flowPerdasEvap + flowPerdasArraste + flowPerdasPurgas
    setValue('consAguaBrutaRepTorreMancais', flowAguaRep)
}

async function TorreVinhaca(){
    //INPUTS TORRE
    let tempVinhacaFria = await getValue('tempVinhacaFriaTorreVinhaca')
    let tempVinhacaQuente = await getValue('tempVinhacaReg')
    let perdasArraste = await getValue('perdasArrasteTorreVinhaca')
    let flowVinhacaQuente = await getValue('flowVinhaca')
    
    let hltAguaFria = await hL_T(tempVinhacaFria)
    let hvtAguaFria = await hV_T(tempVinhacaFria)
    let hltAguaQuente = await hL_T(tempVinhacaQuente)
    
    //PERDAS
    let flowPerdasArraste = flowVinhacaQuente * perdasArraste/100
    let flowPerdasEvap = flowVinhacaQuente * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
    
    setValue('flowPerdaEvapTorreVinhaca', flowPerdasEvap)
    setValue('flowPerdaArrasteTorreVinhaca', flowPerdasArraste)
    
    //FLOW
    let flowVinhacaFria = flowVinhacaQuente - flowPerdasEvap - flowPerdasArraste
    setValue('flowVinhacaFria', flowVinhacaFria)
}

async function TorreCDVG(){
    //INPUTS TORRE
    let tempCDVGFrio = await getValue('tempCondReg') - 10.0
    let tempCDVGQuente = await getValue('tempCondReg') 
    let flowCDVGQuente = await getValue('flowCondVegetal')
    let perdasArraste = 0.3
    
    let hltAguaFria = await hL_T(tempCDVGFrio)
    let hvtAguaFria = await hV_T(tempCDVGFrio)
    let hltAguaQuente = await hL_T(tempCDVGQuente)
    
    //PERDAS
    let flowPerdasArraste = flowCDVGQuente * perdasArraste/100
    let flowPerdasEvap = flowCDVGQuente * (hltAguaQuente - hltAguaFria) / (hvtAguaFria - hltAguaFria)
    
    let perdaTotal = flowPerdasEvap + flowPerdasArraste
    setValue('flowPerdasTorreCond', perdaTotal)
}

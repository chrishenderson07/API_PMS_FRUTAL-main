const { setValue, getValue } = require('../../db/funcsDb')
const { getSumFromKey } = require('../../db/funcsDb')
const { h_pT } = require('../modulos/steamTables')
const { TurboGeradorCdVA, calcTgCpVAManAndTgCpVMMan, calcTgCpVAAutoAndTgCpVMAuto, calcTgCpVAAutoAndTgCpVMMan, calcTgCpVAManAndTgCpVMAuto } = require('../equipamentos/TurboGeradores')
const { CaldeirasVA, CaldeirasVM } = require('../equipamentos/Caldeiras')


module.exports = {
    Vapor,
}

async function Vapor(){
    let now = new Date()

    var somaConsVE = 0.0//consVapor(.VE)
    var somaGerVE = await getSumFromKey('gerVaporVE')
    setValue('isExpEnergy', 0.0)
    let isExpEnergy = await getValue('isExpEnergy')
    
    if (isExpEnergy == 0){
        setValue('opModeTgCpVM', 1.0)
        let consEspEnergia = await getSumFromKey('consEspEnergiaTC')
        let flowCana = await getSumFromKey('flowCana') 
        let ptCons = consEspEnergia * flowCana / 1000
        setValue('ptTgCpVM', ptCons)
    }
    
    var n = 0
    while (Math.abs(somaConsVE - somaGerVE) > 0.05){
        n += 1
        await VV3()
        await VV2()
        await VV1()
        await GeneralSteam()
        await VE()
        await TotalFlowDes()
        await Energia()
        setValue('opCaldeirasVA', 0.0) //set
        // await CaldeirasVA()
        await CaldeirasVM()
        await Bagaco()
        await GeneralSteam()
        await Desaerador()
        somaConsVE =  await getSumFromKey('consVaporVE')
        somaGerVE = await getSumFromKey('gerVaporVE')
        if (n > 10){
            somaGerVE = somaConsVE
        }
    }
    let after =  new Date()
    console.log(`Calculo Vapor: ` + (after - now)/1000)
}

async function VV3(){
    let consVaporVV3AqAcucar = await getValue('consVaporVV3AqAcucar')
    let consVaporVV3AqAcucar2 = await getValue('consVaporVV3AqAcucar2')
    let consVaporVV3AqEtanol = await getValue('consVaporVV3AqEtanol')
    let consVV3AqAc = consVaporVV3AqAcucar + consVaporVV3AqAcucar2
    let consVV3AqEt = consVaporVV3AqEtanol
    setValue('flowVaporVV3Aquecimento', consVV3AqAc + consVV3AqEt)
    let consVaporVV3 = await getSumFromKey('consVaporVV3')
    let flowVaporVV34Efeito = await getValue('flowVaporVV34Efeito')
    let consVaporVV3Perdas = await getValue('consVaporVV3Perdas')
    consVaporVV3 = consVaporVV3 + flowVaporVV34Efeito - consVaporVV3Perdas
    let perdasVV3 = await getValue('perdasVV3')
    setValue('consVaporVV3Perdas', consVaporVV3 * perdasVV3/100)
}

async function VV2(){
    let consVV2AqAc = await getValue('consVaporVV2AqAcucar')
    let consVV2AqEt = await getValue('consVaporVV2AqEtanol') 
    setValue('flowVaporVV2Aquecimento', consVV2AqAc + consVV2AqEt)
    let consVaporVV2 = await getSumFromKey('consVaporVV2')
    let flowVaporVV23Efeito = await getValue('flowVaporVV23Efeito')
    let consVaporVV2Perdas = await getValue('consVaporVV2Perdas')
    consVaporVV2 = consVaporVV2 + flowVaporVV23Efeito - consVaporVV2Perdas
    let perdasVV2 = await getValue('perdasVV2')
    setValue('consVaporVV2Perdas', consVaporVV2 * perdasVV2/100)
}

async function VV1(){
    let consVV1ColA = await getValue('consVaporVV1ColA')
    let consVV1ColB = await getValue('consVaporVV1ColB')
    setValue('flowVaporVV1Destilaria', consVV1ColA + consVV1ColB)
    
    let consVV1AqAc = await getValue('consVaporVV1AqAcucar')
    let consVV1AqEt = await getValue('consVaporVV1AqEtanol')
    let consVV1AqCCAc = await getValue('consVaporVV1AqCCAcucar') 
    let consVV1AqXarope = await getValue('consVaporVV1AquecXarope')
    
    setValue('flowVaporVV1Aquecimento', consVV1AqAc + consVV1AqEt + consVV1AqCCAc + consVV1AqXarope)
    let consVaporVV1 = await getSumFromKey('consVaporVV1')
    let flowVaporVV12Efeito = await getValue('flowVaporVV12Efeito')
    let consVaporVV1Perdas = await getValue('consVaporVV1Perdas')
    consVaporVV1 = consVaporVV1 + flowVaporVV12Efeito - consVaporVV1Perdas
    let perdasVV1 = await getValue('perdasVV1')
    setValue('consVaporVV1Perdas', consVaporVV1 * perdasVV1/100)
}

async function VE(){
    //deletar
    setValue('gerVaporVETG1', 0.0)
    setValue('gerVaporVETurboBomba', 0.0)
    //fim deletar
    
    setValue('consVaporVEAlivio', 0.0)
    setValue('gerVaporVEDessupVE', 0.0)
    var consVaporVE = await getSumFromKey('consVaporVE')
    var perdasVE = await getSumFromKey('perdasVE')
    setValue('consVaporVEPerdas', consVaporVE * perdasVE/100)
    consVaporVE = await getSumFromKey('consVaporVE')
    
    let consVEColA =  await getValue('consVaporVEColA')
    let consVEColB = await getValue('consVaporVEColB')
    setValue('flowVaporVEDestilaria', consVEColA + consVEColB)
    
    let gerVaporVEMoendas = await getValue('gerVaporVEMoendas') 
    let gerVaporVEDesfibrador = await getValue('gerVaporVEDesfibrador')
    let gerVaporVEPicador = await getValue('gerVaporVEPicador') 
    let gerVaporVENivelador = await getValue('gerVaporVENivelador')
    let gerVaporVETBCaldeirasVA = await getValue('gerVaporVETBCaldeirasVA')
    let gerVaporVETBCaldeirasVM = await getValue('gerVaporVETBCaldeirasVM')

    let gerVaporVETurboBomba = gerVaporVETBCaldeirasVA + gerVaporVETBCaldeirasVM
    let gerVaporVEOutrosAcion = await getValue('gerVaporVEOutrosAcion')
    let gerVaporVEAcion = gerVaporVEMoendas + gerVaporVEDesfibrador + gerVaporVEPicador + gerVaporVENivelador + gerVaporVETurboBomba + gerVaporVEOutrosAcion
    setValue('flowVaporVEAcion', gerVaporVEAcion)
    setValue('flowVaporVMTBCaldeiras', gerVaporVETurboBomba)
    
    await TurboGeradorCdVA()

    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')
    let flowDessupVETgCdVA = await FlowDes(gerVaporVETgCdVA, tempExtTgCdVA, 'VE')
    
    let flowDessupVEAcion = await getValue('flowDessupVEAcion')
    let faltaVaporVE = consVaporVE - gerVaporVEAcion - gerVaporVETgCdVA - flowDessupVETgCdVA - flowDessupVEAcion
    if (faltaVaporVE < 0){
        setValue('consVaporVEAlivio', -faltaVaporVE)
    }
    
    let opModeTgCpVA = await getValue('opModeTgCpVA') 
    let opModeTgCpVM = await getValue('opModeTgCpVM')
    
    switch (opModeTgCpVA, opModeTgCpVM) {
    case (1, 1): await calcTgCpVAManAndTgCpVMMan(faltaVaporVE)
    case (0, 0): await calcTgCpVAAutoAndTgCpVMAuto(faltaVaporVE)
    case (0, 1): await calcTgCpVAAutoAndTgCpVMMan(faltaVaporVE)
    case (1, 0): await calcTgCpVAManAndTgCpVMAuto(faltaVaporVE)
    default:
        console.log("None")
    }
    await RebVMVE()
    await RebVAVM()
}

async function GeneralSteam(){
    let flowCana = await getValue('flowCana')
    let gerVaporVACaldeiras = await getValue('gerVaporVACaldeiras')
    let gerVaporVMCaldeiras = await getValue('gerVaporVMCaldeiras')
    let gerCondVETgCdVA = await getValue('gerCondVETgCdVA')
    let gerVaporTotal = gerVaporVACaldeiras + gerVaporVMCaldeiras - gerCondVETgCdVA
    let consVaporTC = gerVaporTotal * 1000 / flowCana
    setValue('consVaporTC', consVaporTC)
    
    let tempAcionNiv = await getValue('tempVaporVENivelador') 
    let flowAcionNiv = await getValue('consVaporVMNivelador')
    
    let tempAcionPicador = await getValue('tempVaporVEPicador')
    let flowAcionPicador = await getValue('consVaporVMPicador')
    
    let tempAcionDesf = await getValue('tempVaporVEDesfibrador')
    let flowAcionDesf = await getValue('consVaporVMDesfibrador') 
    
    let tempAcionMoendas = await getValue('tempVaporVEMoendas') 
    let flowAcionMoendas = await getValue('consVaporVMMoendas') 
    
    let tempEscTBVA = await getValue('tempVETBCaldeirasVA')
    let flowEscTBVA = await getValue('consVaporVMTBCaldeirasVA') 
    
    let tempEscTBVM = await getValue('tempVETBCaldeirasVM') 
    let flowEscTBVM = await getValue('consVaporVMTBCaldeirasVM')
    
    let tempEscOutrosAcion = await getValue('tempVaporVEOutrosAcion')
    let flowVEOutrosAcion = await getValue('gerVaporVEOutrosAcion')
    
    let flowVaporVEAcion = await getValue('flowVaporVEAcion')
    let tempVaporVEAcion = (tempAcionPicador * flowAcionPicador + tempAcionDesf * flowAcionDesf + tempAcionMoendas * flowAcionMoendas + 
        tempEscTBVA*flowEscTBVA + tempEscTBVM*flowEscTBVM + tempAcionNiv * flowAcionNiv + tempEscOutrosAcion * flowVEOutrosAcion)/flowVaporVEAcion
    setValue('tempVaporVEAcion', tempVaporVEAcion)
    setValue('tempVaporVMTBCaldeiras', (tempEscTBVA*flowEscTBVA + tempEscTBVM*flowEscTBVM)/(flowEscTBVA + flowEscTBVM))

    let flowDessupVEAcion = await FlowDes(flowVaporVEAcion, tempVaporVEAcion, 'VE')
    
    // let flowDessupVEAcion = dessuperAquecedores().calcDessup(flowIn: flowVaporVEAcion,
    //                                                          tempIn: tempVaporVEAcion,
    //                                                          vapor: .VE)
    setValue('flowDessupVEAcion', flowDessupVEAcion)
    
    //RET. CONDENSADO
    let retCond = await getValue('retornoCondVEProcesso') 
    let consVEEvapAc = await getValue('consVaporVEEvapAc') 
    setValue('gerCondVEProcesso', consVEEvapAc * retCond / 100.0 + gerCondVETgCdVA)
    
    //SECAGEM LEVEDURA
    let consEspLev = await getValue('consEspVaporV22Seclevedura')
    let flowLeveduraSeca = await getValue('flowLeveduraSeca')
    setValue('consVaporV22Seclevedura', flowLeveduraSeca * consEspLev)
    

    await RebVMtoV10()
    
}
    
async function FlowDes(flowIn, tempIn, Vapor){
    let tempDesaerador = await getValue('tempDesaerador') 
    let tempVapor = await vTemp(Vapor)
    let pressVapor = await vPress(Vapor)
    let tempDes = tempDesaerador - 10.0
    let HDes = await h_pT(await vPress(Vapor)+1.0, tempDes)
    
    let Hin = await h_pT(pressVapor, tempIn)
    let Hout = await h_pT(pressVapor, tempVapor)
    let FlowDes = flowIn*(Hout-Hin)/(HDes-Hout)
    return FlowDes
}

async function TotalFlowDes(){
    let flowAguaDesRebVAVM = await getValue('flowAguaDesRebVAVM')
    let flowAguaDesRebVMVA = await getValue('flowAguaDesRebVMVA') 
    let gerVaporVMDessupVM = await getValue('gerVaporVMDessupVM') 
    let gerVaporVEDessupVE = await getValue('gerVaporVEDessupVE') 
    let consCondVEDessupDesid = await getValue('consCondVEDessupDesid') 
    let flowCondDessupFromDes = flowAguaDesRebVAVM + flowAguaDesRebVMVA + gerVaporVMDessupVM + gerVaporVEDessupVE + consCondVEDessupDesid
    setValue('flowCondDessupFromDes', flowCondDessupFromDes)
}

async function CalcReb(flowOut, vIn, vOut){
    let tempDesaerador = await getValue('tempDesaerador')
    let tempDes = tempDesaerador - 10.0
    let HDes = await h_pT(await vPress(vOut), tempDes)

    let Hin = await h_pT(await vPress(vIn), await vTemp(vIn))
    let Hout =  await h_pT(await vPress(vOut), await vTemp(vOut))
    let flowDes = flowOut * (Hout - Hin) / (HDes - Hin)
    let flowin = flowOut - flowDes
    return {
        "flowIn": flowin, 
        "flowDes": flowDes
    }
}

async function  RebVMtoV10(){
    setValue('pressureV10', 10.0)
    setValue('tempV10', 180.0)
    let consVaporV10Desidratacao = await getValue('consVaporV10Desidratacao')
    if (consVaporV10Desidratacao > 0){

        let reb = await CalcReb(consVaporV10Desidratacao, 'VM', 'V10')

        setValue('consVaporV22Desidratacao', reb.flowIn)
        setValue('consCondVEDessupDesid', reb.flowDes)
    }else{
        setValue('consVaporV22Desidratacao', 0.0)
        setValue('consCondVEDessupDesid', 0.0)
    }
}

async function RebVMVE(){
    let consVaporVEAlivio = await getValue('consVaporVEAlivio')
    let gerVaporVERebVMVA = 0
    let consVaporVMRebVMVA = 0.0
    let flowAguaDesRebVMVA = 0.0
    
    if (consVaporVEAlivio < 0){
        gerVaporVERebVMVA = -consVaporVEAlivio
        let reb = await CalcReb(gerVaporVERebVMVA, 'VM',  'VE')
        consVaporVMRebVMVA = reb.flowIn
        flowAguaDesRebVMVA = reb.flowDes
        setValue('consVaporVEAlivio', 0.0)
    }

    setValue('gerVaporVERebVMVA', gerVaporVERebVMVA)
    setValue('consVaporVMRebVMVA', consVaporVMRebVMVA)
    setValue('flowAguaDesRebVMVA', flowAguaDesRebVMVA)
}

async function RebVAVM(){
    let opCaldeirasVA = await getValue('opCaldeirasVA')
    let consVaporVARebVAVM = 0.0
    let flowAguaDesRebVAVM = 0.0
    if (opCaldeirasVA.value == 1.0){
        let gerVaporVMRebVAVM = await getValue('gerVaporVMRebVAVM')
        if (gerVaporVMRebVAVM > 0){
            let reb = await CalcReb(gerVaporVMRebVAVM, 'VA', 'VM')
            consVaporVARebVAVM = reb.flowIn
            flowAguaDesRebVAVM = reb.flowDes
        }
    }else{
        setValue('gerVaporVERebVAVM', 0.0)
    }
    setValue('consVaporVARebVAVM', consVaporVARebVAVM)
    setValue('flowAguaDesRebVAVM', flowAguaDesRebVAVM)
}

async function Energia(){
    let flowCana = await getValue('flowCana')
    let consEspEnergiaTC = await getValue('consEspEnergiaTC')
    let ptTgCpVA = await getValue('ptTgCpVA')
    let ptTgCpVM = await getValue('ptTgCpVM')
    let ptTgCdVA = await getValue('ptTgCdVA')
    let consEnergia = consEspEnergiaTC * flowCana / 1000.0
    let expEnergia = ptTgCpVA + ptTgCpVM + ptTgCdVA - consEnergia
    let consEnergiaDia = consEnergia * 24
    let expEnergiaDia = expEnergia * 24
    let expEnergiaTC = expEnergia * 1000 / flowCana
    getValue('consEnergia', consEnergia)
    getValue('expEnergia', expEnergia)
    getValue('consEnergiaDia', consEnergiaDia)
    getValue('expEnergiaDia', expEnergiaDia)
    getValue('expEnergiaTC', expEnergiaTC)
}

async function Bagaco(){
    let artMassaCana = await getValue('artMassaCana')
    let perdaArtLavagemCana = await getValue('perdaArtLavagemCana')
    let relBagacilhoCana = await getValue('relBagacilhoCana')
    let flowCana = await getValue('flowCana')
    let artCana = await getValue('artCana')
    let arCana = await getValue('arCana')
    let flowFibra = await getValue('flowFibra')
    let polCana = await getValue('polCana')
    let efExt = await getValue('efExtMoenda')
    let fibraBagaco = await getValue('fibraBagaco')

    let perdaMassaArtLav = artMassaCana * perdaArtLavagemCana/100
    let flowBagacilho = relBagacilhoCana * flowCana/1000

    let flow = fibraBagaco != 0.0 ? flowCana * flowFibra / fibraBagaco : 0.0
    let artMassa = (1 - efExt/100) * (artCana/100 * flowCana - perdaMassaArtLav)
    let art = artMassa * 100 / flow
    let pol = polCana != 0.0 ? (art - arCana/polCana) * 0.95 : 0.0
    let flowBagacoToBoilers = flow - flowBagacilho


    setValue('perdaArtExtracao', 100 - efExt)
    setValue('consBagacoCaldeira1', 0.0)//apagar
    
    let consBag = getSumFromKey("consBag")
    let sobra = flowBagacoToBoilers - consBag

    setValue('flowBagaco', flow)
    setValue('flowBagacoToBoilers', flowBagacoToBoilers)
    setValue('polBagaco', pol)
    setValue('artBagaco', art)
    setValue('artMassaBagaco', artMassa)
    setValue('flowBagacilho', flowBagacilho)
    setValue('sobraBagaco', sobra)
}

async function Desaerador(){
    let temp = await getValue('tempDesaerador')

    if (temp > 120){
        temp = 120
        setValue('tempDesaerador', temp)
    }

    let consCondDesCaldeirasVA = await getValue('consCondDesCaldeirasVA')
    let consCondDesCaldeirasVM = await getValue('consCondDesCaldeirasVM')
    let flowCondDessupFromDes = await getValue('flowCondDessupFromDes')

    let flowAguaSaida = consCondDesCaldeirasVA + consCondDesCaldeirasVM + flowCondDessupFromDes
    let VEpress = await vPress('VE')
    let VEtemp = await vTemp('VE')
    
    let tempCondTG = await getValue('tempEscTgCdVA')
    let flowCondTG = await getValue('gerCondVETgCdVA')
    let flowCondVE = await getValue('gerCondVEEvapAc') * await getValue('retornoCondVEProcesso')/100
    let gerCondVEProcesso = await getValue('gerCondVEProcesso')
    let tempCondVG = await getValue('tempCondVGDesaerador')
    let tempRetCondVE = await getValue('tempRetCondVEDesaerador')
    let tempsAguaDesmi = await getValue('tempsAguaDesmiDesaerador')
    
    let tempRetCond = (tempCondTG * flowCondTG + tempRetCondVE * flowCondVE)/gerCondVEProcesso
    
    let HCond = await h_pT(VEpress+1, tempRetCond)
    let flowCond = gerCondVEProcesso
    let hVE = await h_pT(VEpress, VEtemp)
    let hcondVG = await h_pT(VEpress, tempCondVG)
    let hDesmi = await h_pT(VEpress, tempsAguaDesmi)
    
    var hAguaDes = await h_pT(VEpress, temp)
    
    var flowVE = await getValue('consVaporVEDesaerador')
    
    var flowRepo0 = flowAguaSaida - flowVE - flowCond
    
    var tempRepo = 0.0
    let relDesmi = await getValue('relRepoDesaerador')
    var hRepo = 0.0
    let opRepo = await getValue('opRepoDesaerador')
    if (opRepo == 0){
        hRepo = hDesmi
        tempRepo = tempsAguaDesmi
    }else if (opRepo == 1){
        hRepo = hcondVG
        tempRepo = await getValue('tempCondVGDesaerador')
    }else{
        hRepo = hDesmi * relDesmi/100 + HCond * (1 - relDesmi/100)
        tempRepo = tempsAguaDesmi * relDesmi/100 + tempCondVG * (1 - relDesmi/100)
    }

    var flowRepo = 0.0
    
    while (Math.abs(flowRepo - flowRepo0) > 0.01) {
        flowRepo = flowRepo0
        flowVE = (flowAguaSaida * hAguaDes - flowCond * HCond - flowRepo * hRepo) / hVE
        flowRepo0 = flowAguaSaida - flowCond - flowVE
    }
    if (flowVE < 0){
        flowRepo = flowRepo + flowVE
        flowVE = 0.0
        temp = (flowCond * tempRetCond + flowRepo * tempRepo) / flowAguaSaida
        hAguaDes = (flowCond * HCond + flowRepo * hRepo) / flowAguaSaida
    }
    
    let consAguaDesmi = 0.0
    let consCondVG = 0.0
    if (opRepo == 0){
        consAguaDesmi = flowRepo
        consCondVG = 0.0
    }else if (opRepo == 1){
        consCondVG = flowRepo
        consAguaDesmi = 0.0
    }else{
        consCondVG = flowRepo * (1 - relDesmi/100)
        consAguaDesmi = flowRepo * relDesmi/100
    }
    let consAguaTrat = consAguaDesmi/0.75

    
    setValue('consAguaDesmiDesaerador', consAguaDesmi)
    setValue('consCondVGDesaerador', consCondVG)
    setValue('flowAguaDesaerador', flowAguaSaida)
    setValue('consAguaTratAbrandador', consAguaTrat)
    setValue('gerAguaResAbrandador', consAguaTrat - consAguaDesmi)
    setValue('consVaporVEDesaerador', flowVE)
}

async function vPress(key){
    switch (key){
        case 'VA': return await getValue('pressureVA')
        case 'VM': return await getValue('pressureVM')
        case 'V10': return await getValue('pressureV10')
        case 'VE': return await getValue('pressureVE')
        case 'VV1': return await getValue('pressureVV1')
        case 'VV2': return await getValue('pressureVV2')
        case 'VV3': return await getValue('pressureVV3')
        case 'VV4': return await getValue('pressureVV4')
        case 'VV5': return await getValue('pressureVV5')
    }
}

async function vTemp(key){
    switch (key){
        case 'VA': return await getValue('tempVaporVA')
        case 'VM': return await getValue('tempVaporVM')
        case 'V10': return await getValue('tempV10')
        case 'VE': return await getValue('tempVaporVE')
        default: return 0
    }
}





const { setValue, getValue } = require('../../db/funcsDb')
const { TorreFabrica } = require('./TorresResfriamento')

module.exports = {
    Cozimento_2M,
}

async function Cozimento_2M(){
    let now = new Date()
    //INPUT DIVISAO XAROPE
    let xaropeToMassaA =  await getValue('xaropeToMassaA')
    let xaropeToMassaB =  100 - xaropeToMassaA
    setValue('xaropeToMassaB', xaropeToMassaB)
    
    //INPUT DIVISAO DE MEIS
    let marRelTotal = await getValue('marRelTotal')
    let marToMassaA = await getValue('marToMassaA')
    let marToMassaB = 100 - marToMassaA
    setValue('marToMassaB', marToMassaB)
    let mapToMassaA = await getValue('mapToMassaA')
    let mapToMassaB = 100 - mapToMassaA
    setValue('mapToMassaB', mapToMassaB)
    let mbrRelTotal = await getValue('mbrRelTotal') 
    let mbrToMassaA = await getValue('mbrToMassaA')
    let mbrToMassaB = 100 - mbrToMassaA
    setValue('mbrToMassaB', mbrToMassaB)

    //INPUTS
    let flowXarope = await getValue('flowXarope')
    let purezaXarope = await getValue('purezaXarope')
    let brixXarope = await getValue('brixXarope')
    let artXarope = await getValue('artXarope')
    let brixMassaXarope = await getValue('brixMassaXarope')
    let desvioXaropeToEtanol = await getValue('desvioXaropeToEtanol')

    let purezaMelFinal = await getValue('purezaMelFinal')
    let purezaAcucar = await getValue('purezaAcucar')
    let purezaMelARico = await getValue('purezaMelARico')
    let purezaMelAPobre = await getValue('purezaMelAPobre')
    let purezaMagma = await getValue('purezaMagma')
    
    let brixMelFinal = await getValue('brixMelFinal')
    let brixAcucar = await getValue('brixAcucar')

    let brixMassaA = await getValue('brixMassaA')
    let brixMassaB = await getValue('brixMassaB')

    let brixMelARico = await getValue('brixMelARico')
    let brixMARDiluido = await getValue('brixMARDiluido')
    let brixMelAPobre = await getValue('brixMelAPobre')
    let brixMAPDiluido = await getValue('brixMAPDiluido')

    let brixAcucarB = await getValue('brixAcucarB')
    let brixMagma = await getValue('brixMagma')

    //XAROPE PARA FABRICA
    let flowXaropeToFab = flowXarope * (1 - desvioXaropeToEtanol/100)
    let brixMassaXaropeToFab = flowXaropeToFab * brixXarope/100
    let artMassaXaropeToFab = flowXaropeToFab * artXarope/100
    setValue('flowXaropeToFab', flowXaropeToFab)
    setValue('brixMassaXaropeToFab', brixMassaXaropeToFab)
    setValue('artMassaXaropeToFab', artMassaXaropeToFab)

    //XAROPE PARA MASSA A
    let flowXaropeToMassaA = flowXaropeToFab * xaropeToMassaA/100
    let brixMassaXaropeToMassaA = flowXaropeToMassaA * brixXarope/100
    let brixXaropeToMassaA = brixXarope
    setValue('flowXaropeToMassaA', flowXaropeToMassaA)
    setValue('brixMassaXaropeToMassaA', brixMassaXaropeToMassaA)
    setValue('brixXaropeToMassaA', brixXaropeToMassaA)

    //XAROPE PARA MASSA B
    let flowXaropeToMassaB = flowXaropeToFab * xaropeToMassaB/100
    let brixXaropeToMassaB = brixXarope
    let brixMassaXaropeToMassaB = flowXaropeToMassaB * brixXaropeToMassaB/100
    setValue('flowXaropeToMassaB', flowXaropeToMassaB)
    setValue('brixMassaXaropeToMassaB', brixMassaXaropeToMassaB)
    setValue('brixXaropeToMassaB', brixXaropeToMassaB)

    //PUREZAS
    let recSJM = purezaAcucar * (purezaXarope - purezaMelFinal) / (purezaXarope * (purezaAcucar - purezaMelFinal)) * 100
    setValue('recupSJM', recSJM)
    
    let flowAcucar = brixMassaXaropeToFab * (purezaXarope - purezaMelFinal) / (purezaAcucar - purezaMelFinal)
    let brixMassaAcucar = brixAcucar/100 * flowAcucar
    
    let purezaMassaA = await PzMA_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar)
    
    let purezaMassaB = await PzMB_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar)

    setValue('flowAcucar', flowAcucar)
    setValue('brixMassaAcucar', brixMassaAcucar)
    setValue('purezaMassaA', purezaMassaA)
    setValue('purezaMassaB', purezaMassaB)

    //BRIX MASSA
    let brixMassaMassaA = await MA_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaMassaB = await MB_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaMelAMisto = await MEAT_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaMelARico = await MEAR_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaMelARicoToMassaA = brixMassaMelARico * marToMassaA/100
    let brixMassaMelARicoToMassaB = brixMassaMelARico * marToMassaB/100

    let brixMassaMelAPobre = await MEAP_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaMelAPobreToMassaA = brixMassaMelAPobre * mapToMassaA/100
    let brixMassaMelAPobreToMassaB = brixMassaMelAPobre * mapToMassaB/100

    let brixMassaMelFinal = await MEBT_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    let brixMassaAcucarB = await AB_2M(purezaXarope, purezaMelARico, purezaMelAPobre, purezaMelFinal, purezaMelFinal, purezaAcucar, 
        purezaMagma, xaropeToMassaA/100, marRelTotal/100, marToMassaA/100, mapToMassaA/100, mbrRelTotal/100, mbrToMassaA/100, brixMassaAcucar*1000)/1000

    setValue('brixMassaMassaA', brixMassaMassaA)
    setValue('brixMassaMassaB', brixMassaMassaB)
    setValue('brixMassaMelAMisto', brixMassaMelAMisto)
    setValue('brixMassaMelARico', brixMassaMelARico)
    setValue('brixMassaMelARicoToMassaA', brixMassaMelARicoToMassaA)
    setValue('brixMassaMelARicoToMassaB', brixMassaMelARicoToMassaB)
    setValue('brixMassaMelAPobre', brixMassaMelAPobre)
    setValue('brixMassaMelAPobreToMassaA', brixMassaMelAPobreToMassaA)
    setValue('brixMassaMelAPobreToMassaB', brixMassaMelAPobreToMassaB)
    setValue('brixMassaMelFinal', brixMassaMelFinal)
    setValue('brixMassaAcucarB', brixMassaAcucarB)
    //
    
    let purezaMelAMisto = (purezaMelARico * brixMassaMelARico + purezaMelAPobre * brixMassaMelAPobre) / brixMassaMelAMisto
    let purezaMAPDiluido = purezaMelAPobre
    setValue('purezaMelAMisto', purezaMelAMisto)
    setValue('purezaMAPDiluido', purezaMAPDiluido)


     //CONCENTRACAO DE CRISTAIS
     let concCristaisMassaA = 100 * (purezaMassaA - purezaMelAPobre) / (100 - purezaMelAPobre)
     let concCristaisMassaB = 100 * (purezaMassaB - purezaMelFinal) / (100 - purezaMelFinal)
     setValue('concCristaisMassaA', concCristaisMassaA)
     setValue('concCristaisMassaB', concCristaisMassaB)

     //FLOW MASSA
     flowXarope = brixMassaXarope/brixXarope * 100
     //xaropeToMA.flow = xarope.flow * xaropeToMassaA/100
     //xaropeToMB.flow = xarope.flow * xaropeToMassaB/100
     let flowMassaA = brixMassaMassaA/brixMassaA * 100
     let flowMassaB = brixMassaMassaB/brixMassaB * 100
     let flowMelARico = brixMassaMelARico/brixMelARico * 100
     
     let flowMARDiluido = brixMassaMelARico/brixMARDiluido * 100
     let flowMelARicoToMassaA = flowMARDiluido * marToMassaA/100
     let flowMelARicoToMassaB = flowMARDiluido * marToMassaB/100
     let flowMelAPobre = brixMassaMelAPobre/brixMelAPobre * 100
     
     let flowMAPDiluido = brixMassaMelAPobre/brixMAPDiluido * 100
     let flowMelAPobreToMassaA = flowMAPDiluido * mapToMassaA/100
     let flowMelAPobreToMassaB = flowMAPDiluido * mapToMassaB/100
     let flowMelFinal = brixMassaMelFinal/brixMelFinal * 100
     //acucar.flow = acucar.brixMassa/acucar.brix * 100
     let flowAcucarB = brixMassaAcucarB/brixAcucarB * 100
     let flowMagma = brixMassaAcucarB / brixMagma * 100

     setValue('flowXarope', flowXarope)
     setValue('flowMassaA', flowMassaA)
     setValue('flowMassaB', flowMassaB)
     setValue('flowMelARico', flowMelARico)
     setValue('flowMARDiluido', flowMARDiluido)
     setValue('flowMelARicoToMassaA', flowMelARicoToMassaA)
     setValue('flowMelARicoToMassaB', flowMelARicoToMassaB)
     setValue('flowMelAPobre', flowMelAPobre)
     setValue('flowMAPDiluido', flowMAPDiluido)
     setValue('flowMelAPobreToMassaA', flowMelAPobreToMassaA)
     setValue('flowMelAPobreToMassaB', flowMelAPobreToMassaB)
     setValue('flowMelFinal', flowMelFinal)
     setValue('flowAcucarB', flowAcucarB)
     setValue('flowMagma', flowMagma)

     //ACUCAR
    let polAcucar = brixAcucar * purezaAcucar / 100
    let artAcucar = polAcucar/0.95 + 0.02
    let artMassaAcucar = artAcucar * flowAcucar / 100
    setValue('polAcucar', polAcucar)
    setValue('artAcucar', artAcucar)
    setValue('artMassaAcucar', artMassaAcucar)
    
    //art massa
    let artMassaMelFinal = artMassaXaropeToFab - artMassaAcucar
    let artMelFinal = artMassaMelFinal * 100 / flowMelFinal
    setValue('artMassaMelFinal', artMassaMelFinal)
    setValue('artMelFinal', artMelFinal)
    
    //ALIM MASSA A
    await AL_MA()

    //ALIM MASSA B
    await AL_MB()

    //CONSUMO VAPOR
    let qtdeCozMassaAVV1 = await getValue('qtdeCozMassaAVV1')
    let aguaEvapmassaA = flowXaropeToMassaA + flowMelARicoToMassaA + flowMelAPobreToMassaA + flowMagma - flowMassaA
    let aguaEvapmassaB = flowXaropeToMassaB + flowMelARicoToMassaB + flowMelAPobreToMassaB - flowMassaB
    let consVaporMassaA = aguaEvapmassaA * 1.1

    setValue('consVaporVV1CozedorMassaA', consVaporMassaA * qtdeCozMassaAVV1/3)
    setValue('consVaporVV2CozedorMassaA', consVaporMassaA * (1 - qtdeCozMassaAVV1/3))
    
    //VAPOR MASSA B
    let consVaporMassaB = aguaEvapmassaB * 1.1
    setValue('consVaporVV2CozedorMassaB', consVaporMassaB)
    setValue('consVaporVV1CozedorMassaB', 0.0)
    
    //COZIMENTO
    setValue('consVapTotalVV1Cozimento', consVaporMassaA * qtdeCozMassaAVV1/3 + 0.0)
    setValue('consVapTotalVV2Cozimento', consVaporMassaA * (1 - qtdeCozMassaAVV1/3) + consVaporMassaB)

    //CONDENSADOS
    let consCondVGCintrifMassaA  = flowMelAPobre + flowAcucar + flowMelARico - flowMassaA
    let consCondVGCintrifMassaB = flowAcucarB + flowMelFinal - flowMassaB
    let consCondVGMelAPobre = flowMAPDiluido - flowMelAPobre
    let consCondVGMagma = flowMagma - flowAcucarB

    setValue('consCondVGCintrifMassaA', consCondVGCintrifMassaA)
    setValue('consCondVGCintrifMassaB', consCondVGCintrifMassaB)
    setValue('consCondVGMelAPobre', consCondVGMelAPobre)
    setValue('consCondVGMagma', consCondVGMagma)
    setValue('gerCondVGCozedorMassaA', consVaporMassaA)
    setValue('gerCondVGCozedorMassaB', consVaporMassaB)
    setValue('gerCDVGFabrica', consVaporMassaA + consVaporMassaB)
    setValue('consCDVGFabrica', consCondVGCintrifMassaA + consCondVGCintrifMassaB + consCondVGMelAPobre + consCondVGMagma)

    //PERDA MULTIJATO
    let perdaArtMultijatoFabrica = await getValue('perdaArtMultijatoFabrica')
    let artMassaCana = await getValue('artMassaCana')
    let perdaMassaArtMultijatoFabrica = artMassaCana * perdaArtMultijatoFabrica/100
    setValue('perdaMassaArtMultijatoFabrica', perdaMassaArtMultijatoFabrica)
    
    //ACUCAR / MEL DESCONTA PERDA
    let relArtMassaAc = artMassaAcucar / (artMassaMelFinal + artMassaAcucar)
    let relArtMassaMel = artMassaMelFinal / (artMassaMelFinal + artMassaAcucar)
    artMassaAcucar = artMassaAcucar - (relArtMassaAc * perdaMassaArtMultijatoFabrica)
    artMassaMelFinal = artMassaMelFinal - (relArtMassaMel * perdaMassaArtMultijatoFabrica)
    flowAcucar = artMassaAcucar * 100 / artAcucar
    flowMelFinal = artMassaMelFinal/artMelFinal * 100
    let flowCana = await getValue('flowCana')

    setValue('flowAcucarScsdia', (flowAcucar * 24 * 1000 / 50))
    setValue('flowAcucarScsTc', (flowAcucar * 1000 / 50) / flowCana)
    setValue('flowAcucarTondia', flowAcucar * 24)
    
    //CAPACIDADE COZEDORES 
    let qtdeCozMassaA = await getValue('qtdeCozMassaA')
    let capCozMassaA = await getValue('capCozMassaA')
    let ciclosMassaA = (flowMassaA/1.5) * 10 * 24 / (qtdeCozMassaA * capCozMassaA)
    setValue('ciclosMassaA', ciclosMassaA)
    
    let qtdeCozMassaB = await getValue('qtdeCozMassaB')
    let capCozMassaB = await getValue('capCozMassaB')
    let ciclosMassaB = (flowMassaB/1.5) * 10 * 24 / (qtdeCozMassaB * capCozMassaB)
    setValue('ciclosMassaB', ciclosMassaB)

    //CENTRIFUGAS MASSA A
    let qtdeCentOpMassaA = await getValue('qtdeCentOpMassaA')
    let capCentMassaA = await getValue('capCentMassaA')
    let ciclosCentMassaA = await getValue('ciclosCentMassaA')
    let efCentMassaA = await getValue('efCentMassaA')
    let capTotalCentMassaA = qtdeCentOpMassaA * capCentMassaA * efCentMassaA/100 * ciclosCentMassaA / 1000
    let sobraCentMassaA = capTotalCentMassaA - flowMassaA
    setValue('capTotalCentMassaA', capTotalCentMassaA)
    setValue('sobraCentMassaA', sobraCentMassaA)
    
    //CENTRIFUGAS MASSA B
    let qtdeCentOpMassaB = await getValue('qtdeCentOpMassaB')
    let capCentMassaB = await getValue('capCentMassaB')
    let efCentMassaB = await getValue('efCentMassaB')
    let capTotalCentMassaB = qtdeCentOpMassaB * capCentMassaB * efCentMassaB/100
    let sobraCentMassaB = capTotalCentMassaB - flowMassaB
    setValue('capTotalCentMassaB', capTotalCentMassaB)
    setValue('sobraCentMassaB', sobraCentMassaB)

    //SECADOR
    let consEspVaporSecadorAcucar = await setValue('consEspVaporSecadorAcucar')
    let consVaporVESecadorAcucar = consEspVaporSecadorAcucar * flowAcucar / 1000
    setValue('consVaporVESecadorAcucar', consVaporVESecadorAcucar)
    setValue('flowAcucarSecador', flowAcucar)
    
    await TorreFabrica()

    let after =  new Date()
    console.log(`Calculo Cozimento_2M: ` + (after - now)/1000)
}

async function MB_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return -AA * (-PzX * PzAB - PzMEBP * beta * omega * PzMEAR + PzX * sigma * PzMEAP - alpha * beta * omega * PzMEBP * PzX - alpha * beta * omega * PzMEAR * PzAA + alpha * beta * omega * PzX * PzAA + PzX * sigma * omega * PzMEAR + PzX * PzAA + PzX * theta * sigma * PzMEBR - alpha * PzX * PzAA + alpha * PzMEAP * PzAA - alpha * PzMEBP * PzMEAP - PzMEBP * sigma * omega * PzMEAR + alpha * PzX * sigma * PzAA - theta * sigma * PzMEBR * PzAA - PzX * sigma * PzAA + PzMEBP * omega * PzMEAR - PzX * sigma * PzMEAP * omega + PzX * PzAB * gamma + PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega - PzX * sigma * beta * omega * PzMEAR - PzX * sigma * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP * omega - PzMEAP * omega * PzMEBP * sigma * alpha + omega * PzMEAR * PzMEBP * sigma * alpha - alpha * sigma * PzMEBP * beta * omega * PzMEAR - alpha * PzMEBP * omega * PzMEAR + alpha * PzMEBP * PzMEAP * omega + alpha * omega * PzMEAR * PzAA - alpha * PzMEAP * omega * PzAA + PzMEBP * alpha * PzX + PzMEBP * sigma * PzAA - PzMEBP * sigma * alpha * PzX - PzMEBP * PzAA - beta * omega * PzAB * PzAA + alpha * PzMEBP * beta * omega * PzMEAR - PzMEAP * PzAA + alpha * sigma * PzMEBP * PzMEAP + PzMEAP * omega * PzAA - beta * omega * PzX * PzAA + PzMEBP * PzAA * beta * omega + PzAB * PzAA - sigma * PzMEBP * PzAA * beta * omega - sigma * PzMEAP * theta * PzX + sigma * PzMEAP * omega * theta * PzX + sigma * PzMEAP * theta * PzAA + sigma * beta * omega * theta * PzMEBR * PzAA - PzMEBP * sigma * gamma * PzMEAP * omega - sigma * theta * PzMEBR * PzX * beta * omega - sigma * alpha * PzMEAP * PzAA - sigma * alpha * beta * omega * PzX * PzAA + sigma * alpha * beta * omega * PzMEAR * PzAA + PzMEBP * sigma * gamma * PzMEAP + PzMEBP * gamma * PzMEAP * omega + sigma * alpha * beta * omega * PzMEBP * PzX - sigma * PzMEAP * omega * theta * PzAA + sigma * alpha * PzMEAP * omega * PzAA - sigma * alpha * omega * PzMEAR * PzAA + sigma * beta * omega * PzX * PzAA + sigma * omega * PzMEAR * theta * PzAA - sigma * beta * omega * PzMEAR * theta * PzAA + sigma * theta * beta * omega * PzMEAR * PzX - sigma * theta * omega * PzMEAR * PzX - PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega + PzMEBP * PzMEAP - PzAB * gamma * PzAA - PzMEBP * sigma * PzMEAP - alpha * gamma * PzMEAP * PzAA - PzMEBP * PzMEAP * omega + PzMEBP * sigma * PzMEAP * omega - PzX * gamma * PzAA - gamma * PzMEAP * omega * PzAA + PzX * gamma * omega * PzAA - gamma * omega * PzMEBP * PzAA + sigma * PzX * gamma * PzAA - sigma * gamma * PzMEBP * PzAA + alpha * PzX * gamma * PzAA + alpha * PzMEBP * gamma * PzMEAP + gamma * PzMEBP * PzAA + alpha * PzX * gamma * omega * PzMEBP + alpha * sigma * PzMEBP * gamma * PzMEAP * omega - alpha * PzX * gamma * PzMEBP - alpha * PzMEBP * gamma * PzMEAP * omega - alpha * PzX * gamma * omega * PzAA + alpha * gamma * PzMEAP * omega * PzAA - gamma * PzMEAP * PzMEBP * sigma * alpha - sigma * gamma * PzMEAP * omega * theta * PzX - sigma * PzMEBR * gamma * omega * theta * PzAA + gamma * PzMEAP * PzAA + sigma * PzMEBR * gamma * theta * PzAA - sigma * alpha * PzX * gamma * PzAA + sigma * alpha * PzX * gamma * PzMEBP - sigma * PzX * gamma * omega * PzAA + sigma * alpha * gamma * PzMEAP * PzAA + sigma * gamma * PzMEAP * omega * theta * PzAA + sigma * gamma * PzMEAP * theta * PzX - sigma * alpha * PzX * gamma * omega * PzMEBP + sigma * theta * PzMEBR * PzX * gamma * omega - sigma * alpha * gamma * PzMEAP * omega * PzAA + sigma * alpha * PzX * gamma * omega * PzAA - sigma * theta * PzMEBR * PzX * gamma - sigma * gamma * PzMEAP * theta * PzAA + sigma * gamma * omega * PzMEBP * PzAA + PzAB * gamma * omega * PzAA - omega * PzMEAR * PzAA + beta * omega * PzMEAR * PzAA) / (PzMEBP - PzMEBP * sigma + PzX * sigma - PzX) / (gamma * PzMEAP - PzAB * gamma + beta * omega * PzMEAR + PzAB - PzMEAP - gamma * PzMEAP * omega - omega * PzMEAR - beta * omega * PzAB + PzMEAP * omega + PzAB * gamma * omega)
}

async function AB_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return -AA * (-PzMEBP * beta * omega * PzMEAR + PzX * sigma * PzMEAP - alpha * beta * omega * PzMEBP * PzX - alpha * beta * omega * PzMEAR * PzAA + alpha * beta * omega * PzX * PzAA + PzX * sigma * omega * PzMEAR + PzX * PzAA + PzX * theta * sigma * PzMEBR - alpha * PzX * PzAA + alpha * PzMEAP *
                    PzAA - alpha * PzMEBP * PzMEAP - PzMEBP * sigma * omega * PzMEAR + alpha * PzX * sigma * PzAA - theta * sigma * PzMEBR * PzAA - PzX * sigma * PzAA + PzMEBP * omega * PzMEAR - PzX * sigma * PzMEAP * omega + PzX * beta * omega * PzMEAR + PzMEBP * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP *
                    omega - PzX * sigma * beta * omega * PzMEAR + PzX * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP * omega - PzMEAP * omega * PzMEBP * sigma * alpha + omega * PzMEAR * PzMEBP * sigma * alpha - alpha * sigma * PzMEBP * beta * omega * PzMEAR - alpha * PzMEBP * omega *
                    PzMEAR + alpha * PzMEBP * PzMEAP * omega + alpha * omega * PzMEAR * PzAA - alpha * PzMEAP * omega * PzAA + PzMEBP * alpha * PzX + PzMEBP * sigma * PzAA - PzMEBP * sigma * alpha * PzX - PzMEBP * PzAA + alpha * PzMEBP * beta * omega * PzMEAR + alpha * sigma * PzMEBP * PzMEAP - beta * omega * PzX *
                    PzAA + PzMEBP * PzAA * beta * omega - sigma * PzMEBP * PzAA * beta * omega - sigma * PzMEAP * theta * PzX + sigma * PzMEAP * omega * theta * PzX + sigma * PzMEAP * theta * PzAA + sigma * beta * omega * theta * PzMEBR * PzAA - PzMEBP * sigma * gamma * PzMEAP * omega - sigma * theta * PzMEBR * PzX *
                    beta * omega - sigma * alpha * PzMEAP * PzAA - sigma * alpha * beta * omega * PzX * PzAA + sigma * alpha * beta * omega * PzMEAR * PzAA + PzMEBP * sigma * gamma * PzMEAP + PzMEBP * gamma * PzMEAP * omega + sigma * alpha * beta * omega * PzMEBP * PzX - sigma * PzMEAP * omega * theta * PzAA + sigma *
                    alpha * PzMEAP * omega * PzAA - sigma * alpha * omega * PzMEAR * PzAA + sigma * beta * omega * PzX * PzAA + sigma * omega * PzMEAR * theta * PzAA - sigma * beta * omega * PzMEAR * theta * PzAA + sigma * theta * beta * omega * PzMEAR * PzX - sigma * theta * omega * PzMEAR * PzX - PzMEBP * gamma *
                    PzMEAP + PzMEBP * PzMEAP - PzMEBP * sigma * PzMEAP - alpha * gamma * PzMEAP * PzAA - PzMEBP * PzMEAP * omega - omega * PzMEAR * PzX - PzMEAP * PzX + PzMEBP * sigma * PzMEAP * omega - PzX * gamma * PzAA + PzMEAP * omega * PzX + PzX * gamma * omega * PzAA - gamma * omega * PzMEBP * PzAA + sigma * PzX *
                    gamma * PzAA - sigma * gamma * PzMEBP * PzAA + alpha * PzX * gamma * PzAA + alpha * PzMEBP * gamma * PzMEAP + gamma * PzMEBP * PzAA + alpha * PzX * gamma * omega * PzMEBP + alpha * sigma * PzMEBP * gamma * PzMEAP * omega - alpha * PzX * gamma * PzMEBP - alpha * PzMEBP * gamma * PzMEAP * omega -
                    alpha * PzX * gamma * omega * PzAA + alpha * gamma * PzMEAP * omega * PzAA - gamma * PzMEAP * PzMEBP * sigma * alpha - sigma * gamma * PzMEAP * omega * theta * PzX - sigma * PzMEBR * gamma * omega * theta * PzAA + sigma * PzMEBR * gamma * theta * PzAA - sigma * alpha * PzX * gamma * PzAA + sigma *
                    alpha * PzX * gamma * PzMEBP - sigma * PzX * gamma * omega * PzAA + sigma * alpha * gamma * PzMEAP * PzAA + sigma * gamma * PzMEAP * omega * theta * PzAA + sigma * gamma * PzMEAP * theta * PzX - sigma * alpha * PzX * gamma * omega * PzMEBP + sigma * theta * PzMEBR * PzX * gamma * omega - sigma *
                    alpha * gamma * PzMEAP * omega * PzAA + sigma * alpha * PzX * gamma * omega * PzAA - sigma * theta * PzMEBR * PzX * gamma - sigma * gamma * PzMEAP * theta * PzAA + sigma * gamma * omega * PzMEBP * PzAA) / (PzMEBP - PzMEBP * sigma + PzX * sigma - PzX) / (gamma * PzMEAP - PzAB * gamma + beta * omega * PzMEAR + PzAB - PzMEAP - gamma * PzMEAP * omega - omega * PzMEAR - beta * omega * PzAB + PzMEAP * omega + PzAB * gamma * omega)
}

async function MEBR_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return -sigma * (PzAA - PzX) * AA / (PzMEBP - PzMEBP * sigma + PzX * sigma - PzX)
}

async function PzMA_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return (PzAB * gamma * omega * PzMEBP * PzAA + PzAA * PzX * sigma * gamma * PzMEAP - PzAA * PzX * sigma * gamma * PzMEAP * omega - PzAB * gamma * omega * PzMEBP * sigma * PzAA + PzAB * gamma * PzMEBP * sigma * PzAA - gamma * PzMEAP * PzX * PzAA - PzAB * gamma * PzMEBP * PzAA - PzAA * PzX * PzAB + PzMEBP *
               sigma * omega * PzMEAR * PzAB + PzMEBP * sigma * PzMEAP * PzAB - PzMEBP * sigma * PzMEAP * omega * PzAB + beta * omega * PzX * PzAB * PzAA - beta * omega * PzMEAR * PzX * PzAA - PzMEBP * sigma * PzAA * beta * omega * PzMEAR + PzMEBP * sigma * PzAA * beta * omega * PzAB + PzAA * PzMEBP * PzAB + alpha * PzMEAP *
               PzMEBP * PzAB + alpha * PzX * sigma * PzMEBP * PzMEAP + omega * PzMEAR * theta * sigma * PzMEBR * PzAA - omega * PzMEAR * PzAB * alpha * PzAA - omega * PzMEAR * PzMEBP * alpha * PzX - omega * PzMEAR * PzX * sigma * PzAB + omega * PzMEAR * PzMEBP * sigma * alpha * PzX + omega * PzMEAR * PzAB * alpha * sigma *
               PzAA - omega * PzMEAR * PzAB * theta * sigma * PzAA - PzAB * alpha * PzMEBP * sigma * omega * PzMEAR + PzAB * alpha * PzMEBP * omega * PzMEAR + alpha * PzAA * omega * PzMEAR * PzX + PzMEAP * omega * PzAB * theta * sigma * PzAA - alpha * PzMEAP * PzMEBP * sigma * PzAB + alpha * PzMEAP * PzX * PzAA - PzMEAP *
               omega * PzMEBP * sigma * alpha * PzX - PzMEAP * omega * theta * sigma * PzMEBR * PzAA + PzMEAP * omega * alpha * PzX * sigma * PzAA + PzMEAP * omega * PzAB * alpha * PzAA + PzMEAP * omega * PzMEBP * alpha * PzX + PzMEAP * omega * PzX * sigma * PzAB + PzMEAP * omega * PzMEBP * sigma * PzAB * alpha - PzMEAP *
               omega * PzAB * alpha * sigma * PzAA - PzMEAP * omega * PzMEBP * PzAB * alpha - PzMEAP * omega * alpha * PzX * PzAA - alpha * PzMEAP * PzX * sigma * PzAA - alpha * PzAA * PzX * sigma * omega * PzMEAR - PzMEAP * PzAB * alpha * PzAA - PzMEAP * PzMEBP * alpha * PzX - PzMEAP * PzX * sigma * PzAB - PzAA * PzMEBP *
               sigma * PzAB + PzAA * PzX * sigma * PzAB + PzMEAP * theta * sigma * PzMEBR * PzAA + PzMEAP * PzAB * alpha * sigma * PzAA - PzMEAP * PzAB * theta * sigma * PzAA + gamma * PzMEAP * omega * PzX * PzAA + PzMEBP * PzAB * PzMEAP * omega - PzMEBP * PzAB * omega * PzMEAR - PzMEBP * PzAB * PzMEAP + PzAB * gamma * PzX *
               PzAA + PzMEAP * PzX * PzAB * theta * sigma - PzMEBP * PzAA * beta * omega * PzAB + PzMEBP * PzAA * beta * omega * PzMEAR + PzMEBP * sigma * PzAA * gamma * PzMEAP * omega - PzMEBP * sigma * PzAA * gamma * PzMEAP + PzMEBP * PzAA * gamma * PzMEAP - PzAB * gamma * PzX * sigma * PzAA - PzMEBP * PzAA * gamma * PzMEAP *
               omega + PzAB * gamma * omega * PzX * sigma * PzAA - PzAB * gamma * omega * PzX * PzAA + PzMEAP * PzX * PzAB + omega * PzMEAR * PzX * PzAB * theta * sigma - omega * PzMEAR * PzX * theta * sigma * PzMEBR - PzMEAP * omega * PzX * PzAB * theta * sigma + PzMEAP * omega * PzX * theta * sigma * PzMEBR + PzAB * omega * PzMEAR *
               PzX - PzAB * PzMEAP * omega * PzX - PzMEAP * PzX * theta * sigma * PzMEBR + PzAA * PzX * sigma * beta * omega * PzMEAR - PzAA * PzX * sigma * PzAB * beta * omega) / (PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR - PzX * PzAA - PzX * theta * sigma * PzMEBR + alpha * PzX * PzAA + PzMEBP * sigma * omega * PzMEAR - alpha * PzX * sigma * PzAA + theta * sigma * PzMEBR * PzAA + PzX * sigma * PzAA + PzX * PzAB * theta * sigma - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega - PzMEBP * alpha * PzX + PzMEBP * PzAB * alpha - PzMEBP * sigma * PzAA - PzAB * alpha * PzAA + PzMEBP * sigma * alpha * PzX - PzMEBP * sigma * PzAB * alpha + PzAB * alpha * sigma * PzAA - PzAB * theta * sigma * PzAA + PzMEBP * PzAA + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX)
}

async function MEAP_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return -AA * (-PzMEBP * PzAB + PzMEBP * sigma * alpha * PzX + PzMEBP * PzAB * alpha + PzMEBP * sigma * PzAB - PzMEBP * sigma * PzAA + PzX * PzAB + PzX * PzAB * theta * sigma + theta * sigma * PzMEBR * PzAA - alpha * PzX * sigma * PzAA - PzAB * alpha * PzAA - PzMEBP * alpha * PzX - PzX * sigma * PzAB + PzX * sigma * PzAA - PzMEBP * sigma * PzAB * alpha - PzX * PzAA - PzX * theta * sigma * PzMEBR + PzAB * alpha * sigma * PzAA + alpha * PzX * PzAA - PzAB * theta * sigma * PzAA + PzMEBP * PzAA) * (-1 + omega) / (PzMEBP * PzAB - PzMEBP * sigma * PzAB - PzX * PzAB + PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR + PzMEBP * sigma * omega * PzMEAR - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR + PzX * sigma * PzAB - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX)
}

async function MEAR_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return omega * AA * (-PzMEBP * PzAB + PzMEBP * sigma * alpha * PzX + PzMEBP * PzAB * alpha + PzMEBP * sigma * PzAB - PzMEBP * sigma * PzAA + PzX * PzAB + PzX * PzAB * theta * sigma + theta * sigma * PzMEBR * PzAA - alpha * PzX * sigma * PzAA - PzAB * alpha * PzAA - PzMEBP * alpha * PzX - PzX * sigma * PzAB + PzX * sigma * PzAA - PzMEBP * sigma * PzAB * alpha - PzX * PzAA - PzX * theta * sigma * PzMEBR + PzAB * alpha * sigma * PzAA + alpha * PzX * PzAA - PzAB * theta * sigma * PzAA + PzMEBP * PzAA) / (PzMEBP * PzAB - PzMEBP * sigma * PzAB - PzX * PzAB + PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR + PzMEBP * sigma * omega * PzMEAR - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR + PzX * sigma * PzAB - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX)
}

async function MEAT_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return AA * (-PzMEBP * PzAB + PzMEBP * sigma * alpha * PzX + PzMEBP * PzAB * alpha + PzMEBP * sigma * PzAB - PzMEBP * sigma * PzAA + PzX * PzAB + PzX * PzAB * theta * sigma + theta * sigma * PzMEBR * PzAA - alpha * PzX * sigma * PzAA - PzAB * alpha * PzAA - PzMEBP * alpha * PzX - PzX * sigma * PzAB + PzX * sigma * PzAA - PzMEBP * sigma * PzAB * alpha - PzX * PzAA - PzX * theta * sigma * PzMEBR + PzAB * alpha * sigma * PzAA + alpha * PzX * PzAA - PzAB * theta * sigma * PzAA + PzMEBP * PzAA) / (PzMEBP * PzAB - PzMEBP * sigma * PzAB - PzX * PzAB + PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR + PzMEBP * sigma * omega * PzMEAR - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR + PzX * sigma * PzAB - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX)
}

async function MA_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return AA * (PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR - PzX * PzAA - PzX * theta * sigma * PzMEBR + alpha * PzX * PzAA + PzMEBP * sigma * omega * PzMEAR - alpha * PzX * sigma * PzAA + theta * sigma * PzMEBR * PzAA + PzX * sigma * PzAA + PzX * PzAB * theta * sigma - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega - PzMEBP * alpha * PzX + PzMEBP * PzAB * alpha - PzMEBP * sigma * PzAA - PzAB * alpha * PzAA + PzMEBP * sigma * alpha * PzX - PzMEBP * sigma * PzAB * alpha + PzAB * alpha * sigma * PzAA - PzAB * theta * sigma * PzAA + PzMEBP * PzAA + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX) / (PzMEBP * PzAB - PzMEBP * sigma * PzAB - PzX * PzAB + PzMEBP * beta * omega * PzMEAR - PzX * sigma * PzMEAP - PzX * sigma * omega * PzMEAR + PzMEBP * sigma * omega * PzMEAR - PzMEBP * omega * PzMEAR + PzX * sigma * PzMEAP * omega + PzMEBP * sigma * PzAB * beta * omega + PzX * PzAB * gamma - PzX * beta * omega * PzMEAR + PzX * sigma * PzAB - PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega + PzX * gamma * PzMEAP * omega + PzX * sigma * beta * omega * PzMEAR - PzX * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP - PzX * sigma * gamma * PzMEAP * omega - PzX * sigma * PzAB * gamma + PzX * sigma * PzAB * gamma * omega - PzMEBP * PzAB * beta * omega + PzMEBP * sigma * PzAB * gamma + PzMEBP * PzAB * gamma * omega - PzMEBP * PzAB * gamma - PzMEBP * sigma * PzAB * gamma * omega + PzMEBP * sigma * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP - PzMEBP * gamma * PzMEAP * omega - PzX * sigma * PzAB * beta * omega + PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega - PzMEBP * PzMEAP + PzMEBP * sigma * PzMEAP + PzMEBP * PzMEAP * omega + omega * PzMEAR * PzX + PzMEAP * PzX - PzMEBP * sigma * PzMEAP * omega - PzMEAP * omega * PzX)
}

async function MEBP_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    return (PzAA - PzX) * AA / (-PzMEBP + PzX)
}

async function MEBT_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
return -(PzAA - PzX) * AA / (PzMEBP - PzMEBP * sigma + PzX * sigma - PzX)
}

async function X_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
return (-PzMEBP + PzAA) * AA / (-PzMEBP + PzX)
}

async function PzMB_2M(PzX, PzMEAR, PzMEAP, PzMEBR, PzMEBP, PzAA, PzAB, alpha, omega, beta, gamma, sigma, theta, AA) {
    let c11 = -alpha * PzAA * PzX * PzAB * gamma * omega + alpha * PzAA * PzX * PzAB * gamma - sigma * PzMEBR * PzX * PzMEAP * 
    omega + sigma * PzX * PzMEBP * PzAB - sigma * PzMEAP * PzMEBP * PzX - sigma * PzMEBR * PzAB * PzX + sigma * PzMEBR * PzX * 
    PzMEAP - sigma * PzMEBR * PzX * beta * omega * PzMEAR + sigma * PzMEBR * PzX * omega * PzMEAR - sigma * beta * omega * PzX * 
    PzMEBP * PzAB + sigma * beta * omega * PzMEAR * PzMEBP * PzX - sigma * omega * PzMEAR * PzMEBP * PzX + sigma * PzMEBR * PzAB * 
    beta * omega * PzX + sigma * PzMEAP * omega * PzMEBP * PzX + PzAA * PzX * PzAB + PzAB * alpha * PzMEBP * beta * omega * PzMEAR - 
    PzMEBP * sigma * omega * PzMEAR * PzAB - PzMEBP * sigma * PzMEAP * PzAB + PzMEBP * sigma * beta * omega * PzMEAR * PzAB + PzMEBP * 
    sigma * PzMEAP * omega * PzAB - PzX * PzMEBP * PzAB + PzMEAP * PzMEBP * PzX + PzAB * gamma * theta * sigma * PzMEBR * PzAA - PzAB * 
    gamma * PzX * theta * sigma * PzMEBR - gamma * PzMEAP * PzAB * alpha * PzAA - alpha * PzX * PzMEBP * sigma * PzAB + gamma * omega * 
    theta * sigma * PzMEBR * PzX * PzAB + gamma * PzMEAP * PzMEBP * PzAB * alpha - PzAB * gamma * omega * theta * sigma * PzMEBR * PzAA - 
    gamma * PzMEAP * omega * PzAB * alpha * sigma * PzAA + gamma * PzMEAP * omega * PzAB * theta * sigma * PzAA + gamma * PzMEAP * omega * 
    PzAB * alpha * PzAA + gamma * PzMEAP * PzAB * alpha * sigma * PzAA - gamma * PzMEAP * PzAB * theta * sigma * PzAA - gamma * PzMEAP * 
    PzMEBP * sigma * PzAB * alpha + alpha * PzAA * PzX * sigma * PzAB * gamma * omega - alpha * PzAA * PzX * sigma * PzAB * gamma + PzAB * alpha * 
    PzMEBP * sigma * gamma * PzMEAP * omega - PzAB * alpha * PzMEBP * gamma * PzMEAP * omega - beta * omega * PzX * PzAB * PzAA - PzMEBP * sigma * 
    PzAA * beta * omega * PzMEAR + PzMEBP * sigma * PzAA * omega * PzMEAR + PzMEBP * sigma * PzAA * PzMEAP - sigma * PzMEBR * PzAB * gamma * omega * 
    PzX + sigma * PzMEBR * gamma * PzMEAP * PzAA - alpha * PzMEAP * PzMEBP * PzAB + alpha * PzX * sigma * PzMEBP * PzAB * beta * omega + omega * 
    PzMEAR * PzAB * alpha * PzAA + omega * PzMEAR * PzX * sigma * PzAB - omega * PzMEAR * PzAB * alpha * sigma * PzAA + omega * PzMEAR * PzAB * 
    theta * sigma * PzAA + PzAB * alpha * PzMEBP * sigma * omega * PzMEAR - PzAB * alpha * PzMEBP * omega * PzMEAR - alpha * PzAA * PzX * sigma * 
    PzAB * beta * omega + alpha * PzAA * PzX * PzAB * beta * omega - PzAB * alpha * PzMEBP * sigma * beta * omega * PzMEAR - PzMEAP * omega * PzAB * 
    theta * sigma * PzAA + alpha * PzMEAP * PzMEBP * sigma * PzAB - alpha * PzAA * PzX * PzAB + alpha * PzX * PzMEBP * PzAB - PzMEAP * omega * PzAB * 
    alpha * PzAA - PzMEAP * omega * PzX * sigma * PzAB - PzMEAP * omega * PzMEBP * sigma * PzAB * alpha + PzMEAP * omega * PzAB * alpha * sigma * PzAA
    
    let C1 = (c11 + PzMEAP * omega * PzMEBP * PzAB * alpha + alpha * PzAA * PzX * sigma * PzAB + beta * omega * PzAB * theta * sigma * PzMEBR * PzAA - beta * 
        omega * PzAB * PzMEBP * alpha * PzX - beta * omega * PzAB * PzX * theta * sigma * PzMEBR + theta * sigma * PzMEBR * PzX * PzAB + beta * omega * PzMEAR * 
        PzX * PzAB + beta * omega * PzMEAR * PzX * PzAB * theta * sigma - beta * omega * PzMEAR * PzAB * alpha * PzAA + beta * omega * PzMEAR * PzAB * alpha * 
        sigma * PzAA - beta * omega * PzMEAR * PzAB * theta * sigma * PzAA + PzMEAP * PzAB * alpha * PzAA + PzMEAP * PzX * sigma * PzAB - PzAA * PzX * sigma * 
        PzAB - PzMEAP * PzAB * alpha * sigma * PzAA + PzMEAP * PzAB * theta * sigma * PzAA - sigma * gamma * PzMEAP * omega * PzMEBP * PzX - sigma * gamma * 
        PzX * PzMEBP * PzAB - PzAB * theta * sigma * PzMEBR * PzAA - PzMEBP * sigma * PzAA * PzMEAP * omega + sigma * PzMEBR * PzAB * gamma * PzX - sigma * 
        PzMEBR * PzX * gamma * PzMEAP + sigma * PzMEBR * PzAB * PzAA - sigma * PzMEBR * PzMEAP * PzAA - PzMEBP * PzAB * PzMEAP * omega + PzMEBP * PzAB * 
        omega * PzMEAR + PzMEBP * PzAB * PzMEAP + gamma * PzMEAP * PzX * PzAB - PzAB * gamma * PzX * PzAA - gamma * PzMEAP * PzMEBP * PzX + gamma * PzX * 
        PzMEBP * PzAB - PzMEBP * PzAB * beta * omega * PzMEAR - sigma * PzMEBR * omega * PzMEAR * PzAA + sigma * PzMEBR * PzMEAP * omega * PzAA - sigma * 
        PzMEBR * PzAB * beta * omega * PzAA + sigma * PzMEBR * beta * omega * PzMEAR * PzAA - PzMEBP * PzAA * PzMEAP - PzMEAP * PzX * PzAB * theta * sigma + 
        sigma * PzMEBR * PzX * gamma * PzMEAP * omega - PzMEBP * sigma * gamma * PzMEAP * omega * PzAB - alpha * PzX * sigma * PzMEBP * PzAB * gamma * omega + 
        gamma * omega * alpha * PzX * PzMEBP * PzAB + PzAB * gamma * PzMEBP * sigma * alpha * PzX + PzMEBP * PzAA * beta * omega * PzMEAR - PzMEBP * PzAA * omega * 
        PzMEAR + PzMEBP * PzAA * PzMEAP * omega - sigma * PzMEBR * gamma * PzMEAP * omega * PzAA + PzMEBP * sigma * PzAA * gamma * PzMEAP * omega - PzMEBP * sigma * 
        PzAA * gamma * PzMEAP + PzMEBP * PzAA * gamma * PzMEAP - PzAB * gamma * PzMEBP * alpha * PzX + PzAB * gamma * PzX * sigma * PzAA + sigma * gamma * omega * 
        PzX * PzMEBP * PzAB + sigma * PzMEBR * PzAB * gamma * omega * PzAA + PzMEBP * sigma * gamma * PzMEAP * PzAB + PzAB * PzX * sigma * gamma * PzMEAP * omega - 
        PzMEBP * PzAA * gamma * PzMEAP * omega - gamma * omega * PzX * PzMEBP * PzAB + gamma * PzMEAP * omega * PzMEBP * PzX + gamma * PzMEAP * PzX * PzAB * theta * 
        sigma - PzAB * PzX * gamma * PzMEAP * omega - PzAB * PzX * sigma * gamma * PzMEAP - PzAB * gamma * omega * PzX * sigma * PzAA - PzMEBP * PzAB * gamma * PzMEAP - 
        gamma * PzMEAP * omega * PzX * PzAB * theta * sigma + PzAB * gamma * omega * PzX * PzAA - sigma * PzMEBR * PzAB * gamma * PzAA + PzMEBP * PzAB * gamma * PzMEAP * 
        omega - PzMEAP * omega * PzMEBP * PzX + omega * PzMEAR * PzMEBP * PzX + beta * omega * PzX * PzMEBP * PzAB - beta * omega * PzMEAR * PzMEBP * PzX - PzMEAP * PzX * 
        PzAB - omega * PzMEAR * PzX * PzAB * theta * sigma + PzMEAP * omega * PzX * PzAB * theta * sigma - PzAB * omega * PzMEAR * PzX + PzAB * PzMEAP * omega * PzX + PzAA * 
        PzX * sigma * PzAB * beta * omega - PzAB * PzX * sigma * beta * omega * PzMEAR + sigma * gamma * PzMEAP * PzMEBP * PzX)
    
    return C1 / (-PzX * PzAB - PzMEBP * beta * omega * PzMEAR + PzX * sigma * PzMEAP - alpha * beta * omega * PzMEBP * PzX - alpha * beta * omega * PzMEAR * PzAA + 
        alpha * beta * omega * PzX * PzAA + PzX * sigma * omega * PzMEAR + PzX * PzAA + PzX * theta * sigma * PzMEBR - alpha * PzX * PzAA + alpha * PzMEAP * PzAA - 
        alpha * PzMEBP * PzMEAP - PzMEBP * sigma * omega * PzMEAR + alpha * PzX * sigma * PzAA - theta * sigma * PzMEBR * PzAA - PzX * sigma * PzAA + PzMEBP * 
        omega * PzMEAR - PzX * sigma * PzMEAP * omega + PzX * PzAB * gamma + PzMEBP * sigma * beta * omega * PzMEAR - PzX * PzAB * gamma * omega - PzX * sigma * 
        beta * omega * PzMEAR - PzX * sigma * gamma * PzMEAP + PzX * sigma * gamma * PzMEAP * omega - PzMEAP * omega * PzMEBP * sigma * alpha + omega * PzMEAR * 
        PzMEBP * sigma * alpha - alpha * sigma * PzMEBP * beta * omega * PzMEAR - alpha * PzMEBP * omega * PzMEAR + alpha * PzMEBP * PzMEAP * omega + alpha * 
        omega * PzMEAR * PzAA - alpha * PzMEAP * omega * PzAA + PzMEBP * alpha * PzX + PzMEBP * sigma * PzAA - PzMEBP * sigma * alpha * PzX - PzMEBP * PzAA - beta * 
        omega * PzAB * PzAA + alpha * PzMEBP * beta * omega * PzMEAR - PzMEAP * PzAA + alpha * sigma * PzMEBP * PzMEAP + PzMEAP * omega * PzAA - beta * omega * PzX * 
        PzAA + PzMEBP * PzAA * beta * omega + PzAB * PzAA - sigma * PzMEBP * PzAA * beta * omega - sigma * PzMEAP * theta * PzX + sigma * PzMEAP * omega * theta * 
        PzX + sigma * PzMEAP * theta * PzAA + sigma * beta * omega * theta * PzMEBR * PzAA - PzMEBP * sigma * gamma * PzMEAP * omega - sigma * theta * PzMEBR * PzX * 
        beta * omega - sigma * alpha * PzMEAP * PzAA - sigma * alpha * beta * omega * PzX * PzAA + sigma * alpha * beta * omega * PzMEAR * PzAA + PzMEBP * sigma * gamma * 
        PzMEAP + PzMEBP * gamma * PzMEAP * omega + sigma * alpha * beta * omega * PzMEBP * PzX - sigma * PzMEAP * omega * theta * PzAA + sigma * alpha * PzMEAP * omega * 
        PzAA - sigma * alpha * omega * PzMEAR * PzAA + sigma * beta * omega * PzX * PzAA + sigma * omega * PzMEAR * theta * PzAA - sigma * beta * omega * PzMEAR * theta * 
        PzAA + sigma * theta * beta * omega * PzMEAR * PzX - sigma * theta * omega * PzMEAR * PzX - PzMEBP * gamma * PzMEAP + PzX * PzAB * beta * omega + PzMEBP * PzMEAP - 
        PzAB * gamma * PzAA - PzMEBP * sigma * PzMEAP - alpha * gamma * PzMEAP * PzAA - PzMEBP * PzMEAP * omega + PzMEBP * sigma * PzMEAP * omega - PzX * gamma * PzAA - gamma * 
        PzMEAP * omega * PzAA + PzX * gamma * omega * PzAA - gamma * omega * PzMEBP * PzAA + sigma * PzX * gamma * PzAA - sigma * gamma * PzMEBP * PzAA + alpha * PzX * gamma * 
        PzAA + alpha * PzMEBP * gamma * PzMEAP + gamma * PzMEBP * PzAA + alpha * PzX * gamma * omega * PzMEBP + alpha * sigma * PzMEBP * gamma * PzMEAP * omega - alpha * PzX * 
        gamma * PzMEBP - alpha * PzMEBP * gamma * PzMEAP * omega - alpha * PzX * gamma * omega * PzAA + alpha * gamma * PzMEAP * omega * PzAA - gamma * PzMEAP * PzMEBP * 
        sigma * alpha - sigma * gamma * PzMEAP * omega * theta * PzX - sigma * PzMEBR * gamma * omega * theta * PzAA + gamma * PzMEAP * PzAA + sigma * PzMEBR * gamma * 
        theta * PzAA - sigma * alpha * PzX * gamma * PzAA + sigma * alpha * PzX * gamma * PzMEBP - sigma * PzX * gamma * omega * PzAA + sigma * alpha * gamma * PzMEAP * 
        PzAA + sigma * gamma * PzMEAP * omega * theta * PzAA + sigma * gamma * PzMEAP * theta * PzX - sigma * alpha * PzX * gamma * omega * PzMEBP + sigma * theta * PzMEBR * 
        PzX * gamma * omega - sigma * alpha * gamma * PzMEAP * omega * PzAA + sigma * alpha * PzX * gamma * omega * PzAA - sigma * theta * PzMEBR * PzX * gamma - sigma * 
        gamma * PzMEAP * theta * PzAA + sigma * gamma * omega * PzMEBP * PzAA + PzAB * gamma * omega * PzAA - omega * PzMEAR * PzAA + beta * omega * PzMEAR * PzAA)
}

async function AL_MA(){
    let brixMassaXaropeToMassaA = await getValue('brixMassaXaropeToMassaA')
    let flowXaropeToMassaA = await getValue('flowXaropeToMassaA')
    let purezaXaropeToMassaA = await getValue('purezaXaropeToMassaA')
    let brixXaropeToMassaA = await getValue('brixXaropeToMassaA')

    let brixMassaMagma = await getValue('brixMassaMagma')
    let flowMagma = await getValue('flowMagma')
    let purezaMagma = await getValue('purezaMagma')
    let brixMagma = await getValue('brixMagma')

    let brixMassaMelARicoToMassaA = await getValue('brixMassaMelARicoToMassaA')
    let flowMelARicoToMassaA = await getValue('flowMelARicoToMassaA')
    let purezaMelARico = await getValue('purezaMelARico')
    let brixMelARico = await getValue('brixMelARico')

    let flowMelAPobreToMassaA = await getValue('flowMelAPobreToMassaA')
    let brixMassaMelAPobreToMassaA = await getValue('brixMassaMelAPobreToMassaA')
    let purezaMelAPobre = await getValue('purezaMelAPobre')
    let brixMelAPobre = await getValue('brixMelAPobre')

    let brixMassa = brixMassaXaropeToMassaA + brixMassaMelARicoToMassaA + brixMassaMagma + brixMassaMelAPobreToMassaA
    let flow = flowXaropeToMassaA + flowMelARicoToMassaA + flowMagma + flowMelAPobreToMassaA
    let brix = (flowXaropeToMassaA * brixXaropeToMassaA + flowMelARicoToMassaA * brixMelARico + flowMagma * brixMagma + flowMelAPobreToMassaA * brixMelAPobre) / flow
    let pureza = (flowXaropeToMassaA * purezaXaropeToMassaA + flowMelARicoToMassaA * purezaMelARico + flowMagma * purezaMagma + flowMelAPobreToMassaA * purezaMelAPobre) / flow

    setValue('brixMassaAlimMassaA', brixMassa)
    setValue('flowAlimMassaA', flow)
    setValue('brixAlimMassaA', brix)
    setValue('purezaAlimMassaA', pureza)
}

async function AL_MB(){
    let flowMAPDiluido = await getValue('flowMAPDiluido')
    let brixMassaMAPDiluido = await getValue('brixMassaMAPDiluido')
    let brixMAPDiluido = await getValue('brixMAPDiluido')
    let purezaMAPDiluido = await getValue('purezaMAPDiluido')

    let brixMassaXaropeToMassaB = await getValue('brixMassaXaropeToMassaB')
    let flowXaropeToMassaB = await getValue('flowXaropeToMassaB')
    let purezaXaropeToMassaB = await getValue('purezaXaropeToMassaB')
    let brixXaropeToMassaB = await getValue('brixXaropeToMassaB')
    
    let flow = flowMAPDiluido + flowXaropeToMassaB
    let brixMassa = brixMassaMAPDiluido + brixMassaXaropeToMassaB
    let brix = (brixMAPDiluido * flowMAPDiluido + brixXaropeToMassaB * flowXaropeToMassaB) / flow
    let pureza = (purezaMAPDiluido * flowMAPDiluido + purezaXaropeToMassaB * flowXaropeToMassaB) / flow
    
    setValue('brixMassaAlimMassaB', brixMassa)
    setValue('flowAlimMassaB', flow)
    setValue('brixAlimMassaB', brix)
    setValue('purezaAlimMassaB', pureza)
}
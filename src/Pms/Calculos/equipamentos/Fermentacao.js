const { setValue, getValue } = require('../../db/funcsDb')
const { TorreResfMosto, TorreResfDornas } = require('./TorresResfriamento')

module.exports = {
    Fermentacao,
}

async function Fermentacao(){
    let now = new Date()
    //INPUTS
    let artMassaXarope = await getValue('artMassaXarope')
    let brixXarope = await getValue('brixXarope')
    let artMassaMelFinal = await getValue('artMassaMelFinal')
    let flowMelFinal = await getValue('flowMelFinal')
    let brixMelFinal = await getValue('brixMelFinal')
    let tempMelFinal = await getValue('tempMelFinal')
    let artMassaCaldoToFerm = await getValue('artMassaCaldoToFerm')
    let flowCaldoToFerm = await getValue('flowCaldoToFerm')
    let tempCaldoToFerm = await getValue('tempCaldoToFerm')
    let brixCaldoToFerm = await getValue('brixCaldoToFerm')
    let brixMosto = await getValue('brixMosto')
    
    let massaArtSangriaCaldo3Ef = await getValue('massaArtSangriaCaldo3Ef') 
    let flowSangriaCaldo3Ef = await getValue('flowSangriaCaldo3Ef')
    let tempSangriaCaldo3Ef = await getValue('tempSangriaCaldo3Ef')
    let brixCaldo3EfAc = await getValue('brixCaldo3EfAc')
    let flowXaropeToFerm = await getValue('flowXaropeToFerm')
    let tempXaropeToFerm = await getValue('tempXaropeToFerm')
    let desvioXaropeToEtanol = await getValue('desvioXaropeToEtanol')
    let tempAguaDilMosto = await getValue('tempAguaDilMosto')
    let massaArtXarope = artMassaXarope * desvioXaropeToEtanol / 100
    
    let artMassaMosto = artMassaMelFinal + massaArtSangriaCaldo3Ef + massaArtXarope + artMassaCaldoToFerm
    let flowMosto = (flowMelFinal * brixMelFinal + flowSangriaCaldo3Ef * brixCaldo3EfAc + flowXaropeToFerm * brixXarope + flowCaldoToFerm * brixCaldoToFerm) / brixMosto
    var flowAgua = flowMosto - flowMelFinal - flowSangriaCaldo3Ef - flowXaropeToFerm - flowCaldoToFerm
    
    if (flowAgua < 0){
        flowAgua = 0.0
        flowMosto = flowMelFinal + flowSangriaCaldo3Ef + flowXaropeToFerm + flowCaldoToFerm
        brixMosto = (flowMelFinal * brixMelFinal + flowSangriaCaldo3Ef * brixCaldo3EfAc + flowXaropeToFerm * brixXarope + flowCaldoToFerm * brixCaldoToFerm.brix) / flowMosto
    }

    setValue('artMassaMosto', artMassaMosto)
    setValue('flowMosto', flowMosto)
    
    let consCondContDilMosto = await getValue('consCondContDilMosto')
    if (consCondContDilMosto > flowAgua){
        consCondContDilMosto = flowAgua
        setValue('consCondContDilMosto', flowAgua)
    }
    let flowCondContDilMosto = consCondContDilMosto
    let consAguaTratPrepMosto = flowAgua - flowCondContDilMosto

    setValue('flowAguaDilMosto', flowAgua)
    setValue('consAguaTratPrepMosto', consAguaTratPrepMosto)
    
    let artMosto = artMassaMosto * 100 / flowMosto
    let tempMosto = (flowMelFinal * tempMelFinal + flowSangriaCaldo3Ef * tempSangriaCaldo3Ef + flowXaropeToFerm * tempXaropeToFerm + flowAgua * tempAguaDilMosto 
        + flowCaldoToFerm * tempCaldoToFerm) / flowMosto
    let densityMosto = (4.303 * brixMosto + 993.74) / 1000
    let flowVolMosto = flowMosto / densityMosto

    setValue('artMosto', artMosto)
    setValue('tempMosto', tempMosto)
    setValue('densityMosto', densityMosto)
    setValue('flowVolMosto', flowVolMosto)
    
    //RESFRIAMENTO MOSTO
    await TorreResfMosto()
    
    //RESFRIAMENTO DORNAS
    await TorreResfDornas()
    
    //FERMENTACAO
    
    //INPUTS
    let concCelVinhoBruto = await getValue('concCelVinhoBruto') 
    let concCelCreme = await getValue('concCelCreme')
    let concCelVinhoCent = await getValue('concCelVinhoCent')
    let taxaReciclo = await getValue('taxaReciclo')
    let rendCelula = await getValue('rendCelula')
    let efFermentacao = await getValue('efFermentacao')
    let flowEtanol = await getValue('flowEtanol')
    
    //CALCULOS FERMENTACAO
    let flowVolEtanolProdFerm = efFermentacao/100 * artMassaMosto * 0.6475 
    let flowEtanolProdFerm = flowVolEtanolProdFerm * 0.79
    let flowCO2 = flowEtanolProdFerm * 0.9565
    
    let flowCelulaProd = flowEtanol * rendCelula / 1000
    let flowfermTratado = (taxaReciclo * flowMosto) / (100 - taxaReciclo)
    let flowAlimFermentacao = flowMosto + flowfermTratado
    let flowVinhoBruto = flowAlimFermentacao - flowCO2
    let flowVolVinhoBruto = flowVinhoBruto / 0.9858
    
    let flowVolVinhoCent = flowVolVinhoBruto * ((concCelVinhoBruto - concCelCreme) / (concCelVinhoCent - concCelCreme))
    let flowVolCreme = flowVolVinhoBruto - flowVolVinhoCent
    let flowCelulaPerdVinhoCent = flowVolVinhoCent  * concCelVinhoCent * 0.3 / 100
    let flowLeveduraSandria = flowCelulaProd - flowCelulaPerdVinhoCent
    let flowVolSangriaLev = flowLeveduraSandria * 100 / (concCelCreme * 0.3)
    let flowVolCremeReciclado = flowVolCreme - flowVolSangriaLev
    
    let flowVolFermTratado = flowfermTratado
    let consAguaTratDiluicaoFerm = flowVolFermTratado - flowVolCremeReciclado
    let concCelFermTratato = flowVolCremeReciclado * concCelCreme / flowVolFermTratado
    let concEtanolVinhoBruto = flowVolEtanolProdFerm / (flowVolVinhoBruto - flowVolCremeReciclado) * 100
    let concEtanolFermTratado = flowVolCremeReciclado * concEtanolVinhoBruto / flowVolFermTratado
    
    let flowAguaLavCO2 = flowCO2 * 1.1
    let flowAguaComplemDilFerm = consAguaTratDiluicaoFerm - flowAguaLavCO2

    setValue('flowAguaLavCO2', flowAguaLavCO2)
    setValue('flowAguaComplemDilFerm', flowAguaComplemDilFerm)
    
    setValue('flowEtanolProdFerm', flowEtanolProdFerm)
    setValue('flowVolEtanolProdFerm', flowVolEtanolProdFerm)
    setValue('flowCO2', flowCO2)
    setValue('flowCelulaProd', flowCelulaProd)
    setValue('flowfermTratado', flowfermTratado)
    setValue('flowAlimFermentacao', flowAlimFermentacao)
    setValue('flowVinhoBruto', flowVinhoBruto)//
    setValue('flowVolVinhoBruto', flowVolVinhoBruto)//
    
    setValue('flowVolVinhoCent', flowVolVinhoCent)
    setValue('flowVinhoCent', flowVolVinhoCent * 0.98355981)
    setValue('flowVolCreme', flowVolCreme)
    setValue('flowCreme', flowVolCreme)
    setValue('flowCelulaPerdVinhoCent', flowCelulaPerdVinhoCent)
    setValue('flowLeveduraSandria', flowLeveduraSandria)
    setValue('flowVolSangriaLev', flowVolSangriaLev)
    setValue('flowVolCremeReciclado', flowVolCremeReciclado)
    
    setValue('flowVolFermTratado', flowVolFermTratado)
    setValue('consAguaTratDiluicaoFerm', consAguaTratDiluicaoFerm)
    setValue('concCelFermTratato', concCelFermTratato)
    setValue('concEtanolFermTratado', concEtanolFermTratado)
    setValue('concEtanolVinhoBruto', concEtanolVinhoBruto)//

    //CAPACIDADE DCENTRIFUGAS
    let qtdeCentrifugas = await getValue('qtdeCentrifugas')
    let eficCentrifugas = await getValue('eficCentrifugas')
    let capacCentrifugas = await getValue('capacCentrifugas')
    setValue('sobraCentrifugas', (qtdeCentrifugas * eficCentrifugas/100 * capacCentrifugas) - flowVolVinhoCent)

    let after =  new Date()
    console.log(`Calculo Fermentacao: ` + (after - now)/1000)
}
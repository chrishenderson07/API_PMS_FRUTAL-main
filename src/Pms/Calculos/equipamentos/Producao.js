const { setValue, getValue, getSumFromKey } = require('../../db/funcsDb')

module.exports = {
    ResumoProd,
    Receita
}

async function ResumoProd(){
    let perdas =  await getSumFromKey('perdaArt') //perdaLavCana + perdaExt + perdaTorta + perdaMultFab + perdaMultiEvap + perdaAgRes + perdaInd
    let flowAcucar = await getValue('flowAcucar')
    let polAcucar = await getValue('polAcucar')
    let artMassaAcucar = await getValue('artMassaAcucar')
    
    let artAcucar = flowAcucar * polAcucar / 100 / 0.95
    
    let efFerm =  await getValue('efFermentacao') 
    let efDest =  await getValue('efDestilaria')
    let rgd = (efFerm/100 * efDest/100) * 100
    let artProcesso = artMassaAcucar * (1 - perdas/100)
    let artEtanol = (artProcesso - artAcucar) * rgd/100
    
    let artProdutos = artAcucar + artEtanol
    let mixAc = artAcucar * 100 / artProdutos
    setValue('mixAcucar', mixAc)
    
    let prodAcTonDia = await getValue('flowAcucarTondia')
    let prodEtanol100Dia = artEtanol * 0.6475 * 24
    let rtc = (prodAcTonDia * 1000 / 0.95 * polAcucar/100 + prodEtanol100Dia * 1000 / (0.6475 * 0.92)) / (artMassaAcucar * 24)/10
    setValue('rtc', rtc)
    
    let efInd = artProdutos * 100 / artMassaAcucar
    setValue('efIndustrial', efInd)
    setValue('artProdutos', artProdutos)
    
    let flowAguaBrutaTotal = await getValue('flowAguaBrutaTotal')
    let flowCana = await getValue('flowCana')
    setValue('consAguaTC', flowAguaBrutaTotal/flowCana)
    setValue('rgd', rgd)
    
    let perdaFermDest = 100 - efInd - perdas
    setValue('perdaFermDest', perdaFermDest)
    setValue('perdaTotalArt', perdas + perdaFermDest)
}

async function Receita(){
    
    let precoAcucar = await getValue('precoAcucar') 
    let precoEtanolHid = await getValue('precoEtanolHid') 
    let precoEtanolAnidro = await getValue('precoEtanolAnidro')
    let precoBagaço = await getValue('precoBagaço')
    let precoEnergia = await getValue('precoEnergia') 
    let precoLevSec = await getValue('precoLevSeca') 
    
    let flowEtanolHid = await getValue('flowEtanolHid') 
    let flowEtanolAnidro = await getValue('flowEtanolAnidro')
    let flowAcucar = await getValue('flowAcucar') 
    let sobraBagaco = await getValue('sobraBagaco') 
    let expEnergia = await getValue('expEnergia') 
    let flowLevSeca = await getValue('flowLeveduraSeca')
    
    
    let receitaAcucar = flowAcucar * precoAcucar*20
    let receitaHidratado = flowEtanolHid * precoEtanolHid
    let receitaAnidro = flowEtanolAnidro * precoEtanolAnidro //- flowEtanolTanqueToDesid * precoEtanolHid
    let receitaEnergia = expEnergia * precoEnergia
    let receitaBagaco = sobraBagaco * precoBagaço
    let receitaLecSec = flowLevSeca * precoLevSec
    
    let receitaTotal = receitaAcucar + receitaHidratado + receitaAnidro + receitaEnergia + receitaBagaco + receitaLecSec
    
    setValue('receitaAcucar', receitaAcucar)
    setValue('receitaHidratado', receitaHidratado)
    setValue('receitaAnidro', receitaAnidro)
    setValue('receitaEnergia', receitaEnergia)
    setValue('receitaBagaco', receitaBagaco)
    setValue('receitaLevSeca', receitaLecSec)
    setValue('receitaTotal', receitaTotal)
}
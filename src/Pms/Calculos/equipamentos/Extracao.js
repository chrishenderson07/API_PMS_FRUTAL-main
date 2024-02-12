
const db = require('../../db/funcsDb');
const { getSumFromKey } = require('../../db/funcsDb')
const { hV_p, hL_p } = require('../modulos/steamTables')
const { AqCascoTuboVL } = require('./aquecimento')
const { FiltracaoLodo, Dosagem, Decantacao } = require('./tratCaldo')
const { FlashAcucar } = require('./tratCaldoAcucar')
const { FlashEtanol } = require('./tratCaldoEtanol')

module.exports = {
  Extracao,
}

async function Extracao(){
  await Difusor()
}

async function Difusor(){
    let now = new Date()
    let flowCana = await db.getValue('flowCana');
    let fibraCana = await db.getValue('fibraCana');
    let artCana = await db.getValue('artCana');
    let arCana = await db.getValue('arCana');
    let purezaCana = await db.getValue('purezaCana');

    //CANA
    let polCana = (artCana - arCana) * 0.95
    let brixCana = purezaCana === 0 ? 0 : polCana * 100 / purezaCana
    let artMassaCana = flowCana * artCana / 100
    db.setValue('polCana', polCana);
    db.setValue('brixCana', brixCana);
    db.setValue('artMassaCana', artMassaCana);
  
    //BAGACO 
    let perdaArtLavagemCana = await db.getValue('perdaArtLavagemCana');
    let relBagacilhoCana = await db.getValue('relBagacilhoCana');
    let efExtMoenda = await db.getValue('efExtMoenda');
    let fibraBagaco = await db.getValue('fibraBagaco');

    var perdaMassaArtLav = artMassaCana * perdaArtLavagemCana / 100
    let flowBagacilho = relBagacilhoCana * flowCana / 1000
    let flowBagaco = fibraBagaco != 0 ? flowCana * fibraCana / fibraBagaco : 0
    let artMassaBagaco = (1 - efExtMoenda/100) * (artCana/100 * flowCana - perdaMassaArtLav)
    let artBagaco = artMassaBagaco * 100 / flowBagaco
    let polBagaco = polCana != 0.0 ? (artBagaco - arCana/polCana) * 0.95 : 0.0
    let flowBagacoToBoilers = flowBagaco - flowBagacilho
    let perdaArtExtracao = 100 - efExtMoenda
   
    db.setValue('flowBagacilho', flowBagacilho)
    db.setValue('flowBagaco', flowBagaco)
    db.setValue('artMassaBagaco', artMassaBagaco)
    db.setValue('artBagaco', artBagaco)
    db.setValue('polBagaco', polBagaco)
    db.setValue('flowBagacoToBoilers', flowBagacoToBoilers)
    db.setValue('perdaArtExtracao', perdaArtExtracao)
    
    // let consBag = getSumFromKey("consBag")
    // sobra = flowBagacoToBoilers - consBag

    //EMBEBICAO
    let fibraEmbeb = await db.getValue('fibraEmbeb');
    let flowEmbeb = flowCana * fibraCana / 100 * fibraEmbeb / 100
    db.setValue('flowEmbeb', flowEmbeb)

    db.setValue('flowCaldo1T', 0)
    db.setValue('flowCaldo2T', 0)

    //AQUECIMENTO
    await calcAquecimento(flowEmbeb, flowCana, brixCana)
    
    let condLimpPen = await db.getValue('consCondVGLimpPeneira');
    let aguaLavCorr = await db.getValue('consAguaBrutaLavCorrDifusor');

    let vaporUtilizadoDifusor = await db.getValue('vaporUtilizadoDifusor');
    let perdasArt = await getSumFromKey('perdaArt')
    var consVaporVV2AquecDir = vaporUtilizadoDifusor == 0 ? await  db.getValue('consVaporVV2AquecDirDifusor') : await  db.getValue('consVaporVV1AquecDirDifusor')
    var consVaporVV2Borb = vaporUtilizadoDifusor == 0 ? await  db.getValue('consVaporVV2BorbDifusor') : await  db.getValue('consVaporVV1BorbDifusor')

    //CALDO MISTO
    let percArtProdFinais = (100 - perdasArt) / 100
    let brixMassaCaldoMisto = flowCana * (polCana/purezaCana) * percArtProdFinais
    let flowCaldoMisto = flowCana + flowEmbeb - flowBagaco + condLimpPen + aguaLavCorr + consVaporVV2AquecDir + consVaporVV2Borb
    let brixCaldoMisto = brixMassaCaldoMisto*100/flowCaldoMisto
    let artMassaCaldoMisto = flowCana * artCana/100 * percArtProdFinais
    let artCaldoMisto = artMassaCaldoMisto*100/flowCaldoMisto

    db.setValue('brixMassaCaldoMisto', brixMassaCaldoMisto)
    db.setValue('flowCaldoMisto', flowCaldoMisto)
    db.setValue('brixCaldoMisto', brixCaldoMisto)
    db.setValue('artMassaCaldoMisto', artMassaCaldoMisto)
    db.setValue('artCaldoMisto', artCaldoMisto)

    let caldoMistoToAc = await db.getValue('caldoMistoToAcucar')/100
    let flowCaldoFiltpAc = await db.getValue('caldoFiltToAcucar')/100
    let fl = await FiltracaoLodo()
    let flowEmbFiltroRot = fl.flowEmbFiltroRot
    let flowAguaLavRot = fl.flowAguaLavRot
    let flowAguaLavPre = fl.flowAguaLavPre
    let flowEmbFiltroPre = fl.flowEmbFiltroPre

    //CALDO FILTRADO
    let flowCaldoFiltrado = await db.getValue('flowCaldoFiltrado')
    flowCaldoFiltrado = !flowCaldoFiltrado ? flowCana * 0.13 : flowCaldoFiltrado
    let brixCaldoFiltrado = await db.getValue('brixCaldoFiltrado')
    brixCaldoFiltrado  = brixCaldoFiltrado == 0.0 ? 10.0 : brixCaldoFiltrado
    let flowLodo = await db.getValue('flowLodo')
    flowLodo = flowLodo == 0.0 ? flowCana * 0.1 : flowLodo
        
    var v0 = 0.0
    var v1 = flowCaldoFiltrado

    while (Math.abs(v1 - v0) > 0.1) {
      v0 = flowCaldoFiltrado
      let flowCaldoMisto = await db.getValue('flowCaldoMisto')
      let flowCaldoAcucar = flowCaldoMisto * caldoMistoToAc + v0 * flowCaldoFiltpAc
      db.setValue('flowCaldoAcucar', flowCaldoAcucar)

      let flowCaldoEtanol = flowCaldoMisto * (1 - caldoMistoToAc) + v0 * (1 - flowCaldoFiltpAc)
      db.setValue('flowCaldoEtanol', flowCaldoEtanol)
      
      await Dosagem()
      await FlashAcucar()
      await FlashEtanol()
      await Decantacao()
      fl = await FiltracaoLodo()
      
      flowLodo = flowLodo.isNaN ? flowCana * 0.1 : flowLodo
      db.setValue('flowLodo', flowLodo)
      flowEmbFiltroRot = !fl.flowEmbFiltroRot ? 0.0 : fl.flowEmbFiltroRot
      flowAguaLavRot = !fl.flowAguaLavRot ? 0.0 : fl.flowAguaLavRot
      flowAguaLavPre = !fl.flowAguaLavPre ? 0.0 : fl.flowAguaLavPre
      flowEmbFiltroPre = !fl.flowEmbFiltroPre ? 0.0 : fl.flowEmbFiltroPre
      
      let flowTorta = await db.getValue('flowTorta')
      flowCaldoFiltrado = flowLodo + flowEmbFiltroRot + flowAguaLavRot + flowEmbFiltroPre + flowAguaLavPre - flowTorta
      db.setValue('flowCaldoFiltrado', flowCaldoFiltrado)
      v1 = flowCaldoFiltrado
    }

    let flowCaldoMistoToAc = flowCaldoMisto * caldoMistoToAc
    let flowCaldoFiltToAc = flowCaldoFiltrado * flowCaldoFiltpAc

    let artMassaCaldoFiltrado = await db.getValue('artMassaCaldoFiltrado')
    let brixMassaCaldoFiltrado = await db.getValue('brixMassaCaldoFiltrado')
    let tempCaldoFiltrado = await db.getValue('tempCaldoFiltrado')
    let tempCaldoMisto = await db.getValue('tempCaldoMisto')

    let flowCaldoAcucar = flowCaldoMistoToAc + flowCaldoFiltToAc
    let artMassaCaldoAcucar = artMassaCaldoMisto * caldoMistoToAc + artMassaCaldoFiltrado * flowCaldoFiltpAc
    let artCaldoAcucar = artMassaCaldoAcucar * 100 / flowCaldoAcucar
    let brixMassaCaldoAcucar = !brixMassaCaldoFiltrado ? 0 : brixMassaCaldoMisto * caldoMistoToAc + brixMassaCaldoFiltrado * flowCaldoFiltpAc
    let brixCaldoAcucar = brixMassaCaldoAcucar * 100 / flowCaldoAcucar
    let tempCaldoAcucar = (tempCaldoMisto * flowCaldoMistoToAc + tempCaldoFiltrado * flowCaldoFiltToAc)/flowCaldoAcucar

    db.setValue('flowCaldoAcucar', flowCaldoAcucar)
    db.setValue('artMassaCaldoAcucar', artMassaCaldoAcucar)
    // db.setValue('artCaldoAcucar', artCaldoAcucar)
    db.setValue('brixMassaCaldoAcucar', brixMassaCaldoAcucar)
    db.setValue('brixCaldoAcucar', brixCaldoAcucar)
    db.setValue('tempCaldoAcucar', tempCaldoAcucar)
    
    let flowCaldoMistoToEt = flowCaldoMisto * (1-caldoMistoToAc)
    let flowCaldoFiltToEt = flowCaldoFiltrado * (1-flowCaldoFiltpAc)

    let flowCaldoEtanol = flowCaldoMistoToEt + flowCaldoFiltToEt
    let artMassaCaldoEtanol = artMassaCaldoMisto * (1 - caldoMistoToAc) + artMassaCaldoFiltrado * (1 - flowCaldoFiltpAc)
    let artCaldoEtanol = artMassaCaldoEtanol * 100 / flowCaldoEtanol
    let brixCaldoEtanol = (brixCaldoMisto * flowCaldoMistoToEt + brixCaldoFiltrado * flowCaldoFiltToEt)/flowCaldoEtanol
    let brixMassaCaldoEtanol = flowCaldoEtanol * brixCaldoEtanol / 100
    let tempCaldoEtanol = (tempCaldoMisto * flowCaldoMistoToEt + tempCaldoFiltrado * flowCaldoFiltToEt)/flowCaldoEtanol

    db.setValue('flowCaldoEtanol', flowCaldoEtanol)
    db.setValue('artMassaCaldoEtanol', artMassaCaldoEtanol)
    // db.setValue('artCaldoEtanol', artCaldoEtanol)
    db.setValue('brixCaldoEtanol', brixCaldoEtanol)
    db.setValue('brixMassaCaldoEtanol', brixMassaCaldoEtanol)
    db.setValue('tempCaldoEtanol', tempCaldoEtanol)
    
    //ACIONAMENTOS
    db.setValue('consEspVaporAcion56T', 0)
    db.setValue('consEspEnergiaAcion56T', 0)
    let tfh = flowCana * fibraCana / 100
    await calcAcion(tfh)

    let after =  new Date()
    console.log(`Calculo Difusor: ` + (after - now)/1000)
}

async function calcAquecimento(flowEmbeb, flowCana, brixCana){
  let tempCondVG = await db.getValue('tempCondVG');
  let vaporUtilizadoDifusor = await db.getValue('vaporUtilizadoDifusor');
  let tempEmbeb = await db.getValue('tempEmbeb');
  let relCaldoEscCana = await db.getValue('relCaldoEscCana');
  let tempCaldoEscaldante = await db.getValue('tempCaldoEscaldante');
  let tempOutAqDifusor = await db.getValue('tempOutAqDifusor');
  let perdaArtLavagemCana = await db.getValue('perdaArtLavagemCana');

  var pressureVG = vaporUtilizadoDifusor == 0 ? await  db.getValue('pressureVV2') : await  db.getValue('pressureVV1')

  let aqDir = calcAqDirEmb(flowEmbeb, tempCondVG, tempEmbeb, pressureVG)
  let flowEmbAqDir = aqDir.flowEmbOut
  let consVapor = aqDir.consVapor

  db.setValue('flowEmbAqDirDifusor', flowEmbAqDir)

  let flowCaldoEscaldante = flowCana * relCaldoEscCana / 100
  
  let areaAqDifusor = await db.getValue('areaAqDifusor')
  let qtdeOpAqDifusor = await db.getValue('qtdeOpAqDifusor')
  let coefTrocaAqDifusor = await db.getValue('coefTrocaAqDifusor')
  
  let aq = await AqCascoTuboVL(
    flowCaldoEscaldante,
    tempCaldoEscaldante,
    tempOutAqDifusor,
    brixCana,
    pressureVG,
    areaAqDifusor,
    qtdeOpAqDifusor,
    coefTrocaAqDifusor)

  let utilAq = aq.util
  db.setValue('utilAqDifusor', utilAq)

  let consVaporVV2Borb = await db.getValue('consVaporVV2BorbDifusor')
  let consVaporVV1Borb = await db.getValue('consVaporVV1BorbDifusor')

  if (vaporUtilizadoDifusor == 0){
    let consVV2TotalDifusor = aqDir.consVapor + consVaporVV2Borb + aq.consVapor
    db.setValue('consVaporVV2AquecDirDifusor', aqDir.consVapor)
    db.setValue('consVaporVV2AquecDifusor', aq.consVapor)
    db.setValue('consVV2TotalDifusor', consVV2TotalDifusor)
    db.setValue('gerCondVGAqVV2Difusor', aq.consVapor)
    db.setValue('consVaporVV1AquecDifusor', 0.0)
    db.setValue('consVaporVV1AquecDirDifusor', 0.0)
    db.setValue('consVV1TotalDifusor', 0.0)
    db.setValue('gerCondVGAqVV1Difusor', 0.0)
  }else{
    consVV1Total = aqDir.consVapor + consVaporVV1Borb + aq.consVapor
    db.setValue('consVaporVV1AquecDirDifusor', aqDir.consVapor)
    db.setValue('consVaporVV1AquecDifusor', aq.consVapor)
    db.setValue('consVV1TotalDifusor', consVV1Total)
    db.setValue('gerCondVGAqVV1Difusor', aq.consVapor)
    db.setValue('consVaporVV2AquecDifusor', 0.0)
    db.setValue('consVaporVV2AquecDirDifusor', 0.0)
    db.setValue('consVV2TotalDifusor', 0.0)
    db.setValue('gerCondVGAqVV2Difusor', 0.0)
} 
}

async function calcAqDirEmb(flowEmbIn, tempEmbIn, tempEmbOut, pressureVG){
  var consVapor = 0
  var flowEmbOut = 0
  let cp = 1 - 0.006 * 0.0
  let cl_vg = (await hV_p(pressureVG) - await hL_p(pressureVG))/4.18
  let q = flowEmbIn * cp * (tempEmbOut - tempEmbIn)
  consVapor = q / cl_vg
  flowEmbOut = flowEmbIn + consVapor
  return({
    "consVapor": consVapor, 
    "flowEmbOut":flowEmbOut
  })
}

async function calcAcion(tfh){
  let nivelador = await Nivelador(tfh)
  let picador = await Picador(tfh)
  let desfibrador = await Desfibrador(tfh)
  let acion = await acionMoenda(tfh)
  let consVaporAcion = acion.consTotalVapor + picador.consVapor + desfibrador.consVapor + nivelador.consVapor

  db.setValue('consVaporVMMoendas', acion.consTotalVapor)
  db.setValue('consVaporVMPicador', picador.consVapor)
  db.setValue('consVaporVMDesfibrador', desfibrador.consVapor)
  db.setValue('consVaporVMNivelador', nivelador.consVapor)
  db.setValue('flowVaporVMExtracao', consVaporAcion)
  db.setValue('flowVaporVEExtracao', consVaporAcion)
  db.setValue('gerVaporVEMoendas', acion.consTotalVapor)
  db.setValue('gerVaporVEPicador', picador.consVapor)
  db.setValue('gerVaporVEDesfibrador', desfibrador.consVapor)
  db.setValue('gerVaporVENivelador', nivelador.consVapor)
  
  let tempEscapeExt = (picador.consVapor * picador.tempEscape + desfibrador.consVapor * desfibrador.tempEscape + acion.consTotalVapor * acion.tempEscape + nivelador.consVapor * nivelador.tempEscape) / consVaporAcion
  db.setValue('tempVaporVEMoendas', tempEscapeExt)
}

async function Nivelador(tfh){
  let consVapor = 0
  let tempEscape = 0

  let consEspVapor = await db.getValue('consEspVaporNivelador') 
  let consEspEnergia = await db.getValue('consEspEnergiaNivelador')
  let consEnergia = consEspEnergia * tfh / 1000
  consVapor = consEnergia * consEspVapor
  db.setValue('consVaporVMNivelador', consVapor)
  db.setValue('ptNivelador', consEnergia)
  tempEscape = await db.getValue('tempVaporVENivelador')

  return {
    "consVapor": consVapor,
    "tempEscape": tempEscape
  }
}

async function Picador(tfh){
  let consVapor = 0
  let tempEscape = 0

  let consEspVapor = await db.getValue('consEspVaporPicador') 
  let consEspEnergia = await db.getValue('consEspEnergiaPicador')
  let consEnergia = consEspEnergia * tfh / 1000
  consVapor = consEnergia * consEspVapor
  db.setValue('consVaporVMPicador', consVapor)
  db.setValue('ptPicador', consEnergia)
  tempEscape = await db.getValue('tempVaporVEPicador')

  return {
    "consVapor": consVapor,
    "tempEscape": tempEscape
  }
}

async function Desfibrador(tfh){
  let consVapor = 0
  let tempEscape = 0

  let consEspVapor = await db.getValue('consEspVaporDesfibrador') 
  let consEspEnergia = await db.getValue('consEspEnergiaDesfibrador')
  let consEnergia = consEspEnergia * tfh / 1000
  consVapor = consEnergia * consEspVapor
  db.setValue('consVaporVMDesfibrador', consVapor)
  db.setValue('ptDesfibrador', consEnergia)
  tempEscape = await db.getValue('tempVaporVEDesfibrador')

  return {
    "consVapor": consVapor,
    "tempEscape": tempEscape
  }
}

async function acionMoenda(tfh){
  let consTotalVapor = 0
  let tempEscape = 0
  
  let consEspVapor12T = await db.getValue('consEspVaporAcion12T')
  let consEspEnergia12T = await db.getValue('consEspEnergiaAcion12T')
  let consEnergia12T = consEspEnergia12T * tfh / 1000
  let consVapor12T = consEnergia12T * consEspVapor12T
  db.setValue('consVaporAcion12T', consVapor12T)
  db.setValue('ptAcion12T', consEnergia12T)
  
  let consEspVapor34T = await db.getValue('consEspVaporAcion34T')
  let consEspEnergia34T = await db.getValue('consEspEnergiaAcion34T')
  let consEnergia34T = consEspEnergia34T * tfh / 1000
  let consVapor34T = consEnergia34T * consEspVapor34T
  db.setValue('consVaporAcion34T', consVapor34T)
  db.setValue('ptAcion34T', consEnergia34T)
  
  let consEspVapor56T = await db.getValue('consEspVaporAcion56T')
  let consEspEnergia56T = await db.getValue('consEspEnergiaAcion56T')
  let consEnergia56T = consEspEnergia56T * tfh / 1000
  let consVapor56T = consEnergia56T * consEspVapor56T
  db.setValue('consVaporAcion56T', consVapor56T)
  db.setValue('ptAcion56T', consEnergia56T)
  
  consTotalVapor = consVapor12T + consVapor34T + consVapor56T
  let tempEsc12T = await db.getValue('tempVaporVEAcion12T')
  let tempEsc34T = await db.getValue('tempVaporVEAcion34T')
  let tempEsc56T = await db.getValue('tempVaporVEAcion56T')
  tempEscape = (consVapor12T * tempEsc12T + consVapor34T * tempEsc34T + consVapor56T * tempEsc56T) / consTotalVapor

  return {
    "consTotalVapor": consTotalVapor,
    "tempEscape": tempEscape
  }
}



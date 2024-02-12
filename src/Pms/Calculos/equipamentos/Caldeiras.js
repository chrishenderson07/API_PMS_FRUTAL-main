const { setValue, getValue, getMax, getMin, getSumFromKey } = require('../../db/funcsDb')
const { h_pT, Tsat_p, s_pT, H_ps } = require('../modulos/steamTables')

module.exports = {
    CaldeirasVA,
    CaldeirasVM
}


async function CaldeirasVA(){
    setValue('consVaporVAPerdas', 0.0)
    let flow =  await getSumFromKey('consVaporVA')
    let perdasVA = await getValue('perdasVA')
    let flowFinal = flow / (1 - perdasVA / 100)
    let consVaporVAPerdas = flowFinal - flow

    getValue('consVaporVAPerdas', consVaporVAPerdas)
    flow =  await getSumFromKey('consVaporVA')
    
    let opCalcCaldeirasVA =  await getSumFromKey('opCalcCaldeirasVA')
    if (opCalcCaldeirasVA == 1.0){
        await CaldeirasVAcalcPTC()
    }else{
        await CaldeirasVAcalcManual()
    }
    await TbCaldeirasVA()

    getValue('gerVaporVACaldeiras', flow)
}

async function CaldeirasVM(){
    setValue('consVaporVMPerdas', 0.0)
    let gerVaporVMDessupVM =  await getValue('gerVaporVMDessupVM')
    let gerVaporVMTgCpVA =  await getValue('gerVaporVMTgCpVA')
    let consVaporV22Seclevedura =  await getValue('consVaporV22Seclevedura')
    let consVaporV22Desidratacao =  await getValue('consVaporV22Desidratacao')
    let consVaporVMAcionExt =  await getValue('flowVaporVMExtracao')
    let gerVaporVMFromVA = gerVaporVMDessupVM + gerVaporVMTgCpVA
    
    let flow =  await getSumFromKey('consVaporVM') - gerVaporVMFromVA + consVaporVMAcionExt + consVaporV22Seclevedura + consVaporV22Desidratacao
    
    let perdasVM =await getValue('perdasVM')
    let flowFinal = flow / (1 - perdasVM / 100)
    let consVaporVMPerdas = flowFinal - flow
    setValue('consVaporVMPerdas', consVaporVMPerdas)
    flow = await getSumFromKey('consVaporVM') - gerVaporVMFromVA + consVaporVMAcionExt + consVaporV22Seclevedura + consVaporV22Desidratacao
    
    
    let maxFlow = await getMax('gerVaporVMCaldeiras')
    let opCaldeirasVA =await getValue('opCaldeirasVA')
    if (opCaldeirasVA == 1.0){
        if (flow > maxFlow){
            setValue('gerVaporVMRebVAVM', flow - maxFlow)
            flow = maxFlow
        }else{
            setValue('gerVaporVMRebVAVM', 0.0)
        }
    }else{
        setValue('gerVaporVMRebVAVM', 0.0)
    }
    
    let opCalcCaldeirasVM =await getValue('opCalcCaldeirasVM')
    if (opCalcCaldeirasVM == 1.0){
        await CaldeirasVMcalcPTC()
    }else{
        await CaldeirasVMcalcManual()
    }
    await TbCaldeirasVM()

    getValue('gerVaporVMCaldeiras', flow)
}

async function CaldeirasVAcalcManual(){
    let polBagaco = await getValue('polBagaco') 
    let umiBagaco = await getValue('umiBagaco') 
    let pressureVA = await getValue('pressureVA')
    let tempVaporVA = await getValue('tempVaporVA')
    let tempAgua = await getValue('tempAguaAlimCaldeirasVA')
    let rendCaldeirasVA = await getValue('rendCaldeirasVA')
    let flow = await getValue('gerVaporVACaldeiras')
    let purga = await getValue('purgaDesCaldeirasVA')

    let entalpiaVapor = await h_pT(pressureVA, tempVaporVA) / 4.1838
    let PCI = 4250.0 - (48.5 * umiBagaco) - (12 * polBagaco) / 4.1838
    let efPCI = rendCaldeirasVA * (entalpiaVapor - tempAgua) * 100 / PCI
    let consBag = flow/rendCaldeirasVA
    let consCondDesCaldeirasVA = flow / (1-purga/100)

    setValue('consCondDesCaldeirasVA', consCondDesCaldeirasVA)
    setValue('efPCICaldeirasVA', efPCI)
    setValue('consBagCaldeirasVA', consBag)
}

async function CaldeirasVMcalcManual(){
    let polBagaco = await getValue('polBagaco') 
    let umiBagaco = await getValue('umiBagaco') 
    let pressureVM = await getValue('pressureVM')
    let tempVaporVM = await getValue('tempVaporVM')
    let tempAgua = await getValue('tempAguaAlimCaldeirasVM')
    let rendCaldeirasVM = await getValue('rendCaldeirasVM')
    let flow = await getValue('gerVaporVMCaldeiras')
    let purga = await getValue('purgaDesCaldeirasVM')

    let entalpiaVapor = await h_pT(pressureVM, tempVaporVM) / 4.1838
    let PCI = 4250.0 - (48.5 * umiBagaco) - (12 * polBagaco) / 4.1838
    let efPCI = rendCaldeirasVM * (entalpiaVapor - tempAgua) * 100 / PCI
    let consBag = flow/rendCaldeirasVM
    let cond = flow / (1-purga/100)

    setValue('consCondDesCaldeirasVM', cond)
    setValue('efPCICaldeirasVM', efPCI)
    setValue('consBagCaldeirasVM', consBag)
}

async function CaldeirasVAcalcPTC(){
    let polBagaco = await getValue('polBagaco') 
    let umiBagaco = await getValue('umidBagaco')
    let pressureVA = await getValue('pressureVA')
    let tempVaporVA = await getValue('tempVaporVA')
    let flow = await getValue('gerVaporVACaldeiras')
    let perdasIrr = await getValue('perdasIrrCaldeirasVA')
    let perdasNq = await getValue('perdasNqCaldeirasVA')
    let tempAgua = await getValue('tempAguaAlimCaldeirasVA')
    let purga = await getValue('purgaDesCaldeirasVA')
    let tempGases = await getValue('tempGasesCaldeirasVA')
    let o2 = await getValue('o2CaldeirasVA')

    let entalpiaVapor = await h_pT(pressureVA, tempVaporVA) / 4.1838
    let PCI = 4250.0 - (48.5 * umiBagaco) - (12 * polBagaco) / 4.1838
    let ea = o2 / (21 - o2) * 100
    let perdaGases = 0.38 + 0.13 * umiBagaco / 100 + 1.37 * (1 + ea / 100) * (100 - umiBagaco)/100 * tempGases
    let calorRec = (PCI - perdaGases) * (1-perdasNq/100) * (1-perdasIrr/100)
    let efPCI = calorRec/PCI * 100
    let rend = PCI * efPCI / (entalpiaVapor - tempAgua) / 100
    let consBag = flow / rend
    let cond = flow / (1-purga/100)

    setValue('excessoArCaldeirasVA', ea)
    setValue('efPCICaldeirasVA', efPCI)
    setValue('consBagCaldeirasVA', consBag)
    setValue('rendCaldeirasVA', rend)
    setValue('consCondDesCaldeirasVA', cond)
}

async function CaldeirasVMcalcPTC(){
    let polBagaco = await getValue('polBagaco') 
    let umiBagaco = await getValue('umidBagaco')
    let pressureVM = await getValue('pressureVM')
    let tempVaporVM = await getValue('tempVaporVM')

    let flow = await getValue('gerVaporVMCaldeiras')
    let perdasIrr = await getValue('perdasIrrCaldeirasVM')
    let perdasNq = await getValue('perdasNqCaldeirasVM')
    let tempAgua = await getValue('tempAguaAlimCaldeirasVM')
    let purga = await getValue('purgaDesCaldeirasVM')
    let tempGases = await getValue('tempGasesCaldeirasVM')
    let o2 = await getValue('o2CaldeirasVM')

    let entalpiaVapor = await h_pT(pressureVM, tempVaporVM) / 4.1838
    let PCI = 4250.0 - (48.5 * umiBagaco) - (12 * polBagaco) / 4.1838
    let ea = o2 / (21 - o2) * 100
    let perdaGases = 0.38 + 0.13 * umiBagaco / 100 + 1.37 * (1 + ea / 100) * (100 - umiBagaco)/100 * tempGases
    let calorRec = (PCI - perdaGases) * (1-perdasNq/100) * (1-perdasIrr/100)
    let efPCI = calorRec/PCI * 100
    let rend = PCI * efPCI / (entalpiaVapor - tempAgua) / 100
    let consBag = flow / rend
    let cond = flow / (1-purga/100)

    setValue('excessoArCaldeirasVM', ea)
    setValue('efPCICaldeirasVM', efPCI)
    setValue('consBagCaldeirasVM', consBag)
    setValue('rendCaldeirasVM', rend)
    setValue('consCondDesCaldeirasVM', cond)
}

async function TbCaldeirasVA(){
    let opTurboBombaCaldeirasVA = await getValue('opTurboBombaCaldeirasVA')
    let pressureVA = await getValue('pressureVA')
    let consEspTB = await getValue('consEspTBCaldeirasVA')
    let flow = await getValue('gerVaporVACaldeiras')
    let ptTB = 0.0
    let consVaporVMTB = 0.0
    let gerVaporVETB = 0.0
    if (opTurboBombaCaldeirasVA == 1.0){
        ptTB = (flow * (pressureVA + 10) * 10) * 0.0007457 / (0.75 * 273)//curva bomba
        consVaporVMTB = ptTB * consEspTB
        gerVaporVETB = consVaporVMTB
    }
    setValue('ptTBCaldeirasVA', ptTB)
    setValue('consVaporVMTBCaldeirasVA', consVaporVMTB)
    setValue('gerVaporVETBCaldeirasVA', gerVaporVETB)
}

async function TbCaldeirasVM(){
    let opTurboBombaCaldeirasVM = await getValue('opTurboBombaCaldeirasVM')
    let pressureVM = await getValue('pressureVM')
    let consEspTB = await getValue('consEspTBCaldeirasVM')
    let flow = await getValue('gerVaporVMCaldeiras')
    let ptTB = 0.0
    let consVaporVMTB = 0.0
    let gerVaporVETB = 0.0

    if (opTurboBombaCaldeirasVM == 1.0){
        ptTB = (flow * (pressureVM + 10) * 10) * 0.0007457 / (0.75 * 273)//curva bomba
        consVaporVMTB = ptTB * consEspTB
        gerVaporVETB = consVaporVMTB
    }

    setValue('ptTBCaldeirasVM', ptTB)
    setValue('consVaporVMTBCaldeirasVM', consVaporVMTB)
    setValue('gerVaporVETBCaldeirasVM', gerVaporVETB)
}
    


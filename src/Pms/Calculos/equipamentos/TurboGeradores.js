const { setValue, getValue, getMax, getMin } = require('../../db/funcsDb')
const { h_pT, Tsat_p, s_pT, H_ps, H_px, T_ph } = require('../modulos/steamTables')

module.exports = {
    TurboGeradorCdVA,
    TurboGeradorCpVA,
    calcTgCpVAManAndTgCpVMMan,
    calcTgCpVAAutoAndTgCpVMAuto,
    calcTgCpVAAutoAndTgCpVMMan,
    calcTgCpVAManAndTgCpVMAuto
}

async function TurboGeradorCdVA(){
    let opMode = await getValue('opModeTgCdVA')
    console.log("Steam Turbine: \(opMode)")

    let opCaldeirasVA = await getValue('opCaldeirasVA')
    if (opCaldeirasVA == 0.0){
        setValue('ptTgCdVA', 0.0)
    }

    let ptTgCdVA = await getValue('ptTgCdVA')
    let pressInTgCdVA = await getValue('pressInTgCdVA')
    let tempInTgCdVA = await getValue('tempInTgCdVA')
    let pressExtTgCdVA = await getValue('pressExtTgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')
    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let pressEscTgCdVA = await getValue('pressEscTgCdVA')
    let tempEscTgCdVA = await getValue('tempEscTgCdVA')
    let titEscTgCdVA = await getValue('titEscTgCdVA')

    let st = 0

    if (opMode == 0){
        st = await steamTurbineCondSup(ptTgCdVA, pressInTgCdVA, tempInTgCdVA, pressExtTgCdVA, tempExtTgCdVA, gerVaporVETgCdVA, pressEscTgCdVA, tempEscTgCdVA)
        setValue('eficIsoTgCdVA', 100.0)
    }else{
        st = await steamTurbineCondSat(ptTgCdVA, pressInTgCdVA, tempInTgCdVA, pressExtTgCdVA, tempExtTgCdVA, gerVaporVETgCdVA, pressEscTgCdVA, titEscTgCdVA)
        
    }
    setValue('consVaporVATgCdVA', st.inletFlow)
    setValue('gerCondVETgCdVA', st.escFlow)
    setValue('tempEscTgCdVA', st.tempEsc)
    setValue('titEscTgCdVA', st.eficIso)
    setValue('consEspMEdTgCdVA', st.medSpecCons)
    setValue('consEspExtTgCdVA', st.extSpecCons)
    setValue('consEspEscTgCdVA', st.escSpecCons)
}

async function steamTurbineCondSat(pt, inletPress, inletTemp, extPress, extTemp, extFlow, escPress, tit){
        
    let inletH = await h_pT(inletPress, inletTemp)
    let inletS = await s_pT(inletPress, inletTemp)
//        self.inletFlow = escFlow + extFlow
    
    let extH = await h_pT(extPress, extTemp)
    let extPt = extFlow * (inletH - extH) * 0.98 * 0.98 / 3600
    let extSpecCons = extPt == 0 ? 0 : extFlow/extPt
    
    let escPt = pt - extPt
    let escH = await H_px(escPress, tit/100)//h_pT(p: escPress.fromkgfcm2ToBar(), t: escTemp)
    let escTemp = await T_ph(escPress, escH)
    let escFlow = (escPt * 3600) / ((inletH - escH) * 0.98 * 0.98)
//        let escPt = escFlow * (inletH - escH) * 0.98 * 0.98 / 3600
    let escSpecCons = escPt == 0 ? 0 : escFlow/escPt
    
    let inletFlow = escFlow + extFlow
    let medSpecCons = pt == 0 ? 0 : inletFlow/pt
    
    let escHiso = await H_ps(escPress, inletS)
    let escEf = (inletH - escH) * 100 / (inletH - escHiso)
    
    let extHiso = await H_ps(extPress, inletS)
    let extEf = (inletH - extH) * 100 / (inletH - extHiso)
    
    let eficIso = inletFlow == 0 ? 0 : (escEf*escFlow + extEf*extFlow)/inletFlow

    return {
        "inletFlow": inletFlow,
        "escFlow": escFlow,
        "eficIso": eficIso,
        "medSpecCons": medSpecCons,
        "extSpecCons": extSpecCons,
        "escSpecCons": escSpecCons,
        "escTemp": escTemp
    }
    
}

async function steamTurbineCondSup(pt, inletPress, inletTemp, extPress, extTemp, extFlow, escPress, escTemp){
    
        
    let escTempSat = await Tsat_p(escPress)+0.1

    if (escTemp < escTempSat){
        escTemp = escTempSat
    }
    
    let inletH = await h_pT(inletPress, inletTemp)
    let inletS = await s_pT(inletPress, inletTemp)
//        self.inletFlow = escFlow + extFlow
    
    let extH = await h_pT(extPress, extTemp)
    let extPt = extFlow * (inletH - extH) * 0.98 * 0.98 / 3600
    let extSpecCons = extPt == 0 ? 0 : extFlow/extPt
    
    let escPt = pt - extPt
    let escH = await h_pT(escPress, escTemp)
    let escFlow = (escPt * 3600) / ((inletH - escH) * 0.98 * 0.98)
//        let escPt = escFlow * (inletH - escH) * 0.98 * 0.98 / 3600
    let escSpecCons = escPt == 0 ? 0 : escFlow/escPt
    
    let inletFlow = escFlow + extFlow
    let medSpecCons = pt == 0 ? 0 : inletFlow/pt
    
    let escHiso = await H_ps(escPress, inletS)
    let escEf = (inletH - escH) * 100 / (inletH - escHiso)
    
    let extHiso = await H_ps(extPress, inletS)
    let extEf = (inletH - extH) * 100 / (inletH - extHiso)
    
    let eficIso = inletFlow == 0 ? 0 : (escEf*escFlow + extEf*extFlow)/inletFlow

    return {
        "inletFlow": inletFlow,
        "escFlow": escFlow,
        "eficIso": eficIso,
        "medSpecCons": medSpecCons,
        "extSpecCons": extSpecCons,
        "escSpecCons": escSpecCons,
        "escTemp": escTemp
    }
    
}

async function calcTgCpVAManAndTgCpVMMan(faltaVaporVE){
    await TurboGeradorCpVA()
    await TurboGeradorCpVM()
    
    let gerVaporVETgCpVA = await getValue('gerVaporVETgCpVA')
    let tempEscTgCpVA = await getValue('tempEscTgCpVA')
    let flowDessupVETgCpVA = await FlowDes(gerVaporVETgCpVA, tempEscTgCpVA, 'VE')
    
    let gerVaporVETgCpVM = await getValue('gerVaporVETgCpVM')
    let tempEscTgCpVM = await getValue('tempEscTgCpVM')
    let flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
    
    let faltaVap = faltaVaporVE
    
    faltaVap = faltaVap - gerVaporVETgCpVA - gerVaporVETgCpVM - flowDessupVETgCpVA - flowDessupVETgCpVM
   
    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')
    let flowDessupVETgCdVA = await FlowDes(gerVaporVETgCdVA, tempExtTgCdVA, 'VE') 

    let flowDessupVEAcion = await getValue('flowDessupVEAcion')
    let gerVaporVEDessupVE = flowDessupVEAcion + flowDessupVETgCpVA+flowDessupVETgCpVM+flowDessupVETgCdVA
    setValue('gerVaporVEDessupVE', gerVaporVEDessupVE)
    
    setValue('consVaporVEAlivio', faltaVap < 0.1 && faltaVap > -0.1 ? 0 : -faltaVap)
}

async function calcTgCpVAAutoAndTgCpVMAuto(faltaVaporVE){
    var faltaVap = faltaVaporVE
    let opCaldeirasVA = await getValue('opCaldeirasVA')
    
    //TgCpVA
    var flowDessupVETgCpVA = 0.0
    var gerVaporVETgCpVA = 0.0
    if (opCaldeirasVA == 1.0){
        let gerVaporVMTgCpVA = await getValue('gerVaporVMTgCpVA')
        let tgCpVALimites = await TGCpVALim(gerVaporVMTgCpVA)
        let tempEscTgCpVA = await getValue('tempEscTgCpVA')

        gerVaporVETgCpVA = faltaVap
        if ((gerVaporVETgCpVA + gerVaporVMTgCpVA) > tgCpVALimites.maxFlow){
            gerVaporVETgCpVA = tgCpVALimites.maxFlow - gerVaporVMTgCpVA
        }

        flowDessupVETgCpVA =  await FlowDes(gerVaporVETgCpVA, tempEscTgCpVA, 'VE')

        gerVaporVETgCpVA = gerVaporVETgCpVA - flowDessupVETgCpVA
        setValue('gerVaporVETgCpVA', gerVaporVETgCpVA)
        await TurboGeradorCpVA()
        faltaVap = faltaVap - gerVaporVETgCpVA - flowDessupVETgCpVA
    }else{
       await  TurboGeradorCpVA()
    }
    
    //TgCpVM
    var gerVaporVETgCpVM = 0.0
    let tgCpVMLimites = await TGCpVMLim()
    var flowDessupVETgCpVM = 0.0
    let tempEscTgCpVM = await getValue('tempEscTgCpVM')
    
    if (faltaVap <= 0.00001){
        gerVaporVETgCpVM = 0.0
        setValue('gerVaporVETgCpVM', gerVaporVETgCpVM)
    }else{
        gerVaporVETgCpVM = faltaVap
        if (gerVaporVETgCpVM > tgCpVMLimites.maxFlow){
            gerVaporVETgCpVM = tgCpVMLimites.maxFlow

            flowDessupVETgCpVM =  await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')

            if (gerVaporVETgCpVM + flowDessupVETgCpVM > faltaVap){
                while (Math.abs(gerVaporVETgCpVM + flowDessupVETgCpVM - faltaVap) > 0.01) {
                    gerVaporVETgCpVM = faltaVap - flowDessupVETgCpVM
                    flowDessupVETgCpVM =  await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
                }
            }
        }else{
            flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
            gerVaporVETgCpVM = gerVaporVETgCpVM - flowDessupVETgCpVM
        }
        setValue('gerVaporVETgCpVM', gerVaporVETgCpVM)
    }
    await TurboGeradorCpVM()
    
    faltaVap = faltaVap - gerVaporVETgCpVM - flowDessupVETgCpVM
    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')
    let flowDessupVETgCdVA = await FlowDes(gerVaporVETgCdVA, tempExtTgCdVA, 'VE')
    
    let flowDessupVEAcion = await getValue('flowDessupVEAcion')
    let gerVaporVEDessupVE = flowDessupVEAcion + flowDessupVETgCpVA + flowDessupVETgCpVM + flowDessupVETgCdVA
    setValue('gerVaporVEDessupVE', gerVaporVEDessupVE)
    setValue('consVaporVEAlivio', faltaVap < 0.1 && faltaVap > -0.1 ? 0 : -faltaVap)
}

async function calcTgCpVAAutoAndTgCpVMMan(faltaVaporVE){
    var faltaVap = faltaVaporVE
    
    //TgCpVM
    var flowDessupVETgCpVM = 0.0
    var gerVaporVETgCpVM = 0.0
    
    await TurboGeradorCpVM()

    gerVaporVETgCpVM = await getValue('gerVaporVETgCpVM')
    let tempEscTgCpVM = await getValue('tempEscTgCpVM')

    flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
    faltaVap = faltaVap - gerVaporVETgCpVM - flowDessupVETgCpVM
    
    //TgCpVA
    var gerVaporVETgCpVA = 0.0
    var gerVaporVMTgCpVA = 0.0
    var flowDessupVETgCpVA = 0.0

    let opCaldeirasVA = await getValue('opCaldeirasVA')
    if (opCaldeirasVA == 1.0){
        gerVaporVMTgCpVA = await getValue('gerVaporVMTgCpVA')
        let tgCpVALimites = await TGCpVALim(gerVaporVMTgCpVA)
        let tempEscTgCpVA = await getValue('tempEscTgCpVA')
        
        gerVaporVETgCpVA = faltaVap
        if ((gerVaporVETgCpVA + gerVaporVMTgCpVA) > tgCpVALimites.maxFlow){
            gerVaporVETgCpVA = tgCpVALimites.maxFlow - gerVaporVMTgCpVA
        }

        flowDessupVETgCpVA = await FlowDes(gerVaporVETgCpVA, tempEscTgCpVA, 'VE')
        gerVaporVETgCpVA = gerVaporVETgCpVA - flowDessupVETgCpVA
        setValue('gerVaporVETgCpVA', gerVaporVETgCpVA)
        await TurboGeradorCpVA()
        faltaVap = faltaVap - gerVaporVETgCpVA - flowDessupVETgCpVA
    }else{
        await TurboGeradorCpVA()
    }
    
    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')
    let flowDessupVETgCdVA = await FlowDes(gerVaporVETgCdVA, tempExtTgCdVA, 'VE')
    let flowDessupVEAcion = await getValue('flowDessupVEAcion')
    let gerVaporVEDessupVE = flowDessupVEAcion + flowDessupVETgCpVA + flowDessupVETgCpVM + flowDessupVETgCdVA
    setValue('gerVaporVEDessupVE', gerVaporVEDessupVE)
    setValue('consVaporVEAlivio', faltaVap < 0.1 && faltaVap > -0.1 ? 0 : -faltaVap)
}

async function calcTgCpVAManAndTgCpVMAuto(faltaVaporVE){
    var faltaVap = faltaVaporVE
    
    //TgCpVA
    var flowDessupVETgCpVA = 0.0
    let opCaldeirasVA = await getValue('opCaldeirasVA')
    if (opCaldeirasVA == 1.0){
        await TurboGeradorCpVA()
        let gerVaporVETgCpVA = await getValue('gerVaporVETgCpVA')
        let tempEscTgCpVA =  await getValue('tempEscTgCpVA')
        
        flowDessupVETgCpVA =  await FlowDes(gerVaporVETgCpVA, tempEscTgCpVA, 'VE')
        faltaVap = faltaVap - gerVaporVETgCpVA - flowDessupVETgCpVA
    }else{
        await TurboGeradorCpVA()
    }
    
    //TgCpVM
    var gerVaporVETgCpVM = 0.0
    let tgCpVMLimites = await TGCpVMLim()
    var flowDessupVETgCpVM = 0.0
    let tempEscTgCpVM = await getValue('tempEscTgCpVM')
    if (faltaVap <= 0.00001){
        gerVaporVETgCpVM = 0.0
        setValue('gerVaporVETgCpVM', gerVaporVETgCpVM)
    }else{
        gerVaporVETgCpVM = faltaVap
        if (gerVaporVETgCpVM > tgCpVMLimites.maxFlow){
            gerVaporVETgCpVM = tgCpVMLimites.maxFlow
            flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
            if (gerVaporVETgCpVM + flowDessupVETgCpVM > faltaVap){
                while (Math.abs(gerVaporVETgCpVM + flowDessupVETgCpVM - faltaVap) > 0.01) {
                    gerVaporVETgCpVM = faltaVap - flowDessupVETgCpVM
                    flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
                }
            }
        }else{
            flowDessupVETgCpVM = await FlowDes(gerVaporVETgCpVM, tempEscTgCpVM, 'VE')
            gerVaporVETgCpVM = gerVaporVETgCpVM - flowDessupVETgCpVM
        }
        setValue('gerVaporVETgCpVM', gerVaporVETgCpVM)
    }
    await TurboGeradorCpVM()
    
    faltaVap = faltaVap - gerVaporVETgCpVM - flowDessupVETgCpVM
    
    let gerVaporVETgCdVA = await getValue('gerVaporVETgCdVA')
    let tempExtTgCdVA = await getValue('tempExtTgCdVA')

    let flowDessupVETgCdVA = await FlowDes(gerVaporVETgCdVA, tempExtTgCdVA, 'VE')
    
    let flowDessupVEAcion = await getValue('flowDessupVEAcion')
    let gerVaporVEDessupVE = flowDessupVEAcion + flowDessupVETgCpVA + flowDessupVETgCpVM + flowDessupVETgCdVA
    setValue('gerVaporVEDessupVE', gerVaporVEDessupVE)
    setValue('consVaporVEAlivio', faltaVap < 0.1 && faltaVap > -0.1 ? 0 : -faltaVap)
}

async function TurboGeradorCpVA(){
    let opModeTgCpVA = await getValue('opModeTgCpVA')
    let opCaldeirasVA = await getValue('opCaldeirasVA')

    if (opCaldeirasVA == 0.0){
        setValue('gerVaporVETgCpVA', 0.0)
        setValue('gerVaporVMTgCpVA', 0.0)
        setValue('ptTgCpVA', 0.0)
    }
    
    let pressInTgCpVA = await getValue('pressInTgCpVA')
    let tempInTgCpVA = await getValue('tempInTgCpVA')
    let gerVaporVMTgCpVA = await getValue('gerVaporVMTgCpVA')
    let pressExtTgCpVA = await getValue('pressExtTgCpVA')
    let tempExtTgCpVA = await getValue('tempExtTgCpVA')
    let pressEscTgCpVA = await getValue('pressEscTgCpVA')
    let tempEscTgCpVA = await getValue('tempEscTgCpVA')

    let st = 0

    if (opModeTgCpVA == 0){
        let gerVaporVETgCpVA = await getValue('gerVaporVETgCpVA')
        st = await steamTurbineWithExtAuto(gerVaporVETgCpVA, pressInTgCpVA, tempInTgCpVA, gerVaporVMTgCpVA, pressExtTgCpVA, tempExtTgCpVA, pressEscTgCpVA, tempEscTgCpVA)
        setValue('consVaporVATgCpVA', st.inletFlow)
        setValue('ptTgCpVA', st.pt)
    }else{
        let ptTgCpVA = await getValue('ptTgCpVA')
        st = await steamTurbineWithExtManual(ptTgCpVA, pressInTgCpVA, tempInTgCpVA, gerVaporVMTgCpVA, pressExtTgCpVA, tempExtTgCpVA, pressEscTgCpVA, tempEscTgCpVA)
        setValue('gerVaporVETgCpVA', st.escFlow)
        setValue('consVaporVATgCpVA', st.inletFlow)
    }
    setValue('eficIsoTgCpVA', st.eficIso)
    setValue('consEspMEdTgCpVA', st.medSpecCons)
    setValue('consEspExtTgCpVA', st.extSpecCons)
    setValue('consEspEscTgCpVA', st.escSpecCons)
    setValue('tempEscTgCpVA', st.escTemp)

    let flowDessupVMTgCpVA =  await FlowDes(gerVaporVMTgCpVA, tempExtTgCpVA, 'VM')
    setValue('gerVaporVMDessupVM', flowDessupVMTgCpVA)
}

async function TGCpVALim(extFlow){
    let maxPt = 40
    let minPt = 2
    let maxFlow = 238
    let minFlow = 40
    if (extFlow >= 28){
        minPt = 32.5
        minFlow = 75.0
        minPt = 5
    }else if (extFlow < 28 && extFlow > 0){
        let pointsPt = [(0.0, 38.4), (15.0, 39.5), (28.0, 40.0)]
        let eqPt = await getABEquation(pointsPt)
        maxPt = eqPt.A * extFlow + eqPt.B
        let pointsFlow = [(0.0, 212.0), (15.0, 226.0), (28.0, 238.0)]
        let eqFlow = await getABEquation(pointsFlow)
        maxFlow = eqFlow.A * extFlow + eqFlow.B
    }else{
        maxPt = 38.4
        minPt = 3.75
        maxFlow = 212
    }
    return {
        "maxPt": maxPt,
        "minPt": minPt,
        "maxFlow": maxFlow,
        "minFlow": minFlow 
    }
}

async function TurboGeradorCpVM(){
    let opModeTgCpVM =  await getValue('opModeTgCpVM')

    let pressInTgCpVM =  await getValue('pressInTgCpVM')
    let tempInTgCpVM =  await getValue('tempInTgCpVM')
    let pressEscTgCpVM =  await getValue('pressEscTgCpVM')
    let tempEscTgCpVM =  await getValue('tempEscTgCpVM')

    let st = 0
    
    if (opModeTgCpVM == 0){
        let gerVaporVETgCpVM =  await getValue('gerVaporVETgCpVM')
        st = await steamTurbineWithExtAuto(gerVaporVETgCpVM, pressInTgCpVM, tempInTgCpVM, 0.0, 42.0, 450.0, pressEscTgCpVM, tempEscTgCpVM)
         setValue('ptTgCpVM', st.pt)
    }else{
        let ptTgCpVM =  await getValue('ptTgCpVM')
        st = await steamTurbineWithExtManual(ptTgCpVM, pressInTgCpVM, tempInTgCpVM, 0.0, 42.0, 450.0, pressEscTgCpVM, tempEscTgCpVM)
        setValue('gerVaporVETgCpVM', st.gerVaporVETgCpVM)
    }
    setValue('consVaporVMTgCpVM', st.inletFlow)
    setValue('eficIsoTgCpVM', st.eficIso)
    setValue('consEspTgCpVM', st.specCons)
    setValue('tempEscTgCpVM', st.escTemp)
}

async function TGCpVMLim(){
    let maxFlow = await getMax('consVaporVMTgCpVM')
    let minFlow = await getMin('consVaporVMTgCpVM')
    let maxPt = await getMax('ptTgCpVM')
    let minPt = await getMin('ptTgCpVM')
    return {
        "maxFlow": maxFlow,
        "minFlow": minFlow,
        "maxPt": maxPt,
        "minPt": minPt
    }
}

async function steamTurbineWithExtAuto(escFlow, inletPress, inletTemp, extFlow, extPress, extTemp, escPress, escTemp){
    let escTempSat = await Tsat_p(escPress)+0.1
    if (escTemp < escTempSat){
        escTemp = escTempSat
    }
    
    let inletH = await h_pT(inletPress, inletTemp)
    let inletS = await s_pT(inletPress, inletTemp)
    let inletFlow = escFlow + extFlow
    
    let escH = await h_pT(escPress, escTemp)
    let escPt = escFlow * (inletH - escH) * 0.98 * 0.98 / 3600
    let escSpecCons = escPt == 0 ? 0 : escFlow/escPt
    
    let extH = await h_pT(extPress, extTemp)
    let extPt = extFlow * (inletH - extH) * 0.98 * 0.98 / 3600
    let extSpecCons = extPt == 0 ? 0 : extFlow/extPt
    
    let pt = escPt + extPt
    let medSpecCons = pt == 0 ? pt : inletFlow/pt
    
    let escHiso = await H_ps(escPress, inletS)
    let escEf = (inletH - escH) * 100 / (inletH - escHiso)
    
    let extHiso = await H_ps(extPress, inletS)
    let extEf = (inletH - extH) * 100 / (inletH - extHiso)
    
    let eficIso = inletFlow == 0 ? 0 : (escEf*escFlow + extEf*extFlow)/inletFlow

    return {
        "inletFlow": inletFlow,
        "pt": pt,
        "eficIso": eficIso,
        "medSpecCons": medSpecCons,
        "extSpecCons": extSpecCons,
        "escSpecCons": escSpecCons,
        "escTemp": escTemp
    }
}

async function steamTurbineWithExtManual(pt, inletPress, inletTemp, extFlow, extPress, extTemp, escPress, escTemp){
    let escTempSat = await Tsat_p(escPress)+0.1
    if (escTemp < escTempSat){
        escTemp = escTempSat
    }
    
    let inletH = await h_pT(inletPress, inletTemp)
    let inletS = await s_pT(inletPress, inletTemp)
    let extH = await h_pT(extPress, extTemp)
    let extPt = extFlow * (inletH - extH) * 0.98 * 0.98 / 3600
    let extSpecCons = extPt == 0 ? 0 : extFlow/extPt
    let escH = await h_pT(escPress, escTemp)
    let escPt = pt - extPt
    let escFlow = (escPt * 3600) / ((inletH - escH) * 0.98 * 0.98)
    let escSpecCons = escPt == 0 ? 0 : escFlow/escPt
    let inletFlow = escFlow + extFlow
    let medSpecCons = pt == 0 ? 0 : inletFlow/pt
    let escHiso = await H_ps(escPress, inletS)
    let escEf = (inletH - escH) * 100 / (inletH - escHiso)
    let extHiso = await H_ps(extPress, inletS)
    let extEf = (inletH - extH) * 100 / (inletH - extHiso)
    let eficIso = inletFlow == 0 ? 0 : (escEf*escFlow + extEf*extFlow)/inletFlow

    return {
        "inletFlow": inletFlow,
        "escFlow": escFlow,
        "eficIso": eficIso,
        "medSpecCons": medSpecCons,
        "extSpecCons": extSpecCons,
        "escSpecCons": escSpecCons,
        "escTemp": escTemp
    }
    
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

async function getABEquation(points){
    const meanExt = points.reduce((sum, point) => sum + point.ext, 0) / points.length;
    const meanMax = points.reduce((sum, point) => sum + point.max, 0) / points.length;

    const a = points.reduce((sum, point) => sum + (point.ext - meanExt) * (point.max - meanMax), 0);
    const b = points.reduce((sum, point) => sum + Math.pow(point.ext - meanExt, 2), 0);
    
    return {
        "A": a/b,
        "B": meanMax - a/b * meanExt
    }
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

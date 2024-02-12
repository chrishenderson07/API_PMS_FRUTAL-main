const { setValue, getValue } = require('../../db/funcsDb')

module.exports = {
    RegenCaldoxVinhaca,
    RegenCaldoxCondensado,
    RegenCaldoxMosto
}


//REGENERACAO CALDOxVINHACA
async function RegenCaldoxVinhaca(flowCaldo, tempInCaldo, brixCaldo, flowVinhaca, tempInVinhaca, tempOutVinhaca){
    let qtdeOp = await getValue('opRegCaldoVinhaca')
    let areaTroca = await getValue('regCvCTareaTroca')
    let u = await getValue('uRegCaldoVinhaca')

    let reg = await RegenPlaca(flowVinhaca, tempInVinhaca, tempOutVinhaca, flowCaldo, tempInCaldo, brixCaldo, qtdeOp, u)

    setValue('tempOutCaldoRegCaldoVinhaca', reg.Tsf)
    setValue('mldtRegCaldoVinhaca', reg.mldt)
    setValue('regCvCTareaReq', reg.areaReq)
    setValue('regCvCTareaTrocaTotal', areaTroca * qtdeOp)
}

//REGENERACAO CALDOxCONDENSADO
async function RegenCaldoxCondensado(flowCaldo, tempInCaldo, brixCaldo, flowCond, tempInCond, tempOutCond, placa){
    let qtdeOp = await getValue('opRegCaldoCond')
    let areaTroca = await getValue('regCxCVGCTareaTroca')
    let u = await getValue('uRegCaldoCond')
    
    let reg = 0 

    if (placa){
        reg = RegenPlaca(flowCond, tempInCond, tempOutCond, flowCaldo, tempInCaldo, brixCaldo, qtdeOp, u)
    }else{
        reg = await RegenCascoTuboLL(flowCaldo, tempInCaldo, brixCaldo, flowCond, tempInCond, tempOutCond, 0, qtdeOp, u)
    }
    
    setValue('tempOutCaldoRegCaldoCond', reg.Tsf)
    setValue('mldtRegCaldoCond', reg.mldt)
    setValue('regCxCVGCTareaReq', reg.areaReq)
    setValue('regCxCVGCTareaTrocaTotal', areaTroca * qtdeOp)
}

//REGENERACAO CALDOxMOSTO
async function RegenCaldoxMosto(flowCaldo, tempInCaldo, brixCaldo, flowMosto, tempInMosto, tempOutMosto, brixMosto, placa){
    let qtdeOp = await getValue('opRegCaldoMosto')
    let areaTroca = await getValue('regCxMareaTroca')
    let u = await getValue('uRegCaldoMosto')
    
    let reg = 0 

    if (placa){
        reg = RegenPlaca(flowMosto, tempInMosto, tempOutMosto, flowCaldo, tempInCaldo, brixCaldo, qtdeOp, u)
    }else{
        reg = await RegenCascoTuboLL(flowCaldo, tempInCaldo, brixCaldo, flowMosto, tempInMosto, tempOutMosto, brixMosto, qtdeOp, u)
    }
    
    setValue('tempOutCaldoRegCaldoMosto', reg.Tsf)
    setValue('mldtRegCaldoMosto', reg.mldt)
    setValue('regCxMareaReq', reg.areaReq)
    setValue('regCxMareaTrocaTotal', areaTroca * qtdeOp)
}



async function RegenPlaca(flowq, Teq, Tsq ,flowf, Tef, brixf, qtdeOp, u){
    let Tsf = 0
    let mldt = 0
    let areaReq = 0
    
    let cp = 1 - 0.006 * brixf
    
    if (qtdeOp > 0){
        Tsf = ((flowq * 1000 * (Teq - Tsq)*0.96) + (flowf * 1000 * cp * Tef)) / (flowf * 1000 * cp)
        
        mldt = ((Teq - Tsf) - (Tsq - Tef)) / Math.log((Teq - Tsf) / (Tsq - Tef))
        let q = flowf * 1000 * cp * ( Tsf - Tef)
        areaReq = q*41.8/(u*36*mldt)
        if (!mldt){
            mldt = 0.0
        }
    }else{
        Tsf = Tef
        mldt = 0
        areaReq = 0
    }

    return {
        "Tsf": Tsf,
        "mldt": mldt,
        "areaReq": areaReq
    }
}

async function RegenCascoTuboLL(flowFluidoFrio, tempInFluidoFrio, brixFluidoFrio, flowFluidoQuente, tempInFluidoQuente, tempOutFluidoQuente, brixFluidoQuente, qtdeOp, coefTroca){
    let Tsf = 0
    let mldt = 0
    let areaReq = 0
    
    if (qtdeOp > 0){
        let cpFluidoFrio = 1 - 0.006 * brixFluidoFrio
        let cpFluidoQuente = 1 - 0.006 * brixFluidoQuente
        let q = flowFluidoQuente * cpFluidoQuente * (tempInFluidoQuente - tempOutFluidoQuente) * 0.98
        Tsf = q / (flowFluidoFrio * cpFluidoFrio) + tempInFluidoFrio
        let dt1 = tempInFluidoQuente - tempInFluidoFrio
        let dt2 = tempOutFluidoQuente - self.tempOutFluidoFrio
        mldt = (dt1 - dt2) / log(dt1/dt2)
        areaReq = q * 1000 / (coefTroca * 0.86 * self.mldt)
    }else{
        Tsf = tempInFluidoFrio
        mldt = 0.0
        areaReq = 0.0
    }

    return {
        "Tsf": Tsf,
        "mldt": mldt,
        "areaReq": areaReq
    }
}



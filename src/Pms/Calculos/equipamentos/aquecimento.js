const { Tsat_p, hV_p, hL_p } = require('../modulos/steamTables')
const { getValue } = require('../../db/funcsDb')

module.exports = {
    AqCascoTuboVL,
    AqCascoTuboVFL,
}

//Aquecedor Casco Tubo Vapor Flash
async function AqCascoTuboVFL(flowCaldo, tempInCaldo, brixCaldo, flowFVL, qtdeOp, coefTroc, utilVFL, area){
    let util = 0
    let tempOut = 0
    let consVapor = 0
    
    let pressVG = await getValue('pressureVFL')
    consVapor = flowFVL * utilVFL/100

    if (qtdeOp > 0){
        let cpCaldo = 1 - 0.006 * brixCaldo
        let temp_vg = await Tsat_p(pressVG)
        let cl_vg = (await hV_p(pressVG) - await hL_p(pressVG))*0.98/4.18
        let calorTrocReal = consVapor * cl_vg / 1.05
        tempOut = calorTrocReal / (flowCaldo * cpCaldo) + tempInCaldo
        
        let temp_out = temp_vg  - Math.pow(2.71828182845904,(Math.log(temp_vg - tempInCaldo) - (coefTroc * 0.86 * area * qtdeOp / flowCaldo / 1000 / cpCaldo)))
        let calor_troc = flow * cpCaldo * (temp_out - tempInCaldo) * 0.98
        util = calorTrocReal * 100 / calor_troc

    }else{
        util = 0.0
        tempOut = tempInCaldo
        self.consVapor = 0.0
    }

    return {
        "util": util,
        "tempOut": tempOut,
        "consVapor": consVapor
    }
}

//Aquecedor Casco Tubo Vapor-Liquido
async function AqCascoTuboVL(
    flow,
    tempIn,
    tempOut,
    brix,
    pressVG,
    area,
    qtdeOp,
    coefTroca){

    var consVapor = 0
    var util = 0
    var calorTroc = 0
        
    if (qtdeOp > 0){
        let cpCaldo = 1 - 0.006 * brix;
        let temp_vg = await Tsat_p(pressVG);

        let cl_vg = (await hV_p(pressVG) - await hL_p(pressVG)) * 0.98 / 4.18;

        let temp_out = temp_vg - Math.pow(2.71828182845904, (Math.log(temp_vg - tempIn) - (coefTroca * 0.86 * area * qtdeOp / flow / 1000 / cpCaldo)));

        let calor_troc = flow * cpCaldo * (temp_out - tempIn) * 0.98;
        let calorTrocReal = flow * cpCaldo * (tempOut - tempIn);

        util = (calorTrocReal * 100) / calor_troc;
        consVapor = calorTrocReal / cl_vg;
        calorTroc = calorTrocReal;

        // if (pressVG == 1.8){
            console.log(`cl_vg ` + cl_vg + ` ` + pressVG + ` ` + await hV_p(pressVG) + ` ` + await hL_p(pressVG) + ` ` + calorTrocReal + ` ` + consVapor)
        // }
        console.log(`calorTrocReal ` + calorTrocReal + ` ` + flow + ` ` + cpCaldo + ` ` + tempOut + ` ` + tempIn)
        
    }
    return {"consVapor": consVapor, "util": util, "calorTroc": calorTroc}
}
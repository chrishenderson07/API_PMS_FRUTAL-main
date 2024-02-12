

module.exports = {
    Tsat_p,
    hV_p,
    hL_p,
    H_px,
    h_Tx,
    hL_T,
    hV_T,
    h_pT,
    s_pT,
    H_ps,
    T_ph,
    Teste
}

async function Teste(req, res){
    const { pressao } = req.params
    const hv = await hV_p(pressao)
    const h4v = await h4V_p(pressao/10)
    const t4 = await T4_p(pressao/10)
    const hl = await hL_p(pressao)
    const resposta = {
        "pressao": pressao,
        "hV_p": hv,
        "hL_p": hl,
        "h4V_p": h4v,
        "T4_p": t4
    }
    return res.json(resposta)
}

//1.2 Temperature
async function Tsat_p(p) {
    let pSI = await toSIunit_p(p)
    if (pSI >= 0.000611657 && pSI <= 22.06395 + 0.001) {
        let t = await T4_p(pSI)
        return await fromSIunit_T(t)
    } else {
        return 0;
    }
}

// func Tsat_s (s:Double)->Double{
//     if(s > -0.0001545495919 && s < 9.155759395 ){
//         return T4_p(p: P4_s(s: s))
//     }else{
//         return 0.0
//     }
// }

async function T_ph (p, h) {
    let pSI = await toSIunit_p(p)
    switch(await Region_ph(pSI, h)){
        case 1:
            return await T1_ph(pSI, h)
        case 2:
            return await T2_ph(pSI, h)
        case 3:
            return await T3_ph(pSI, h)
        case 4:
            return await T4_p(pSI)
        case 5:
            return await T5_ph(pSI, h)
        default:
        //invalid_input();
        ////alert("Invalid Input!!!")
        return 0.0
    }
}

// func T_ps (p:Double, s:Double)->Double{
// switch( Region_ps(p: p, s: s)){
//    case 1:
//        return T1_ps(p: p, s: s)
//    case 2:
//        return T2_ps(p: p, s: s)
//    case 3:
//        return T3_ps(p: p, s: s)
//    case 4:
//        return T4_p(p: p)
//    case 5:
//        return T5_ps(p: p, s: s)
//    default:
//        return 0.0
//        //alert("Invalid Input!!!");
//    }
// }

// func T_hs (h:Double, s:Double)->Double{
//    switch(Region_hs(h: h, s: s)){
//        case 1:
//            return T1_ph(p: P1_hs(h: h, s: s), h: h)
//        case 2:
//            return T2_ph(p: P2_hs(h: h, s: s), h: h)
//        case 3:
//            return T3_ph(p: P3_hs(h: h, s: s), h: h)
//        case 4:
//            return T4_hs(h: h, s: s)
//        case 5:
//            return 0.0 //Functions of hs is ! implemented in region 5;
//            //alert("Invalid Input!!!");
//        default:
//        //alert("Invalid Input!!!");
//            return 0.0
//    }
// }

async function T4_p(p) {
    let beta = Math.pow(p, 0.25);
    let e = Math.pow(beta, 2) - 17.073846940092 * beta + 14.91510861353;
    let f = 1167.0521452767 * Math.pow(beta, 2) + 12020.82470247 * beta - 4823.2657361591;
    let g = -724213.16703206 * Math.pow(beta, 2) - 3232555.0322333 * beta + 405113.40542057;
    let discriminant = Math.pow(f, 2) - 4 * e * g;
    let d = 2 * g / (-f - Math.sqrt(discriminant));

    return (650.17534844798 + d - Math.sqrt(Math.pow(650.17534844798 + d, 2) - 4 * (-0.23855557567849 + 650.17534844798 * d))) / 2;
}

//1.4 Enthalpy (h)
async function hV_p (p){
    let pSI = await toSIunit_p(p)
    if(pSI > 0.000611657 && pSI < 22.06395 ){
        return await fromSIunit_h(await h4V_p(pSI))
    }else{
        return 0.0
   }
}

async function hL_p (p){
    let pSI = await toSIunit_p(p)
    if(pSI > 0.000611657 && pSI < 22.06395 ){
        return await fromSIunit_h(await h4L_p(pSI))
    }else{
        return 0.0
    }
}

async function hV_T (t){
    let tSI = await toSIunit_T(t)
    if(tSI > 273.15 && tSI < 647.096 ){
        return await fromSIunit_h(await h4V_p(await p4_T(tSI)))
    }else{
        return 0.0
    }
}

async function hL_T (t){
    let tSI = await toSIunit_T(t)
    if(tSI > 273.15 && tSI < 647.096 ){
        return await fromSIunit_h(await h4L_p(await p4_T(tSI)))
    }else{
        return 0.0
    }
}

async function h_pT (p, t){
    let pSI = await toSIunit_p(p)
    let tSI = await toSIunit_T(t)
    
    switch(await region_pT(pSI, tSI)){
        case 1:
            return await fromSIunit_h(await h1_pT(pSI, tSI))
        case 2:
            return await fromSIunit_h(await h2_pT(pSI, tSI))
        case 3:
            return await fromSIunit_h(await h3_pT(pSI, tSI))
        case 4:
            //alert("Invalid Input!!!");
            return 0.0
        case 5:
            return await fromSIunit_h(h5_pT(pSI, tSI))
        default:
            //alert("Invalid Input!!!")
            return 0.0
    }
}

async function H_ps (p, s){
    let pSI = await toSIunit_p(p)
    let sSI = await toSIunit_s(s)

    switch( Region_ps(pSI, sSI)){
        case 1:
            return h1_pT(pSI, await T1_ps(pSI, sSI))
        case 2:
            return h2_pT(pSI, await T2_ps(pSI, sSI))
        case 3:
            return await h3_rhoT(1/ await V3_ps(pSI, sSI), await T3_ps(pSI, sSI))
        case 4:
            let xs = await X4_ps(pSI, sSI)
            return (xs * await h4V_p(pSI) + (1 - xs) * await h4L_p(pSI))
        case 5:
            return await h5_pT(pSI, await T5_ps(pSI, sSI))
        default:
            //alert("Invalid Input!!!");
            return 0.0
    }
}

async function H_px(p, x) {
    pSI = await toSIunit_p(p);
    if (x > 1 || x < 0 || pSI >= 22.064) {
        return 0;
    }
    let hL = await h4L_p(pSI);
    let hV = await h4V_p(pSI);
    return await fromSIunit_h(hL + x * (hV - hL));
}

async function h_Tx(T, x) {
    tSI = await toSIunit_T(T);
    if (x > 1 || x < 0 || tSI >= 647.096) {
        return 0.0;
    }
    let p = await p4_T(tSI);
    let hL = await h4L_p(p);
    let hV = await h4V_p(p);
    return await fromSIunit_h(hL + x * (hV - hL));
}

async function h4L_p(p) {
    if (p > 0.000611657 && p < 22.06395) {
        let Ts = await T4_p(p);
        if (p < 16.529) {
            return await h1_pT(p, Ts);
        } else {
            // Iterate to find the backward solution of P3sat_h
            let lowBound1 = 1670.858218;
            let highBound1 = 2087.23500164864;
            let ps = 0.0;
            let hs = 0.0;
            
            while (Math.abs(p - ps) > 0.00001) {
                hs = (lowBound1 + highBound1) / 2;
                ps = await P3sat_h(hs);
                
                if (ps > p) {
                    highBound1 = hs;
                } else {
                    lowBound1 = hs;
                }
            }
            
            return hs;
        }
    } else {
        return 0;
    }
}

async function h4V_p(p) {
    if (p > 0.000611657 && p < 22.06395) {
        let Ts = await T4_p(p);
        if (p < 16.529) {
            return await h2_pT(p, Ts);
        } else {
            // Iterate to find the backward solution of P3sat_h
            let lowBound2 = 2087.23500164864;
            let highBound2 = 2563.592004 + 5; // 5 added to extrapolate to ensure even the border ==350°C solved.
            let ps = 0.0;
            let hs = 0.0;
            
            while (Math.abs(p - ps) > 0.000001) {
                hs = (lowBound2 + highBound2) / 2;
                ps = await P3sat_h(hs);
                
                if (ps < p) {
                    lowBound2 = hs;
                } else {
                    highBound2 = hs;
                }
            }
            
            return hs;
        }
    } else {
        return 0;
    }
}

async function h1_pT(p, T) {
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 5 Equations for Region 1, Section. 5.1 Basic Equation;
    // Equation 7, Table 3, Page 6;

    const R = 0.461526; // kJ/(kg K)
    const I1 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32];
    const J1 = [-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41];
    const n1 = [0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26];

    p = p / 16.53;
    const tau = 1386 / T;
    let g_t = 0.0;

    for (let i = 0; i <= 33; i++) {
        g_t += n1[i] * Math.pow(7.1 - p, I1[i]) * J1[i] * Math.pow(tau - 1.222, J1[i] - 1);
    }

    return R * T * tau * g_t;
}

async function h2_pT(p, T) {
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 6 Equations for Region 2, Section. 6.1 Basic Equation;
    // Table 11 && 12, Page 14 and 15;

    const R = 0.461526; // kJ/(kg K)
    const J0 = [0, 1, -5, -4, -3, -2, -1, 2, 3];
    const n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307];
    const Ir = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24];
    const Jr = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58];
    const nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07];

    const tau = 540 / T;
    let g0_tau = 0.0;

    for (let i = 0; i <= 8; i++) {
        g0_tau += n0[i] * J0[i] * Math.pow(tau, J0[i] - 1);
    }

    let gr_tau = 0.0;

    for (let i = 0; i <= 42; i++) {
        gr_tau += nr[i] * Math.pow(p, Ir[i]) * Jr[i] * Math.pow(tau - 0.5, Jr[i] - 1);
    }

    return R * T * tau * (g0_tau + gr_tau);
}

async function h3_pT (p, T){
    //Not avalible with IF 97;
    //Solve function T3_ph-T=0 with half interval method.;
    //ver2.6 Start corrected bug;
    var Low_Bound = 0.0
    var High_Bound = 0.0
    var Ts = 0.0
    if(p < 22.06395 ){ //Bellow tripple point;
        Ts = await T4_p(p)    //Saturation temperature;
        if(T <= Ts ){  //Liquid side;
            High_Bound = await h4L_p(p) //Max h är liauid h.;
            Low_Bound = await h1_pT(p, 623.15)
        }else{
            Low_Bound = await h4V_p(p)  //Min h är Vapour h.;
            High_Bound = await h2_pT(p, await B23T_p(p))
        }
    }else{     //Above tripple point. R3 from R2 till R3.;
        Low_Bound = await h1_pT(p, 623.15)
        High_Bound = await h2_pT(p, await B23T_p(p))
    }

    //ver2.6 End corrected bug;
    Ts = T + 1
    var hss = 0.0
    while(Math.abs(T - Ts) > 0.000001){
        hss = (Low_Bound + High_Bound) / 2
        Ts = await T3_ph(p, hss)
        if(Ts > T ){
            High_Bound = hss
        }else{
            Low_Bound = hss
        }
    }
    return hss
}

//***********************************************************************************************************
    //*1.7 Specific entropy (s)
    
    // func sV_p (p:Double)->Double{
    //     let p = toSIunit_p(p: p)
    //  	if(p > 0.000611657 && p < 22.06395 ){
    //  		if(p < 16.529 ){
    //  			return fromSIunit_s(s: s2_pT(p: p, T: T4_p(p: p)))
    //  		}else{
    //             return fromSIunit_s(s: s3_rhoT(rho: 1 / (V3_ph(p: p, h: h4V_p(p: p))), T: T4_p(p: p)))
    //  		}
    //  	}else{
    //  		return 0.0
    //  	}
    //  }
    
    // func sL_p (p:Double)->Double{
    //     let p = toSIunit_p(p: p)
    //  	if(p > 0.000611657 && p < 22.06395 ){
    //  		if(p < 16.529 ){
    //             return fromSIunit_s(s: s1_pT(p: p, T: T4_p(p: p)))
    //  		}else{
    //             return fromSIunit_s(s: s3_rhoT(rho: 1 / (V3_ph(p: p, h: h4L_p(p: p))), T: T4_p(p: p)));
    //  		}
    //  	}else{
    //  		return 0.0
    //  	}
    //  }
    
    // func sV_T (T:Double)->Double{
    //     let T = toSIunit_T(t: T)
    //  	if(T > 273.15 && T < 647.096 ){
    //  		if(T <= 623.15 ){
    //             return fromSIunit_s(s: s2_pT(p: p4_T(t: T), T: T))
    //  		}else{
    //             return fromSIunit_s(s: s3_rhoT(rho: 1 / (V3_ph(p: p4_T(t: T), h: h4V_p(p: p4_T(t: T)))), T: T))
    //  		}
    //  	}else{
    //  		return 0.0
    //  	}
    //  }
    
    // func sL_T (T:Double)->Double{
    //     let T = toSIunit_T(t: T)
    //  	if(T > 273.15 && T < 647.096 ){
    //  		if(T <= 623.15 ){
    //             return fromSIunit_s(s: s1_pT(p: p4_T(t: T), T: T))
    //  		}else{
    //             return fromSIunit_s(s: s3_rhoT(rho: 1 / (V3_ph(p: p4_T(t: T), h: h4L_p(p: p4_T(t: T)))), T: T))
    //  		}
    //  	}else{
    //  		return 0.0
    //  	}
    //  }
    
async function s_pT(p, t){
    let pSI = await toSIunit_p(p)
    let tSI = await toSIunit_T(t)
    
    switch(await region_pT(pSI, tSI)){
        case 1:
            return await fromSIunit_s(await s1_pT(pSI, tSI))
        case 2:
            return await fromSIunit_s(await s2_pT(pSI, tSI))
        case 3:
            return await fromSIunit_s(await s3_rhoT(1 / await V3_ph(pSI, await h3_pT(pSI, tSI)), tSI))
        case 4:
            //alert("Invalid Input!!!");
            return 0.0
        case 5:
            return await fromSIunit_s(await s5_pT(pSI, tSI))
        default:
            //alert("Invalid Input!!!")
            return 0.0
    }
}
    
    // func S_ph (p:Double, h:Double)->Double{
    //     let p = toSIunit_p(p: p)
    //     let h = toSIunit_h(h: h)

    //     switch(Region_ph(p: p, h: h)){
    //         case 1:
    //             return fromSIunit_s(s: s1_pT(p: p, T: T1_ph(p: p, h: h)))
    //         case 2:
    //             return fromSIunit_s(s: s2_pT(p: p, T: T2_ph(p: p, h: h)))
    //         case 3:
    //             return fromSIunit_s(s: s3_rhoT(rho: 1/V3_ph(p: p, h: h), T: T3_ph(p: p, h: h)))
    //         case 4:
    //             let Ts = T4_p(p: p)
    //             let xs = x4_Ph(p: p, h: h)
    //             var s4V = 0.0
    //             var s4L = 0.0
    //             var v4V = 0.0
    //             var v4L = 0.0
    //             if(p < 16.529 ){
    //                 s4V = s2_pT(p: p, T: Ts)
    //                 s4L = s1_pT(p: p, T: Ts)
    //             }else{
    //                 v4V = V3_ph(p: p, h: h4V_p(p: p))
    //                 s4V = s3_rhoT(rho: 1/v4V, T: Ts)
    //                 v4L = V3_ph(p: p, h: h4L_p(p: p))
    //                 s4L = s3_rhoT(rho: 1/v4L, T: Ts)
    //             }
    //             return fromSIunit_s(s: (xs * s4V + (1 - xs) * s4L))
    //         case 5:
    //             return fromSIunit_s(s: s5_pT(p: p, T: T5_ph(p: p, h: h)))
    //         default:
    //             return 0.0
    //     }
    // }

//***********************************************************************************************************
     //*2 IAPWS IF 97 Calling functions                                                                          *
     //***********************************************************************************************************
     //
     //***********************************************************************************************************
     //*2.1 Functions for region 1
    
    //  func v1_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //5 Equations for Region 1, Section. 5.1 Basic Equation;
    //     //Eqution 7, Table 3, Page 6;
        
    //     let R = 0.461526 //kJ/(kg K);
    //     let I1:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32]
    //     let J1:[Double] = [-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41]
    //     let n1 = [0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26]
    //     let ps = p / 16.53
    //     let tau = 1386 / T
    //     var g_p = 0.0
    //     for i:Int in 0...33{
    //         g_p = g_p - n1[i] * I1[i] * pow((7.1 - ps),(I1[i] - 1)) * pow((tau - 1.222) , J1[i])
    //     }
    //     return R * T / p * ps * g_p / 1000
    // }
    
    // func h1_pT (p:Double, T:Double) -> Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //5 Equations for Region 1, Section. 5.1 Basic Equation;
    //     //Eqution 7, Table 3, Page 6;
    //     let R  = 0.461526 //kJ/(kg K)
    //     let I1:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32]
    //     let J1:[Double] = [-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41]
    //     let n1 = [0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26]
    //     let p = p / 16.53
    //     let tau = 1386 / T
    //     var g_t = 0.0
    //     for i:Int in 0...33{
    //         g_t = g_t + (n1[i] * pow((7.1 - p) , I1[i]) * J1[i] * pow((tau - 1.222) , (J1[i] - 1)));
    //     }
    //     return  R * T * tau * g_t;
    // }
    
    // func u1_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //5 Equations for Region 1, Section. 5.1 Basic Equation;
    //     //Eqution 7, Table 3, Page 6;
    //     let R = 0.461526 //kJ/(kg K)
    //     let I1:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32]
    //     let J1:[Double] = [-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41]
    //     let n1 = [0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26]
    //     let p = p / 16.53
    //     let tau = 1386 / T
    //     var g_t = 0.0
    //     var g_p = 0.0
    //     for i:Int in 0...33{
    //         g_p = g_p - n1[i] * I1[i] * pow((7.1 - p) , (I1[i] - 1)) * pow((tau - 1.222) , J1[i])
    //         g_t = g_t + (n1[i] * pow((7.1 - p) , I1[i]) * J1[i] * pow((tau - 1.222) , (J1[i] - 1)))
    //     }
    //     return R * T * (tau * g_t - p * g_p)
    // }
    
async function s1_pT (P, t){
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 5 Equations for Region 1, Section. 5.1 Basic Equation;
    // Eqution 7, Table 3, Page 6;
    let R  = 0.461526 //kJ/(kg K)
    let I1 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32]
    let J1 = [-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41]
    let n1 = [0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26]
    let p = P / 16.53
    let T = 1386 / t
    var g = 0.0
    var g_t = 0.0
    for (let i = 0; i <= 33; i++){
        g_t = g_t + (n1[i] * Math.pow((7.1 - p) , I1[i]) * J1[i] * Math.pow((T - 1.222) , (J1[i] - 1)))
        g = g + n1[i] * Math.pow((7.1 - p) , I1[i]) * Math.pow((T - 1.222) , J1[i])
    }
    return R * T * g_t - R * g
}
    
    // // function Cp1_pT (p, T){
    // // 	var i, G_tt, I1,  J1,  n1;
    // // 	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // // 	//5 Equations for Region 1, Section. 5.1 Basic Equation;
    // // 	//Eqution 7, Table 3, Page 6;
    // // 	const R As Double = 0.461526; //kJ/(kg K)
    // // 	I1 = Array(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32);
    // // 	J1 = Array(-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41);
    // // 	n1 = Array(0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26);
    // // 	p = p / 16.53;
    // // 	T = 1386 / T;
    // // 	G_tt = 0#;
    // // 	for(i=0; i<=33; i++){
    // // 		G_tt = G_tt + (n1[i] * Math.pow((7.1 - p) , I1[i]) * J1[i] * (J1[i] - 1) * Math.pow((T - 1.222) , (J1[i] - 2)));
    // // 	}
    // // 	return -R * Math.pow(T ,2) * G_tt;
    // // }
    
    // // function Cv1_pT (p, T){
    // // 	var i, g_p,  g_pp,  g_pt,  G_tt, I1,  J1,  n1;
    // // 	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // // 	//5 Equations for Region 1, Section. 5.1 Basic Equation;
    // // 	//Eqution 7, Table 3, Page 6;
    // // 	const R As Double = 0.461526; //kJ/(kg K)
    // // 	I1 = Array(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32);
    // // 	J1 = Array(-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41);
    // // 	n1 = Array(0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26);
    // // 	p = p / 16.53;
    // // 	T = 1386 / T;
    // // 	g_p = 0#;
    // // 	g_pp = 0#;
    // // 	g_pt = 0#;
    // // 	G_tt = 0#;
    // // 	for(i=0; i<=33; i++){
    // // 		g_p = g_p - n1[i] * I1[i] * Math.pow((7.1 - p) , (I1[i] - 1)) * Math.pow((T - 1.222) , J1[i]);
    // // 		g_pp = g_pp + n1[i] * I1[i] * (I1[i] - 1) * Math.pow((7.1 - p) , (I1[i] - 2)) * Math.pow((T - 1.222) , J1[i]);
    // // 		g_pt = g_pt - n1[i] * I1[i] * Math.pow((7.1 - p) , (I1[i] - 1)) * J1[i] * Math.pow((T - 1.222) , (J1[i] - 1));
    // // 		G_tt = G_tt + n1[i] * Math.pow((7.1 - p) , I1[i]) * J1[i] * (J1[i] - 1) * Math.pow((T - 1.222) , (J1[i] - 2));
    // // 	}
    // // 	return R * (-(Math.pow(T ,2) * G_tt) + Math.pow((g_p - T * g_pt) ,2) / g_pp);
    // // }
    
    // // function w1_pT (p, T){
    // // 	var i, g_p,  g_pp,  g_pt,  G_tt,  tau, I1,  J1,  n1;
    // // 	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // // 	//5 Equations for Region 1, Section. 5.1 Basic Equation;
    // // 	//Eqution 7, Table 3, Page 6;
    // // 	const R As Double = 0.461526; //kJ/(kg K)
    // // 	I1 = Array(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 8, 8, 21, 23, 29, 30, 31, 32);
    // // 	J1 = Array(-2, -1, 0, 1, 2, 3, 4, 5, -9, -7, -1, 0, 1, 3, -3, 0, 1, 3, 17, -4, 0, 6, -5, -2, 10, -8, -11, -6, -29, -31, -38, -39, -40, -41);
    // // 	n1 = Array(0.14632971213167, -0.84548187169114, -3.756360367204, 3.3855169168385, -0.95791963387872, 0.15772038513228, -0.016616417199501, 8.1214629983568E-04, 2.8319080123804E-04, -6.0706301565874E-04, -0.018990068218419, -0.032529748770505, -0.021841717175414, -5.283835796993E-05, -4.7184321073267E-04, -3.0001780793026E-04, 4.7661393906987E-05, -4.4141845330846E-06, -7.2694996297594E-16, -3.1679644845054E-05, -2.8270797985312E-06, -8.5205128120103E-10, -2.2425281908E-06, -6.5171222895601E-07, -1.4341729937924E-13, -4.0516996860117E-07, -1.2734301741641E-09, -1.7424871230634E-10, -6.8762131295531E-19, 1.4478307828521E-20, 2.6335781662795E-23, -1.1947622640071E-23, 1.8228094581404E-24, -9.3537087292458E-26);
    // // 	p = p / 16.53;
    // // 	tau = 1386 / T;
    // // 	g_p = 0#;
    // // 	g_pp = 0#;
    // // 	g_pt = 0#;
    // // 	G_tt = 0#;
    // // 	for(i=0; i<=33; i++){
    // // 		g_p = g_p - n1[i] * I1[i] * Math.pow((7.1 - p) , (I1[i] - 1)) * Math.pow((tau - 1.222) , J1[i]);
    // // 		g_pp = g_pp + n1[i] * I1[i] * (I1[i] - 1) * Math.pow((7.1 - p) , (I1[i] - 2)) * Math.pow((tau - 1.222) , J1[i]);
    // // 		g_pt = g_pt - n1[i] * I1[i] * Math.pow((7.1 - p) , (I1[i] - 1)) * J1[i] * Math.pow((tau - 1.222) , (J1[i] - 1));
    // // 		G_tt = G_tt + n1[i] * Math.pow((7.1 - p) , I1[i]) * J1[i] * (J1[i] - 1) * Math.pow((tau - 1.222) , (J1[i] - 2));
    // // 	}
    // // 	return Math.pow((1000 * R * T * Math.pow(g_p ,2) / (Math.pow((g_p - tau * g_pt) ,2) / (Math.pow(tau ,2) * G_tt) - g_pp)) ,0.5);
    // // }
    
async function T1_ph (p, H){
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 5 Equations for Region 1, Section. 5.1 Basic Equation, 5.2.1 The Backward Equation T ( p,h );
    // Eqution 11, Table 6, Page 10;
    let I1 = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6]
    let J1 = [0, 1, 2, 6, 22, 32, 0, 1, 2, 3, 4, 10, 32, 10, 32, 10, 32, 32, 32, 32]
    let n1 = [-238.72489924521, 404.21188637945, 113.49746881718, -5.8457616048039, -1.528548241314E-04, -1.0866707695377E-06, -13.391744872602, 43.211039183559, -54.010067170506, 30.535892203916, -6.5964749423638, 9.3965400878363E-03, 1.157364750534E-07, -2.5858641282073E-05, -4.0644363084799E-09, 6.6456186191635E-08, 8.0670734103027E-11, -9.3477771213947E-13, 5.8265442020601E-15, -1.5020185953503E-17]
    let h = H / 2500
    var T = 0.0
    for (let i = 0; i <= 19; i++){
        T = T + n1[i] * Math.pow(p , I1[i]) * Math.pow(h + 1 , J1[i])
    }
    return T
}
        
async function T1_ps (p, s){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //5 Equations for Region 1, Section. 5.1 Basic Equation, 5.2.2 The Backward Equation T ( p, s );
    //Eqution 13, Table 8, Page 11;
    let I1 = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4]
    let J1 = [0, 1, 2, 3, 11, 31, 0, 1, 2, 3, 12, 31, 0, 1, 2, 9, 31, 10, 32, 32]
    let n1 = [174.78268058307, 34.806930892873, 6.5292584978455, 0.33039981775489, -1.9281382923196E-07, -2.4909197244573E-23, -0.26107636489332, 0.22592965981586, -0.064256463395226, 7.8876289270526E-03, 3.5672110607366E-10, 1.7332496994895E-24, 5.6608900654837E-04, -3.2635483139717E-04, 4.4778286690632E-05, -5.1322156908507E-10, -4.2522657042207E-26, 2.6400441360689E-13, 7.8124600459723E-29, -3.0732199903668E-31]
    var t1ps = 0.0
    for (let i = 0; i <= 19; i++){
        t1ps =  t1ps + n1[i] * Math.pow(p, I1[i]) * Math.pow(s + 2, J1[i])
    }
    return t1ps
}
    
    // func P1_hs (h: Double, s: Double)-> Double{
    //     //Supplementary Release on Backward Equations for Pressure as a Function of Enthalpy && Entropy p(h,s) to the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //     //5 Backward Equation p(h,s) for Region 1;
    //     //Eqution 1, Table 2, Page 5;
    //     let I1:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 5]
    //     let J1:[Double] = [0, 1, 2, 4, 5, 6, 8, 14, 0, 1, 4, 6, 0, 1, 10, 4, 1, 4, 0]
    //     let n1 = [-0.691997014660582, -18.361254878756, -9.28332409297335, 65.9639569909906, -16.2060388912024, 450.620017338667, 854.68067822417, 6075.23214001162, 32.6487682621856, -26.9408844582931, -319.9478483343, -928.35430704332, 30.3634537455249, -65.0540422444146, -4309.9131651613, -747.512324096068, 730.000345529245, 1142.84032569021, -436.407041874559]
    //     let h = h / 3400
    //     let s = s / 7.6
    //     var p = 0.0
        
    //     for i:Int in 0...18{
    //         p = p + n1[i] * pow((h + 0.05), I1[i]) * pow((s + 0.05), J1[i]);
    //     }
    //     return p * 100
    // }
    
    
    // func T1_prho (p:Double, rho:Double)->Double{
    //  	//Solve by iteration. Observe that fo low temperatures this equation has 2 solutions.;
    //  	//Solve with half interval method;
    //  	var Low_Bound = 273.15
    //  	var High_Bound = T4_p(p: p)
    //     var rhos = 0.0
    //     var Ts = 0.0
    //  	while( abs(rho - rhos) > 0.00001){
    //  		Ts = (Low_Bound + High_Bound) / 2
    //  		rhos = 1 / v1_pT(p: p, T: Ts)
    //  		if(rhos < rho ){
    //  				High_Bound = Ts
    //  			}else{
    //  				Low_Bound = Ts
    //  			}
    //  	}
    //  	return Ts
    //  }

        //MARK: REGION 2
    // //***********************************************************************************************************
    // //*2.2 Functions for region 2
    
    // func v2_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //6 Equations for Region 2, Section. 6.1 Basic Equation;
    //     //Table 11 && 12, Page 14 and 15;
    //     let R = 0.461526 //kJ/(kg K)
    //     //let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //     //let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //     let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //     let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //     let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //     let tau = 540 / T
    //     let g0_pi = 1 / p
    //     var gr_pi = 0.0
    //     for i:Int in 0...42{
    //         gr_pi = gr_pi + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * pow((tau - 0.5) , Jr[i])
    //     }
    //     return R * T / p * p * (g0_pi + gr_pi) / 1000
    // }
    
    // func h2_pT (p:Double, T:Double) -> Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //6 Equations for Region 2, Section. 6.1 Basic Equation;
    //     //Table 11 && 12, Page 14 and 15;
    //     let R  = 0.461526; //kJ/(kg K)
    //     let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //     let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //     let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //     let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //     let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //     let tau = 540 / T
    //     var g0_tau = 0.0
    //     for i:Int in 0...8{
    //         g0_tau = g0_tau + n0[i] * J0[i] * pow(tau , (J0[i] - 1))
    //     }
    //     var gr_tau = 0.0
    //     for i:Int in 0...42{
    //         gr_tau = gr_tau + nr[i] * pow(p , Ir[i]) * Jr[i] * pow((tau - 0.5) , (Jr[i] - 1))
    //     }
    //     return  R * T * tau * (g0_tau + gr_tau)
    // }
        
    // func u2_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //6 Equations for Region 2, Section. 6.1 Basic Equation;
    //     //Table 11 && 12, Page 14 and 15;
    //     let R = 0.461526 //kJ/(kg K)
    //     let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //     let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //     let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //     let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //     let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //     let tau = 540 / T
    //     let g0_pi = 1 / p
    //     var g0_tau = 0.0
    //     for i:Int in 0...8{
    //         g0_tau = g0_tau + n0[i] * J0[i] * pow(tau , (J0[i] - 1))
    //     }
    //     var gr_pi = 0.0
    //     var gr_tau = 0.0
    //     for i:Int in 0...42{
    //         gr_pi = gr_pi + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * pow((tau - 0.5) , Jr[i])
    //         gr_tau = gr_tau + nr[i] * pow(p , Ir[i]) * Jr[i] * pow((tau - 0.5) , (Jr[i] - 1))
    //     }
    //     return  R * T * (tau * (g0_tau + gr_tau) - p * (g0_pi + gr_pi))
    // }
    
async function s2_pT (p, T){
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 6 Equations for Region 2, Section. 6.1 Basic Equation;
    // Table 11 && 12, Page 14 and 15;
    let R = 0.461526; //kJ/(kg K)
    let J0 = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    let Ir = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    let Jr = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    let tau = 540 / T
    var g0 = Math.log(p)
    var g0_tau = 0.0
    for (let i = 0; i <= 8; i++){
        g0 = g0 + n0[i] * Math.pow(tau , J0[i])
        g0_tau = g0_tau + n0[i] * J0[i] * Math.pow(tau , (J0[i] - 1))
    }
    var gr = 0.0
    var gr_tau = 0.0
    for (let i = 0; i <= 42; i++){
        gr = gr + nr[i] * Math.pow(p , Ir[i]) * Math.pow((tau - 0.5) , Jr[i])
        gr_tau = gr_tau + nr[i] * Math.pow(p , Ir[i]) * Jr[i] * Math.pow((tau - 0.5) , (Jr[i] - 1))
    }
    return  R * (tau * (g0_tau + gr_tau) - (g0 + gr))
}
    
    
    // func Cp2_pT (p:Double, T:Double)->Double{
    //  	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //  	//6 Equations for Region 2, Section. 6.1 Basic Equation;
    //  	//Table 11 && 12, Page 14 and 15;
    //  	let R  = 0.461526 //kJ/(kg K)
    //     let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //  	let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //     let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //     let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //  	let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //  	let tau = 540 / T
    //  	var g0_tautau = 0.0
    //     for i:Int in 0...8{
    //         g0_tautau = g0_tautau + n0[i] * J0[i] * (J0[i] - 1) * pow(tau , (J0[i] - 2))
    //     }
    //  	var gr_tautau = 0.0
    //     for i:Int in 0...42{
    //  		gr_tautau = gr_tautau + nr[i] * pow(p , Ir[i]) * Jr[i] * (Jr[i] - 1) * pow((tau - 0.5) , (Jr[i] - 2))
    //  	}
    //  	return -R * pow(tau ,2) * (g0_tautau + gr_tautau)
    //  }
    
    
    // func Cv2_pT (p:Double, T:Double)->Double{
    //  	//var i, tau,  g0_tautau,  gr_pi,  gr_pitau,  gr_pipi,  gr_tautau, Ir,  Jr,  nr,  J0,  n0;
    //  	let R = 0.461526 //kJ/(kg K)
    //     let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //  	let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //  	let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //  	let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //  	let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //  	let tau = 540 / T
    //  	var g0_tautau = 0.0
    //  	for i:Int in 0...8{
    //  		g0_tautau = g0_tautau + n0[i] * J0[i] * (J0[i] - 1) * pow(tau , (J0[i] - 2))
    //  	}
    //  	var gr_pi = 0.0
    //  	var gr_pitau = 0.0
    //  	var gr_pipi = 0.0
    //  	var gr_tautau = 0.0
    //  	for i:Int in 0...42{
    //  		gr_pi = gr_pi + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * pow((tau - 0.5) , Jr[i])
    //  		gr_pipi = gr_pipi + nr[i] * Ir[i] * (Ir[i] - 1) * pow(p , (Ir[i] - 2)) * pow((tau - 0.5) , Jr[i])
    //  		gr_pitau = gr_pitau + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * Jr[i] * pow((tau - 0.5) , (Jr[i] - 1))
    //  		gr_tautau = gr_tautau + nr[i] * pow(p , Ir[i]) * Jr[i] * (Jr[i] - 1) * pow((tau - 0.5) , (Jr[i] - 2))
    //  	}
    //  	return R * (-(pow(tau ,2) * (g0_tautau + gr_tautau)) - (pow((1 + p * gr_pi - tau * p * gr_pitau) ,2)) / (1 - pow(p ,2) * gr_pipi))
    //  }
    
    // func w2_pT (p:Double, T:Double)->Double{
    //  	//var i, tau,  g0_tautau,  gr_pi,  gr_pitau,  gr_pipi,  gr_tautau, Ir,  Jr,  nr,  J0,  n0;
    //  	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //  	//6 Equations for Region 2, Section. 6.1 Basic Equation;
    //  	//Table 11 && 12, Page 14 and 15;
    //  	let R = 0.461526 //kJ/(kg K)
    //     let J0:[Double] = [0, 1, -5, -4, -3, -2, -1, 2, 3]
    //  	let n0 = [-9.6927686500217, 10.086655968018, -0.005608791128302, 0.071452738081455, -0.40710498223928, 1.4240819171444, -4.383951131945, -0.28408632460772, 0.021268463753307]
    //  	let Ir:[Double] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 16, 16, 18, 20, 20, 20, 21, 22, 23, 24, 24, 24]
    //  	let Jr:[Double] = [0, 1, 2, 3, 6, 1, 2, 4, 7, 36, 0, 1, 3, 6, 35, 1, 2, 3, 7, 3, 16, 35, 0, 11, 25, 8, 36, 13, 4, 10, 14, 29, 50, 57, 20, 35, 48, 21, 53, 39, 26, 40, 58]
    //  	let nr = [-1.7731742473213E-03, -0.017834862292358, -0.045996013696365, -0.057581259083432, -0.05032527872793, -3.3032641670203E-05, -1.8948987516315E-04, -3.9392777243355E-03, -0.043797295650573, -2.6674547914087E-05, 2.0481737692309E-08, 4.3870667284435E-07, -3.227767723857E-05, -1.5033924542148E-03, -0.040668253562649, -7.8847309559367E-10, 1.2790717852285E-08, 4.8225372718507E-07, 2.2922076337661E-06, -1.6714766451061E-11, -2.1171472321355E-03, -23.895741934104, -5.905956432427E-18, -1.2621808899101E-06, -0.038946842435739, 1.1256211360459E-11, -8.2311340897998, 1.9809712802088E-08, 1.0406965210174E-19, -1.0234747095929E-13, -1.0018179379511E-09, -8.0882908646985E-11, 0.10693031879409, -0.33662250574171, 8.9185845355421E-25, 3.0629316876232E-13, -4.2002467698208E-06, -5.9056029685639E-26, 3.7826947613457E-06, -1.2768608934681E-15, 7.3087610595061E-29, 5.5414715350778E-17, -9.436970724121E-07]
    //  	let tau = 540 / T
    //  	var g0_tautau = 0.0
    //  	for i:Int in 0...8{
    //  		g0_tautau = g0_tautau + n0[i] * J0[i] * (J0[i] - 1) * pow(tau , (J0[i] - 2))
    //  	}
    //  	var gr_pi = 0.0
    //  	var gr_pitau = 0.0
    //  	var gr_pipi = 0.0
    //  	var gr_tautau = 0.0
    //  	for i:Int in 0...42{
    //  		gr_pi = gr_pi + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * pow((tau - 0.5) , Jr[i])
    //  		gr_pipi = gr_pipi + nr[i] * Ir[i] * (Ir[i] - 1) * pow(p , (Ir[i] - 2)) * pow((tau - 0.5) , Jr[i])
    //  		gr_pitau = gr_pitau + nr[i] * Ir[i] * pow(p , (Ir[i] - 1)) * Jr[i] * pow((tau - 0.5) , (Jr[i] - 1))
    //  		gr_tautau = gr_tautau + nr[i] * pow(p , Ir[i]) * Jr[i] * (Jr[i] - 1) * pow((tau - 0.5) , (Jr[i] - 2))
    //  	}
    //  	return pow((1000 * R * T * (1 + 2 * p * gr_pi + pow(p ,2) * pow(gr_pi ,2)) / ((1 - pow(p ,2) * gr_pipi) + (1 + p * gr_pi - tau * p * pow(gr_pitau ,2)) / (pow(tau ,2) * (g0_tautau + gr_tautau)))) ,0.5)
    //  }
    
async function T2_ph (p, h){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //6 Equations for Region 2,6.3.1 The Backward Equations T( p, h ) for Subregions 2a, 2b, && 2c;
    var sub_reg = 0.0
    if(p < 4 ){
        sub_reg = 1
    }else{
        if(p < (905.84278514723 - 0.67955786399241 * h + 1.2809002730136E-04 * Math.pow(h ,2)) ){
            sub_reg = 2
        }else{
            sub_reg = 3
        }
    }

    let Ji = []
    let Ii = []
    let ni = []
    var Ts = 0.0
    let hs = 0.0

    switch(sub_reg){
        case 1:
            //Subregion A;
            //Table 20, Eq 22, page 22;
            Ji = [0, 1, 2, 3, 7, 20, 0, 1, 2, 3, 7, 9, 11, 18, 44, 0, 2, 7, 36, 38, 40, 42, 44, 24, 44, 12, 32, 44, 32, 36, 42, 34, 44, 28]
            Ii = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7]
            ni = [1089.8952318288, 849.51654495535, -107.81748091826, 33.153654801263, -7.4232016790248, 11.765048724356, 1.844574935579, -4.1792700549624, 6.2478196935812, -17.344563108114, -200.58176862096, 271.96065473796, -455.11318285818, 3091.9688604755, 252266.40357872, -6.1707422868339E-03, -0.31078046629583, 11.670873077107, 128127984.04046, -985549096.23276, 2822454697.3002, -3594897141.0703, 1722734991.3197, -13551.334240775, 12848734.66465, 1.3865724283226, 235988.32556514, -13105236.545054, 7399.9835474766, -551966.9703006, 3715408.5996233, 19127.72923966, -415351.64835634, -62.459855192507]
            Ts = 0.0
            hs = h / 2000
            for (let i = 0; i <= 33; i++){
                    Ts = Ts + ni[i] * Math.pow(p , (Ii[i])) * Math.pow((hs - 2.1) , Ji[i])
            }
            return Ts
        case 2:
            //Subregion B;
            //Table 21, Eq 23, page 23;
            Ji = [0, 1, 2, 12, 18, 24, 28, 40, 0, 2, 6, 12, 18, 24, 28, 40, 2, 8, 18, 40, 1, 2, 12, 24, 2, 12, 18, 24, 28, 40, 18, 24, 40, 28, 2, 28, 1, 40]
            Ii = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 6, 7, 7, 9, 9]
            ni = [1489.5041079516, 743.07798314034, -97.708318797837, 2.4742464705674, -0.63281320016026, 1.1385952129658, -0.47811863648625, 8.5208123431544E-03, 0.93747147377932, 3.3593118604916, 3.3809355601454, 0.16844539671904, 0.73875745236695, -0.47128737436186, 0.15020273139707, -0.002176411421975, -0.021810755324761, -0.10829784403677, -0.046333324635812, 7.1280351959551E-05, 1.1032831789999E-04, 1.8955248387902E-04, 3.0891541160537E-03, 1.3555504554949E-03, 2.8640237477456E-07, -1.0779857357512E-05, -7.6462712454814E-05, 1.4052392818316E-05, -3.1083814331434E-05, -1.0302738212103E-06, 2.821728163504E-07, 1.2704902271945E-06, 7.3803353468292E-08, -1.1030139238909E-08, -8.1456365207833E-14, -2.5180545682962E-11, -1.7565233969407E-18, 8.6934156344163E-15]
            Ts = 0.0
            hs = h / 2000
            for (let i = 0; i <= 37; i++){
                Ts = Ts + ni[i] * Math.pow((p - 2) , (Ii[i])) * Math.pow((hs - 2.6) , Ji[i])
            }
            return Ts
        default:
            //Subregion C;
            //Table 22, Eq 24, page 24;
            Ji = [0, 4, 0, 2, 0, 2, 0, 1, 0, 2, 0, 1, 4, 8, 4, 0, 1, 4, 10, 12, 16, 20, 22]
            Ii = [-7, -7, -6, -6, -5, -5, -2, -2, -1, -1, 0, 0, 1, 1, 2, 6, 6, 6, 6, 6, 6, 6, 6]
            ni = [-3236839855524.2, 7326335090218.1, 358250899454.47, -583401318515.9, -10783068217.47, 20825544563.171, 610747.83564516, 859777.2253558, -25745.72360417, 31081.088422714, 1208.2315865936, 482.19755109255, 3.7966001272486, -10.842984880077, -0.04536417267666, 1.4559115658698E-13, 1.126159740723E-12, -1.7804982240686E-11, 1.2324579690832E-07, -1.1606921130984E-06, 2.7846367088554E-05, -5.9270038474176E-04, 1.2918582991878E-03]
            Ts = 0.0
            hs = h / 2000
            for (let i = 0; i <= 22; i++){
                Ts = Ts + ni[i] * Math.pow((p + 25) , (Ii[i])) * Math.pow((hs - 1.8) , Ji[i])
            }
            return Ts
    }
}
    
async function T2_ps (p, s){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //6 Equations for Region 2,6.3.2 The Backward Equations T( p, s ) for Subregions 2a, 2b, && 2c;
    //Page 26;
    let sub_reg = 0
    if(p < 4 ){
        sub_reg = 1
    }else{
    if(s < 5.85 ){
        sub_reg = 3
    }else{
        sub_reg = 2
    }
    }

    let Ii = []
    let Ji = []
    let ni = [6]
    let sigma = 0
    switch(sub_reg){
    case 1:
        //Subregion A;
        //Table 25, Eq 25, page 26;
        Ii = [-1.5, -1.5, -1.5, -1.5, -1.5, -1.5, -1.25, -1.25, -1.25, -1, -1, -1, -1, -1, -1, -0.75, -0.75, -0.5, -0.5, -0.5, -0.5, -0.25, -0.25, -0.25, -0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.75, 0.75, 0.75, 0.75, 1, 1, 1.25, 1.25, 1.5, 1.5]
        Ji = [-24, -23, -19, -13, -11, -10, -19, -15, -6, -26, -21, -17, -16, -9, -8, -15, -14, -26, -13, -9, -7, -27, -25, -11, -6, 1, 4, 8, 11, 0, 1, 5, 6, 10, 14, 16, 0, 4, 9, 17, 7, 18, 3, 15, 5, 18]
        ni = [-392359.83861984, 515265.7382727, 40482.443161048, -321.93790923902, 96.961424218694, -22.867846371773, -449429.14124357, -5011.8336020166, 0.35684463560015, 44235.33584819, -13673.388811708, 421632.60207864, 22516.925837475, 474.42144865646, -149.31130797647, -197811.26320452, -23554.39947076, -19070.616302076, 55375.669883164, 3829.3691437363, -603.91860580567, 1936.3102620331, 4266.064369861, -5978.0638872718, -704.01463926862, 338.36784107553, 20.862786635187, 0.033834172656196, -4.3124428414893E-05, 166.53791356412, -139.86292055898, -0.78849547999872, 0.072132411753872, -5.9754839398283E-03, -1.2141358953904E-05, 2.3227096733871E-07, -10.538463566194, 2.0718925496502, -0.072193155260427, 2.074988708112E-07, -0.018340657911379, 2.9036272348696E-07, 0.21037527893619, 2.5681239729999E-04, -0.012799002933781, -8.2198102652018E-06]
        sigma = s / 2
        var teta = 0.0
        for (let i = 0; i <= 45; i++){
            teta = teta + ni[i] * Math.pow(p , Ii[i]) * Math.pow((sigma - 2) , Ji[i])
        }
        return teta
    case 2:
        //Subregion B;
        //Table 26, Eq 26, page 27;
        Ii = [-6, -6, -5, -5, -4, -4, -4, -3, -3, -3, -3, -2, -2, -2, -2, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5]
        Ji = [0, 11, 0, 11, 0, 1, 11, 0, 1, 11, 12, 0, 1, 6, 10, 0, 1, 5, 8, 9, 0, 1, 2, 4, 5, 6, 9, 0, 1, 2, 3, 7, 8, 0, 1, 5, 0, 1, 3, 0, 1, 0, 1, 2]
        ni = [316876.65083497, 20.864175881858, -398593.99803599, -21.816058518877, 223697.85194242, -2784.1703445817, 9.920743607148, -75197.512299157, 2970.8605951158, -3.4406878548526, 0.38815564249115, 17511.29508575, -1423.7112854449, 1.0943803364167, 0.89971619308495, -3375.9740098958, 471.62885818355, -1.9188241993679, 0.41078580492196, -0.33465378172097, 1387.0034777505, -406.63326195838, 41.72734715961, 2.1932549434532, -1.0320050009077, 0.35882943516703, 5.2511453726066E-03, 12.838916450705, -2.8642437219381, 0.56912683664855, -0.099962954584931, -3.2632037778459E-03, 2.3320922576723E-04, -0.1533480985745, 0.029072288239902, 3.7534702741167E-04, 1.7296691702411E-03, -3.8556050844504E-04, -3.5017712292608E-05, -1.4566393631492E-05, 5.6420857267269E-06, 4.1286150074605E-08, -2.0684671118824E-08, 1.6409393674725E-09]
        sigma = s / 0.7853
        var teta = 0.0
        for (let i = 0; i <= 43; i++){
            teta = teta + ni[i] * Math.pow(p , Ii[i]) * Math.pow((10 - sigma) , Ji[i])
        }
        return teta
    default:
        //Subregion C;
        //Table 27, Eq 27, page 28;
        Ii = [-2, -2, -1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 7]
        Ji = [0, 1, 0, 0, 1, 2, 3, 0, 1, 3, 4, 0, 1, 2, 0, 1, 5, 0, 1, 4, 0, 1, 2, 0, 1, 0, 1, 3, 4, 5]
        ni = [909.68501005365, 2404.566708842, -591.6232638713, 541.45404128074, -270.98308411192, 979.76525097926, -469.66772959435, 14.399274604723, -19.104204230429, 5.3299167111971, -21.252975375934, -0.3114733441376, 0.60334840894623, -0.042764839702509, 5.8185597255259E-03, -0.014597008284753, 5.6631175631027E-03, -7.6155864584577E-05, 2.2440342919332E-04, -1.2561095013413E-05, 6.3323132660934E-07, -2.0541989675375E-06, 3.6405370390082E-08, -2.9759897789215E-09, 1.0136618529763E-08, 5.9925719692351E-12, -2.0677870105164E-11, -2.0874278181886E-11, 1.0162166825089E-10, -1.6429828281347E-10]
        sigma = s / 2.9251
        var teta = 0.0
        for (let i = 0; i <= 29; i++){
            teta = teta + ni[i] * Math.pow(p , Ii[i]) * Math.pow((2 - sigma) , Ji[i])
        }
        return teta
    }
}
    
    
    // func P2_hs (h:Double, s:Double)-> Double{
    //     //var sub_reg, i, eta,  teta,  sigma,  p, Ji,  Ii,  ni;
    //     //Supplementary Release on Backward Equations for Pressure as a Function of Enthalpy && Entropy p(h,s) to the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //     //Chapter 6: Backward Equations p(h,s) for Region 2;
    //     var sub_reg = 0
    //     if(h < (-3498.98083432139 + 2575.60716905876 * s - 421.073558227969 * pow(s, 2) + 27.6349063799944 * pow(s, 3)) ){
    //         sub_reg = 1
    //     }else{
    //         if(s < 5.85 ){
    //             sub_reg = 3;
    //         }else{
    //             sub_reg = 2;
    //         }
    //     }
    //     var p=0.0
        
    //     switch(sub_reg){
    //         case 1:
    //             //Subregion A;
    //             //Table 6, Eq 3, page 8;
    //             let Ii:[Double] = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 5, 5, 6, 7]
    //             let Ji:[Double] = [1, 3, 6, 16, 20, 22, 0, 1, 2, 3, 5, 6, 10, 16, 20, 22, 3, 16, 20, 0, 2, 3, 6, 16, 16, 3, 16, 3, 1]
    //             let ni = [-1.82575361923032E-02, -0.125229548799536, 0.592290437320145, 6.04769706185122, 238.624965444474, -298.639090222922, 0.051225081304075, -0.437266515606486, 0.413336902999504, -5.16468254574773, -5.57014838445711, 12.8555037824478, 11.414410895329, -119.504225652714, -2847.7798596156, 4317.57846408006, 1.1289404080265, 1974.09186206319, 1516.12444706087, 1.41324451421235E-02, 0.585501282219601, -2.97258075863012, 5.94567314847319, -6236.56565798905, 9659.86235133332, 6.81500934948134, -6332.07286824489, -5.5891922446576, 4.00645798472063E-02]
    //             let eta = h / 4200
    //             let sigma = s / 12
    //             for i:Int in 0...28{
    //                 p = p + ni[i] * pow((eta - 0.5) , Ii[i]) * pow((sigma - 1.2) , Ji[i])
    //             }
    //             return pow(p ,4.0) * 4.0
    //         case 2:
    //             //Subregion B;
    //             //Table 7, Eq 4, page 9;
    //             let Ii:[Double] = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 8, 12, 14]
    //             let Ji:[Double] = [0, 1, 2, 4, 8, 0, 1, 2, 3, 5, 12, 1, 6, 18, 0, 1, 7, 12, 1, 16, 1, 12, 1, 8, 18, 1, 16, 1, 3, 14, 18, 10, 16]
    //             let ni = [8.01496989929495E-02, -0.543862807146111, 0.337455597421283, 8.9055545115745, 313.840736431485, 0.797367065977789, -1.2161697355624, 8.72803386937477, -16.9769781757602, -186.552827328416, 95115.9274344237, -18.9168510120494, -4334.0703719484, 543212633.012715, 0.144793408386013, 128.024559637516, -67230.9534071268, 33697238.0095287, -586.63419676272, -22140322476.9889, 1716.06668708389, -570817595.806302, -3121.09693178482, -2078413.8463301, 3056059461577.86, 3221.57004314333, 326810259797.295, -1441.04158934487, 410.694867802691, 109077066873.024, -24796465425889.3, 1888019068.65134, -123651009018773]
    //             let eta = h / 4100
    //             let sigma = s / 7.9
    //             for i:Int in 0...32{
    //                 p = p + ni[i] * pow((eta - 0.6) , Ii[i]) * pow((sigma - 1.01) , Ji[i])
    //             }
    //             return  pow(p ,4.0) * 100.0
    //         default:
    //         //Subregion C;
    //         //Table 8, Eq 5, page 10;
    //             let Ii:[Double] = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 5, 5, 5, 5, 6, 6, 10, 12, 16]
    //             let Ji:[Double] = [0, 1, 2, 3, 4, 8, 0, 2, 5, 8, 14, 2, 3, 7, 10, 18, 0, 5, 8, 16, 18, 18, 1, 4, 6, 14, 8, 18, 7, 7, 10]
    //         let ni = [0.112225607199012, -3.39005953606712, -32.0503911730094, -197.5973051049, -407.693861553446, 13294.3775222331, 1.70846839774007, 37.3694198142245, 3581.44365815434, 423014.446424664, -751071025.760063, 52.3446127607898, -228.351290812417, -960652.417056937, -80705929.2526074, 1626980172256.69, 0.772465073604171, 46392.9973837746, -13731788.5134128, 1704703926305.12, -25110462818730.8, 31774883083552, 53.8685623675312, -55308.9094625169, -1028615.22421405, 2042494187562.34, 273918446.626977, -2.63963146312685E+15, -1078908541.08088, -29649262098.0124, -1.11754907323424E+15]
    //         let eta = h / 3500
    //         let sigma = s / 5.9
    //         for i:Int in 0...30{
    //             p = p + ni[i] * pow((eta - 0.7) , Ii[i]) * pow((sigma - 1.1) , Ji[i])
    //         }
    //         return pow(p ,4.0) * 100.0
    //     }
    // }
    
    // func T2_prho (p:Double, rho:Double)->Double{
    //  	//var Low_Bound,  High_Bound,  rhos,  Ts;
    //  	//Solve by iteration. Observe that fo low temperatures this equation has 2 solutions.;
    //  	//Solve with half interval method;
    //     var Low_Bound = 0.0
    //     var High_Bound = 0.0
    //     var rhos = 0.0
    //     var Ts = 0.0
    //  	if(p < 16.5292 ){
    //  		Low_Bound = T4_p(p: p)
    //  	}else{
    //  		Low_Bound = B23T_p(p: p)
    //  	}
    //  	High_Bound = 1073.15
    //  	while( abs(rho - rhos) > 0.000001){
    //  		Ts = (Low_Bound + High_Bound) / 2
    //  		rhos = 1 / v2_pT(p: p, T: Ts)
    //  		if(rhos < rho ){
    //  			High_Bound = Ts
    //  		}else{
    //  			Low_Bound = Ts
    //  		}
    //  	}
    //  	return Ts
    //  }


    //MARK: REGION 3
     //***********************************************************************************************************
     //*2.3 Functions for region 3
    
//      func p3_rhoT (rho:Double, T:Double)->Double{
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//         //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
//         //Table 30 && 31, Page 30 and 31;
//         let R = 0.461526
//        let tc = 647.096
//        //let pc = 22.064
//        let rhoc = 322.0
//        let Ii:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
//        let Ji:[Double] = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
//         let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
//         let delta = rho / rhoc
//         let tau = tc / T
//         var fidelta = 0.0
//        for i:Int in 1...39{
//             fidelta = fidelta + ni[i] * Ii[i] * pow(delta , (Ii[i] - 1)) * pow(tau , Ji[i])
//         }
//         fidelta = fidelta + ni[0] / delta
//         return rho * R * T * delta * fidelta / 1000
//     }
   
//    func u3_rhoT (rho:Double, T:Double)->Double{
//        //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//        //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
//        //Table 30 && 31, Page 30 and 31;
//        let R = 0.461526
//        let tc = 647.096
//        //let pc = 22.064
//        let rhoc = 322.0
//        let Ii:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
//        let Ji:[Double] = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
//        let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
//        let delta = rho / rhoc
//        let tau = tc / T
//        var fitau = 0.0
//        for i:Int in 1...39{
//            fitau = fitau + ni[i] * pow(delta , Ii[i]) * Ji[i] * pow(tau , (Ji[i] - 1))
//        }
//        return  R * T * (tau * fitau)
//    }
   
async function h3_rhoT (rho, T){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
    //Table 30 && 31, Page 30 and 31;
    let R = 0.461526
    let tc = 647.096
    //let pc = 22.064
    let rhoc = 322.0
    let Ii = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
    let Ji = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
    let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
    let delta = rho / rhoc
    let tau = tc / T
    var fidelta = 0.0
    var fitau = 0.0
    for (let i = 0; i <= 39; i++){
        fidelta = fidelta + ni[i] * Ii[i] * Math.pow(delta , (Ii[i] - 1)) * Math.pow(tau , Ji[i])
        fitau = fitau + ni[i] * Math.pow(delta , Ii[i]) * Ji[i] * Math.pow(tau , (Ji[i] - 1))
    }
    fidelta = fidelta + ni[0] / delta
    return  R * T * (tau * fitau + delta * fidelta)
}
   
async function s3_rhoT (rho, T){
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // 7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
    // Table 30 && 31, Page 30 and 31;
    let R = 0.461526
    let tc = 647.096
    //let pc = 22.064
    let rhoc = 322.0
    let Ii = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
    let Ji = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
    let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
    let delta = rho / rhoc
    let tau = tc / T
    var fi = 0.0
    var fitau = 0.0
    for (let i0 = 1; i0 <= 39; i0++){
        fi = fi + ni[i0] * Math.pow(delta , Ii[i0]) * Math.pow(tau , Ji[i0])
        fitau = fitau + ni[i0] * Math.pow(delta , Ii[i0]) * Ji[i0] * Math.pow(tau , (Ji[i0] - 1))
    }
    
    fi = fi + ni[0] * Math.og(delta)
    return R * (tau * fitau - fi)
}
   
//    func Cp3_rhoT (rho:Double, T:Double)->Double{
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//         //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
//         //Table 30 && 31, Page 30 and 31;
//         let R = 0.461526
//        let tc = 647.096
//        //let pc = 22.064
//        let rhoc = 322.0
//        let Ii:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
//        let Ji:[Double] = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
//         let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
//         let delta = rho / rhoc
//         let tau = tc / T
//         var fitautau = 0.0
//         var fidelta = 0.0
//         var fideltatau = 0.0
//         var fideltadelta = 0.0
//        for i:Int in 0...39{
//             fitautau = fitautau + ni[i] * pow(delta , Ii[i]) * Ji[i] * (Ji[i] - 1) * pow(tau , (Ji[i] - 2))
//             fidelta = fidelta + ni[i] * Ii[i] * pow(delta , (Ii[i] - 1)) * pow(tau , Ji[i])
//             fideltatau = fideltatau + ni[i] * Ii[i] * pow(delta , (Ii[i] - 1)) * Ji[i] * pow(tau , (Ji[i] - 1))
//             fideltadelta = fideltadelta + ni[i] * Ii[i] * (Ii[i] - 1) * pow(delta , (Ii[i] - 2)) * pow(tau , Ji[i])
//         }
//         fidelta = fidelta + ni[0] / delta
//         fideltadelta = fideltadelta - ni[0] / (pow(delta ,2))
//         return R * (-(pow(tau ,2) * fitautau) + pow((delta * fidelta - delta * tau * fideltatau) ,2) / (2 * delta * fidelta + pow(delta ,2) * fideltadelta))
//     }
   
//    func Cv3_rhoT (rho:Double, T:Double)->Double{
//         //var i,  Ji,  Ii,  ni,  fi,  delta,  tau,  fitautau;
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//         //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
//         //Table 30 && 31, Page 30 and 31;
//         let R = 0.461526
//        let tc  = 647.096
//        //let pc = 22.064
//        let rhoc = 322.0
//        let Ii:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
//        let Ji:[Double] = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
//         let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
//         let delta = rho / rhoc
//         let tau = tc / T
//         var fitautau = 0.0
//        for i:Int in 0...39{
//             fitautau = fitautau + ni[i] * pow(delta , Ii[i]) * Ji[i] * (Ji[i] - 1) * pow(tau , (Ji[i] - 2))
//         }
//         return R * -(tau * tau * fitautau)
//     }
   
//    func w3_rhoT (rho:Double, T:Double)->Double{
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//         //7 Basic Equation for Region 3, Section. 6.1 Basic Equation;
//         //Table 30 && 31, Page 30 and 31;
//         let R  = 0.461526
//        let tc = 647.096
//        //let pc = 22.064
//        let rhoc = 322.0
//        let Ii:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 9, 10, 10, 11]
//        let Ji:[Double] = [0, 0, 1, 2, 7, 10, 12, 23, 2, 6, 15, 17, 0, 2, 6, 7, 22, 26, 0, 2, 4, 16, 26, 0, 2, 4, 26, 1, 3, 26, 0, 2, 26, 2, 26, 2, 26, 0, 1, 26]
//         let ni = [1.0658070028513, -15.732845290239, 20.944396974307, -7.6867707878716, 2.6185947787954, -2.808078114862, 1.2053369696517, -8.4566812812502E-03, -1.2654315477714, -1.1524407806681, 0.88521043984318, -0.64207765181607, 0.38493460186671, -0.85214708824206, 4.8972281541877, -3.0502617256965, 0.039420536879154, 0.12558408424308, -0.2799932969871, 1.389979956946, -2.018991502357, -8.2147637173963E-03, -0.47596035734923, 0.0439840744735, -0.44476435428739, 0.90572070719733, 0.70522450087967, 0.10770512626332, -0.32913623258954, -0.50871062041158, -0.022175400873096, 0.094260751665092, 0.16436278447961, -0.013503372241348, -0.014834345352472, 5.7922953628084E-04, 3.2308904703711E-03, 8.0964802996215E-05, -1.6557679795037E-04, -4.4923899061815E-05]
//         let delta = rho / rhoc
//         let tau = tc / T
//         var fitautau = 0.0
//         var fidelta = 0.0
//         var fideltatau = 0.0
//         var fideltadelta = 0.0
//        for i:Int in 0...39{
//             fitautau = fitautau + ni[i] * pow(delta , Ii[i]) * Ji[i] * (Ji[i] - 1) * pow(tau , (Ji[i] - 2))
//             fidelta = fidelta + ni[i] * Ii[i] * pow(delta , (Ii[i] - 1)) * pow(tau , Ji[i])
//             fideltatau = fideltatau + ni[i] * Ii[i] * pow(delta , (Ii[i] - 1)) * Ji[i] * pow(tau , (Ji[i] - 1))
//             fideltadelta = fideltadelta + ni[i] * Ii[i] * (Ii[i] - 1) * pow(delta , (Ii[i] - 2)) * pow(tau , Ji[i])
//         }
//         fidelta = fidelta + ni[0] / delta
//         fideltadelta = fideltadelta - ni[0] / (pow(delta ,2))
//         return pow((1000 * R * T * (2 * delta * fidelta + pow(delta ,2) * fideltadelta - pow((delta * fidelta - delta * tau * fideltatau) ,2) / (pow(tau ,2) * fitautau))) ,0.5)
//     }
   
   
async function T3_ph (p, h){
    //Revised Supplementary Release on Backward Equations for the Functions T(p,h), v(p,h) && T(p,s), v(p,s) for Region 3 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //2004;
    //Section 3.3 Backward Equations T(p,h) && v(p,h) for Subregions 3a and 3b;
    //Boundary equation, Eq 1 Page 5;
    //let R  = 0.461526
    //let tc = 647.096
    //let pc = 22.064
    //let rhoc = 322.0
    let h3ab = (2014.64004206875 + 3.74696550136983 * p - 2.19921901054187E-02 * Math.pow(p ,2) + 8.7513168600995E-05 * Math.pow(p ,3))

    let Ii = []
    let Ji = []
    let ni = []
    let ps = 0.0
    let hs = 0.0
    var Ts = 0.0

    if(h < h3ab ){
        //Subregion 3a;
        //Eq 2, Table 3, Page 7;
        Ii = [-12, -12, -12, -12, -12, -12, -12, -12, -10, -10, -10, -8, -8, -8, -8, -5, -3, -2, -2, -2, -1, -1, 0, 0, 1, 3, 3, 4, 4, 10, 12]
        Ji = [0, 1, 2, 6, 14, 16, 20, 22, 1, 5, 12, 0, 2, 4, 10, 2, 0, 1, 3, 4, 0, 2, 0, 1, 1, 0, 1, 0, 3, 4, 5]
        ni = [-1.33645667811215E-07, 4.55912656802978E-06, -1.46294640700979E-05, 6.3934131297008E-03, 372.783927268847, -7186.54377460447, 573494.7521034, -2675693.29111439, -3.34066283302614E-05, -2.45479214069597E-02, 47.8087847764996, 7.64664131818904E-06, 1.28350627676972E-03, 1.71219081377331E-02, -8.51007304583213, -1.36513461629781E-02, -3.84460997596657E-06, 3.37423807911655E-03, -0.551624873066791, 0.72920227710747, -9.92522757376041E-03, -0.119308831407288, 0.793929190615421, 0.454270731799386, 0.20999859125991, -6.42109823904738E-03, -0.023515586860454, 2.52233108341612E-03, -7.64885133368119E-03, 1.36176427574291E-02, -1.33027883575669E-02]
        ps = p / 100
        hs = h / 2300
        Ts = 0.0
        for (let i = 0; i <= 30; i++){
            Ts = Ts + ni[i] * Math.pow((ps + 0.24) , Ii[i]) * Math.pow((hs - 0.615) , Ji[i])
        }
        return Ts * 760
    }else{
        //Subregion 3b;
        //Eq 3, Table 4, Page 7,8;
        Ii = [-12, -12, -10, -10, -10, -10, -10, -8, -8, -8, -8, -8, -6, -6, -6, -4, -4, -3, -2, -2, -1, -1, -1, -1, -1, -1, 0, 0, 1, 3, 5, 6, 8]
        Ji = [0, 1, 0, 1, 5, 10, 12, 0, 1, 2, 4, 10, 0, 1, 2, 0, 1, 5, 0, 4, 2, 4, 6, 10, 14, 16, 0, 2, 1, 1, 1, 1, 1]
        ni = [3.2325457364492E-05, -1.27575556587181E-04, -4.75851877356068E-04, 1.56183014181602E-03, 0.105724860113781, -85.8514221132534, 724.140095480911, 2.96475810273257E-03, -5.92721983365988E-03, -1.26305422818666E-02, -0.115716196364853, 84.9000969739595, -1.08602260086615E-02, 1.54304475328851E-02, 7.50455441524466E-02, 2.52520973612982E-02, -6.02507901232996E-02, -3.07622221350501, -5.74011959864879E-02, 5.03471360939849, -0.925081888584834, 3.91733882917546, -77.314600713019, 9493.08762098587, -1410437.19679409, 8491662.30819026, 0.861095729446704, 0.32334644281172, 0.873281936020439, -0.436653048526683, 0.286596714529479, -0.131778331276228, 6.76682064330275E-03]
        hs = h / 2800
        ps = p / 100
        Ts = 0.0
        for (let i = 0; i <= 32; i++){
            Ts = Ts + ni[i] * Math.pow((ps + 0.298) , Ii[i]) * Math.pow((hs - 0.72) , Ji[i])
        }
        return Ts * 860
    }
}
   
async function V3_ph (p, h){
    //Revised Supplementary Release on Backward Equations for the Functions T(p,h), v(p,h) && T(p,s), v(p,s) for Region 3 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //2004;
    //Section 3.3 Backward Equations T(p,h) && v(p,h) for Subregions 3a and 3b;
    //Boundary equation, Eq 1 Page 5;
    //R = 0.461526;
    //tc = 647.096;
    //pc = 22.064;
    //rhoc = 322;
    
    var vs = 0.0
    let h3ab = (2014.64004206875 + 3.74696550136983 * p - 2.19921901054187E-02 * Math.pow(p ,2) + 8.7513168600995E-05 * Math.pow(p ,3))
    if(h < h3ab){
        //Subregion 3a;
        //Eq 4, Table 6, Page 9;
        
        let Ii = [-12, -12, -12, -12, -10, -10, -10, -8, -8, -6, -6, -6, -4, -4, -3, -2, -2, -1, -1, -1, -1, 0, 0, 1, 1, 1, 2, 2, 3, 4, 5, 8]
        
        let Ji = [6, 8, 12, 18, 4, 7, 10, 5, 12, 3, 4, 22, 2, 3, 7, 3, 16, 0, 1, 2, 3, 0, 1, 0, 1, 2, 0, 2, 0, 2, 2, 2]

        let ni = [5.29944062966028E-03, -0.170099690234461, 11.1323814312927, -2178.98123145125, -5.06061827980875E-04, 0.556495239685324, -9.43672726094016, -0.297856807561527, 93.9353943717186, 1.92944939465981E-02, 0.421740664704763, -3689141.2628233, -7.37566847600639E-03, -0.354753242424366, -1.99768169338727, 1.15456297059049, 5683.6687581596, 8.08169540124668E-03, 0.172416341519307, 1.04270175292927, -0.297691372792847, 0.560394465163593, 0.275234661176914, -0.148347894866012, -6.51142513478515E-02, -2.92468715386302, 6.64876096952665E-02, 3.52335014263844, -1.46340792313332E-02, -2.24503486668184, 1.10533464706142, -4.08757344495612E-02]
        let ps = p / 100
        let hs = h / 2100
        for (let i = 0; i <= 31; i++){
            
            vs = vs + ni[i] * Math.pow((ps + 0.128) , Ii[i]) * Math.pow((hs - 0.727) , Ji[i])
            
        }
        return vs * 0.0028
    }else{
        //Subregion 3b;
        //Eq 5, Table 7, Page 9;
        let Ii = [-12, -12, -8, -8, -8, -8, -8, -8, -6, -6, -6, -6, -6, -6, -4, -4, -4, -3, -3, -2, -2, -1, -1, -1, -1, 0, 1, 1, 2, 2]
        let Ji = [0, 1, 0, 1, 3, 6, 7, 8, 0, 1, 2, 5, 6, 10, 3, 6, 10, 0, 2, 1, 2, 0, 1, 4, 5, 0, 0, 1, 2, 6]
        let ni = [-2.25196934336318E-09, 1.40674363313486E-08, 2.3378408528056E-06, -3.31833715229001E-05, 1.07956778514318E-03, -0.271382067378863, 1.07202262490333, -0.853821329075382, -2.15214194340526E-05, 7.6965608822273E-04, -4.31136580433864E-03, 0.453342167309331, -0.507749535873652, -100.475154528389, -0.219201924648793, -3.21087965668917, 607.567815637771, 5.57686450685932E-04, 0.18749904002955, 9.05368030448107E-03, 0.285417173048685, 3.29924030996098E-02, 0.239897419685483, 4.82754995951394, -11.8035753702231, 0.169490044091791, -1.79967222507787E-02, 3.71810116332674E-02, -5.36288335065096E-02, 1.6069710109252]
        let ps = p / 100
        let hs = h / 2800
        for (let i = 0; i <= 29; i++){
            vs = vs + ni[i] * Math.pow((ps + 0.0661) , Ii[i]) * Math.pow((hs - 0.72) , Ji[i])
        }
        return vs * 0.0088
    }
}
   
async function T3_ps (p, s){
    //Revised Supplementary Release on Backward Equations for the Functions T(p,h), v(p,h) && T(p,s), v(p,s) for Region 3 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //2004;
    //3.4 Backward Equations T(p,s) && v(p,s) for Subregions 3a and 3b;
    //Boundary equation, Eq 6 Page 11;
    //const R As Double = 0.461526, tc As Double = 647.096, pc As Double = 22.064, rhoc As Double = 322;
    if(s <= 4.41202148223476 ){
        //Subregion 3a;
        //Eq 6, Table 10, Page 11;
        let Ii = [-12, -12, -10, -10, -10, -10, -8, -8, -8, -8, -6, -6, -6, -5, -5, -5, -4, -4, -4, -2, -2, -1, -1, 0, 0, 0, 1, 2, 2, 3, 8, 8, 10]
        let Ji = [28, 32, 4, 10, 12, 14, 5, 7, 8, 28, 2, 6, 32, 0, 14, 32, 6, 10, 36, 1, 4, 1, 6, 0, 1, 4, 0, 0, 3, 2, 0, 1, 2]
        let ni = [1500420082.63875, -159397258480.424, 5.02181140217975E-04, -67.2057767855466, 1450.58545404456, -8238.8953488889, -0.154852214233853, 11.2305046746695, -29.7000213482822, 43856513263.5495, 1.37837838635464E-03, -2.97478527157462, 9717779473494.13, -5.71527767052398E-05, 28830.794977842, -74442828926270.3, 12.8017324848921, -368.275545889071, 6.64768904779177E+15, 0.044935925195888, -4.22897836099655, -0.240614376434179, -4.74341365254924, 0.72409399912611, 0.923874349695897, 3.99043655281015, 3.84066651868009E-02, -3.59344365571848E-03, -0.735196448821653, 0.188367048396131, 1.41064266818704E-04, -2.57418501496337E-03, 1.23220024851555E-03]
        let sigma = s / 4.4
        let ps = p / 100
        var teta = 0.0
        for (let i = 0; i <= 32; i++){
            if (i==1) {
            }
            teta = teta + ni[i] * Math.pow((ps + 0.24) , Ii[i]) * Math.pow((sigma - 0.703) , Ji[i]);
        }
        return  teta * 760
    }else{
        // //Subregion 3b;
        //Eq 7, Table 11, Page 11;
        let Ii = [-12, -12, -12, -12, -8, -8, -8, -6, -6, -6, -5, -5, -5, -5, -5, -4, -3, -3, -2, 0, 2, 3, 4, 5, 6, 8, 12, 14]
        let Ji = [1, 3, 4, 7, 0, 1, 3, 0, 2, 4, 0, 1, 2, 4, 6, 12, 1, 6, 2, 0, 1, 1, 0, 24, 0, 3, 1, 2]
        let ni = [0.52711170160166, -40.1317830052742, 153.020073134484, -2247.99398218827, -0.193993484669048, -1.40467557893768, 42.6799878114024, 0.752810643416743, 22.6657238616417, -622.873556909932, -0.660823667935396, 0.841267087271658, -25.3717501764397, 485.708963532948, 880.531517490555, 2650155.92794626, -0.359287150025783, -656.991567673753, 2.41768149185367, 0.856873461222588, 0.655143675313458, -0.213535213206406, 5.62974957606348E-03, -316955725450471, -6.99997000152457E-04, 1.19845803210767E-02, 1.93848122022095E-05, -2.15095749182309E-05]
        let sigma = s / 5.3
        let ps = p / 100
        var teta = 0.0
        for (let i = 0; i <= 27; i++){
            teta = teta + ni[i] * Math.pow((ps + 0.76) , Ii[i]) * Math.pow((sigma - 0.818) , Ji[i])
        }
        return  teta * 860
    }
}

async function V3_ps (p, s){
    //Revised Supplementary Release on Backward Equations for the Functions T(p,h), v(p,h) && T(p,s), v(p,s) for Region 3 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    //2004;
    //3.4 Backward Equations T(p,s) && v(p,s) for Subregions 3a and 3b;
    //Boundary equation, Eq 6 Page 11;
    //let R = 0.461526
    //let tc = 647.096
    //let pc = 22.064
    //let rhoc = 322.0
    if(s <= 4.41202148223476 ){
        //Subregion 3a;
        //Eq 8, Table 13, Page 14;
        let Ii = [-12, -12, -12, -10, -10, -10, -10, -8, -8, -8, -8, -6, -5, -4, -3, -3, -2, -2, -1, -1, 0, 0, 0, 1, 2, 4, 5, 6]
        let Ji = [10, 12, 14, 4, 8, 10, 20, 5, 6, 14, 16, 28, 1, 5, 2, 4, 3, 8, 1, 2, 0, 1, 3, 0, 0, 2, 2, 0]
        let ni = [79.5544074093975, -2382.6124298459, 17681.3100617787, -1.10524727080379E-03, -15.3213833655326, 297.544599376982, -35031520.6871242, 0.277513761062119, -0.523964271036888, -148011.182995403, 1600148.99374266, 1708023226634.27, 2.46866996006494E-04, 1.6532608479798, -0.118008384666987, 2.537986423559, 0.965127704669424, -28.2172420532826, 0.203224612353823, 1.10648186063513, 0.52612794845128, 0.277000018736321, 1.08153340501132, -7.44127885357893E-02, 1.64094443541384E-02, -6.80468275301065E-02, 0.025798857610164, -1.45749861944416E-04]
        let ps = p / 100
        let sigma = s / 4.4
        var omega = 0.0
        for (let i = 0; i <= 27; i++){
            omega = omega + ni[i] * Math.pow((ps + 0.187) , Ii[i]) * Math.pow((sigma - 0.755) , Ji[i])
        }
        return omega * 0.0028
    }else{
        //Subregion 3b;
        //Eq 9, Table 14, Page 14;
        let Ii = [-12, -12, -12, -12, -12, -12, -10, -10, -10, -10, -8, -5, -5, -5, -4, -4, -4, -4, -3, -2, -2, -2, -2, -2, -2, 0, 0, 0, 1, 1, 2]
        let Ji = [0, 1, 2, 3, 5, 6, 0, 1, 2, 4, 0, 1, 2, 3, 0, 1, 2, 3, 1, 0, 1, 2, 3, 4, 12, 0, 1, 2, 0, 2, 2]
        let ni = [5.91599780322238E-05, -1.85465997137856E-03, 1.04190510480013E-02, 5.9864730203859E-03, -0.771391189901699, 1.72549765557036, -4.67076079846526E-04, 1.34533823384439E-02, -8.08094336805495E-02, 0.508139374365767, 1.28584643361683E-03, -1.63899353915435, 5.86938199318063, -2.92466667918613, -6.14076301499537E-03, 5.76199014049172, -12.1613320606788, 1.67637540957944, -7.44135838773463, 3.78168091437659E-02, 4.01432203027688, 16.0279837479185, 3.17848779347728, -3.58362310304853, -1159952.60446827, 0.199256573577909, -0.122270624794624, -19.1449143716586, -1.50448002905284E-02, 14.6407900162154, -3.2747778718823]
        let ps = p / 100
        let sigma = s / 5.3
        var omega = 0.0
        for (let i = 0; i <= 30; i++){
            omega = omega + ni[i] * Math.pow((ps + 0.298) , Ii[i]) * Math.pow((sigma - 0.816) , Ji[i])
        }
        return omega * 0.0088
    }
}
   
//    func P3_hs (h:Double, s:Double)->Double{
//        //Supplementary Release on Backward Equations ( ) , p h s for Region 3,;
//        //Equations as a Function of h && s for the Region Boundaries, and an Equation;
//        //( ) sat , T hs for Region 4 of the IAPWS Industrial Formulation 1997 for the;
//        //Thermodynamic Properties of Water && Steam;
//        //2004;
//        //Section 3 Backward Functions p(h,s), T(h,s), && v(h,s) for Region 3;
//        //let R = 0.461526
//        //let tc = 647.096
//        //let pc = 22.064
//        //let rhoc = 322
       
//        if(s < 4.41202148223476 ){
//            //Subregion 3a;
//            //Eq 1, Table 3, Page 8;
//            let Ii:[Double] = [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 6, 7, 8, 10, 10, 14, 18, 20, 22, 22, 24, 28, 28, 32, 32]
//            let Ji:[Double] = [0, 1, 5, 0, 3, 4, 8, 14, 6, 16, 0, 2, 3, 0, 1, 4, 5, 28, 28, 24, 1, 32, 36, 22, 28, 36, 16, 28, 36, 16, 36, 10, 28]
//            let ni = [7.70889828326934, -26.0835009128688, 267.416218930389, 17.2221089496844, -293.54233214597, 614.135601882478, -61056.2757725674, -65127225.1118219, 73591.9313521937, -11664650591.4191, 35.5267086434461, -596.144543825955, -475.842430145708, 69.6781965359503, 335.674250377312, 25052.6809130882, 146997.380630766, 5.38069315091534E+19, 1.43619827291346E+21, 3.64985866165994E+19, -2547.41561156775, 2.40120197096563E+27, -3.93847464679496E+29, 1.47073407024852E+24, -4.26391250432059E+31, 1.94509340621077E+38, 6.66212132114896E+23, 7.06777016552858E+33, 1.75563621975576E+41, 1.08408607429124E+28, 7.30872705175151E+43, 1.5914584739887E+24, 3.77121605943324E+40]
//            let sigma = s / 4.4
//            let eta = h / 2300
//            var ps = 0.0
           
//            for i:Int in 0...32{
//                ps = ps + ni[i] * pow((eta - 1.01) , Ii[i]) * pow((sigma - 0.75) , Ji[i])
//            }
//            return ps * 99
//        }else{
//            //Subregion 3b;
//            //Eq 2, Table 4, Page 8;
//            let Ii:[Double] = [-12, -12, -12, -12, -12, -10, -10, -10, -10, -8, -8, -6, -6, -6, -6, -5, -4, -4, -4, -3, -3, -3, -3, -2, -2, -1, 0, 2, 2, 5, 6, 8, 10, 14, 14]
//            let Ji:[Double] = [2, 10, 12, 14, 20, 2, 10, 14, 18, 2, 8, 2, 6, 7, 8, 10, 4, 5, 8, 1, 3, 5, 6, 0, 1, 0, 3, 0, 1, 0, 1, 1, 1, 3, 7]
//            let ni = [1.25244360717979E-13, -1.26599322553713E-02, 5.06878030140626, 31.7847171154202, -391041.161399932, -9.75733406392044E-11, -18.6312419488279, 510.973543414101, 373847.005822362, 2.99804024666572E-08, 20.0544393820342, -4.98030487662829E-06, -10.230180636003, 55.2819126990325, -206.211367510878, -7940.12232324823, 7.82248472028153, -58.6544326902468, 3550.73647696481, -1.15303107290162E-04, -1.75092403171802, 257.98168774816, -727.048374179467, 1.21644822609198E-04, 3.93137871762692E-02, 7.04181005909296E-03, -82.910820069811, -0.26517881813125, 13.7531682453991, -52.2394090753046, 2405.56298941048, -22736.1631268929, 89074.6343932567, -23923456.5822486, 5687958081.29714]
//            let sigma = s / 5.3
//            let eta = h / 2800
//            var ps = 0.0
           
//            for i:Int in 0...34{
//                ps = ps + ni[i] * pow((eta - 0.681) , Ii[i]) * pow((sigma - 0.792) , Ji[i])
//            }
//            return  16.6 / ps
//        }
//    }

//    func h3_pT (p:Double, T:Double)->Double{
//        //Not avalible with IF 97;
//        //Solve function T3_ph-T=0 with half interval method.;
//        //ver2.6 Start corrected bug;
//        var Low_Bound = 0.0
//        var High_Bound = 0.0
//        var Ts = 0.0
//        if(p < 22.06395 ){ //Bellow tripple point;
//            Ts = T4_p(p: p)    //Saturation temperature;
//            if(T <= Ts ){  //Liquid side;
//                High_Bound = h4L_p(p: p) //Max h är liauid h.;
//                Low_Bound = h1_pT(p: p, T: 623.15)
//            }else{
//                Low_Bound = h4V_p(p: p)  //Min h är Vapour h.;
//                High_Bound = h2_pT(p: p, T: B23T_p(p: p))
//            }
//        }else{     //Above tripple point. R3 from R2 till R3.;
//            Low_Bound = h1_pT(p: p, T: 623.15)
//            High_Bound = h2_pT(p: p, T: B23T_p(p: p))
//        }

//        //ver2.6 End corrected bug;
//        Ts = T + 1
//        var hss = 0.0
//        while( abs(T - Ts) > 0.000001){
//            hss = (Low_Bound + High_Bound) / 2
//            Ts = T3_ph(p: p, h: hss)
//            if(Ts > T ){
//                High_Bound = hss
//            }else{
//                Low_Bound = hss
//            }
//        }
//        return hss
//    }
   
//    func T3_prho (p:Double, rho:Double)->Double{
//        //Solve by iteration. Observe that fo low temperatures this equation has 2 solutions.;
//         //Solve with half interval method;
//         var Low_Bound = 623.15
//         var High_Bound = 1073.15
//        var ps = 0.0
//        var Ts = 0.0
//         while( abs(p - ps) > 0.00000001){
//             Ts = (Low_Bound + High_Bound) / 2
//            ps = p3_rhoT(rho: rho, T: Ts)
//             if(ps > p ){
//                 High_Bound = Ts
//             }else{
//                 Low_Bound = Ts
//             }
//         }
//         return Ts
//     }
   

//*2.4 Functions for region 4
async function p4_T(t) {
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam, September 1997
    // Section 8.1 The Saturation-Pressure Equation
    // Eq 30, Page 33
    const teta = t - 0.23855557567849 / (t - 650.17534844798);
    const a = Math.pow(teta, 2) + 1167.0521452767 * teta - 724213.16703206;
    const b = -17.073846940092 * Math.pow(teta, 2) + 12020.82470247 * teta - 3232555.0322333;
    const c = 14.91510861353 * Math.pow(teta, 2) - 4823.2657361591 * teta + 405113.40542057;
    return Math.pow(2 * c / (-b + Math.pow(Math.pow(b, 2) - 4 * a * c, 0.5)), 4);
}


//***********************************************************************************************************
     //*2.4 Functions for region 4
    
//      func p4_T(t:Double) -> Double{
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam, September 1997
//         //Section 8.1 The Saturation-Pressure Equation
//         //Eq 30, Page 33
//         let teta = t - 0.23855557567849 / (t - 650.17534844798)
//         let a = pow(teta ,2) + 1167.0521452767 * teta - 724213.16703206
//         let b = -17.073846940092 * pow(teta ,2) + 12020.82470247 * teta - 3232555.0322333
//         let c = 14.91510861353 * pow(teta ,2) - 4823.2657361591 * teta + 405113.40542057
//         return pow((2 * c / (-b + pow((pow(b ,2) - 4 * a * c) ,0.5))) ,4)
//     }
    
    
//     func T4_p (p:Double)-> Double{
//         //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
//         //Section 8.2 The Saturation-Temperature Equation;
//         //Eq 31, Page 34;
//         let beta = pow(p,0.25)
//         let e = pow(beta ,2) - 17.073846940092 * beta + 14.91510861353
//         let f = 1167.0521452767 * pow(beta ,2) + 12020.82470247 * beta - 4823.2657361591
//         let g = -724213.16703206 * pow(beta ,2) - 3232555.0322333 * beta + 405113.40542057
//         let d = 2 * g / (-f - pow((pow(f ,2) - 4 * e * g) ,0.5))
        
//         return  (650.17534844798 + d - pow((pow((650.17534844798 + d) ,2) - 4 * (-0.23855557567849 + 650.17534844798 * d)) ,0.5)) / 2
        
//     }
    
//     func H4_s (s:Double) -> Double {
//         //var Ii,  Ji,  ni,  eta,  sigma,  sigma1,  sigma2,  i;
//         //Supplementary Release on Backward Equations ( ) , p h s for Region 3,Equations as a Function of h && s for the Region Boundaries, and an Equation( ) sat , T hs for Region 4 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
//         //4 Equations for Region Boundaries Given Enthalpy && Entropy;
//         // Se picture page 14;
//         if(s > -0.0001545495919 && s <= 3.77828134 ){
//             //hL1_s;
//             //Eq 3,Table 9,Page 16
//             let Ii:[Double] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 7, 8, 12, 12, 14, 14, 16, 20, 20, 22, 24, 28, 32, 32]
//             let Ji:[Double] = [14, 36, 3, 16, 0, 5, 4, 36, 4, 16, 24, 18, 24, 1, 4, 2, 4, 1, 22, 10, 12, 28, 8, 3, 0, 6, 8]
//             let ni:[Double] = [0.332171191705237, 6.11217706323496E-04, -8.82092478906822, -0.45562819254325, -2.63483840850452E-05, -22.3949661148062, -4.28398660164013, -0.616679338856916, -14.682303110404, 284.523138727299, -113.398503195444, 1156.71380760859, 395.551267359325, -1.54891257229285, 19.4486637751291, -3.57915139457043, -3.35369414148819, -0.66442679633246, 32332.1885383934, 3317.66744667084, -22350.1257931087, 5739538.75852936, 173.226193407919, -3.63968822121321E-02, 8.34596332878346E-07, 5.03611916682674, 65.5444787064505]
//             let sigma = s / 3.8
//             var eta = 0.0
            
//             for i in stride(from: 0, to: 26, by: 1) {
//                 eta = eta + ni[i] * pow((sigma - 1.09) , Ii[i]) * pow((sigma + 0.0000366) , Ji[i])
//             }
//             return eta * 1700
            
//         }else if (s > 3.77828134 && s <= 4.41202148223476){
//             //hL3_s;
//             //Eq 4,Table 10,Page 16;
//             let Ii:[Double] = [0, 0, 0, 0, 2, 3, 4, 4, 5, 5, 6, 7, 7, 7, 10, 10, 10, 32, 32]
//             let Ji:[Double] = [1, 4, 10, 16, 1, 36, 3, 16, 20, 36, 4, 2, 28, 32, 14, 32, 36, 0, 6]
//             let ni:[Double] = [0.822673364673336, 0.181977213534479, -0.011200026031362, -7.46778287048033E-04, -0.179046263257381, 4.24220110836657E-02, -0.341355823438768, -2.09881740853565, -8.22477343323596, -4.99684082076008, 0.191413958471069, 5.81062241093136E-02, -1655.05498701029, 1588.70443421201, -85.0623535172818, -31771.4386511207, -94589.0406632871, -1.3927384708869E-06, 0.63105253224098]
//             let sigma = s / 3.8
//             var eta = 0.0
            
//             for i in stride(from: 0, to: 18, by: 1) {
//                 eta = eta + ni[i] * pow((sigma - 1.09) , Ii[i]) * pow((sigma + 0.0000366) , Ji[i]);
//             }
//             return eta * 1700
            
//         }else if (s > 4.41202148223476 && s <= 5.85){
//             //Section 4.4 Equations ( ) 2ab " h s and ( ) 2c3b "h s for the Saturated Vapor Line;
//             //Page 19, Eq 5;
//             //hV2c3b_s(s);
//             let Ii:[Double] = [0, 0, 0, 1, 1, 5, 6, 7, 8, 8, 12, 16, 22, 22, 24, 36]
//             let Ji:[Double] = [0, 3, 4, 0, 12, 36, 12, 16, 2, 20, 32, 36, 2, 32, 7, 20]
//             let ni:[Double] = [1.04351280732769, -2.27807912708513, 1.80535256723202, 0.420440834792042, -105721.24483466, 4.36911607493884E+24, -328032702839.753, -6.7868676080427E+15, 7439.57464645363, -3.56896445355761E+19, 1.67590585186801E+31, -3.55028625419105E+37, 396611982166.538, -4.14716268484468E+40, 3.59080103867382E+18, -1.16994334851995E+40]
//             let sigma = s / 5.9
//             var eta = 0.0
            
//             for i in stride(from: 0, to: 15, by: 1) {
//                 eta = eta + ni[i] * pow((sigma - 1.02) , Ii[i]) * pow((sigma - 0.726) , Ji[i]);
//             }
//             return pow(eta ,4) * 2800

//         }else if (s > 5.85 && s < 9.155759395){
//             //Section 4.4 Equations ( ) 2ab " h s and ( ) 2c3b "h s for the Saturated Vapor Line;
//             //Page 20, Eq 6;
//             let Ii:[Double] = [1, 1, 2, 2, 4, 4, 7, 8, 8, 10, 12, 12, 18, 20, 24, 28, 28, 28, 28, 28, 32, 32, 32, 32, 32, 36, 36, 36, 36, 36]
//             let Ji:[Double] = [8, 24, 4, 32, 1, 2, 7, 5, 12, 1, 0, 7, 10, 12, 32, 8, 12, 20, 22, 24, 2, 7, 12, 14, 24, 10, 12, 20, 22, 28]
//             let ni:[Double] = [-524.581170928788, -9269472.18142218, -237.385107491666, 21077015581.2776, -23.9494562010986, 221.802480294197, -5104725.33393438, 1249813.96109147, 2000084369.96201, -815.158509791035, -157.612685637523, -11420042233.2791, 6.62364680776872E+15, -2.27622818296144E+18, -1.71048081348406E+31, 6.60788766938091E+15, 1.66320055886021E+22, -2.18003784381501E+29, -7.87276140295618E+29, 1.51062329700346E+31, 7957321.70300541, 1.31957647355347E+15, -3.2509706829914E+23, -4.18600611419248E+25, 2.97478906557467E+34, -9.53588761745473E+19, 1.66957699620939E+24, -1.75407764869978E+32, 3.47581490626396E+34, -7.10971318427851E+38]
//             let sigma1 = s / 5.21
//             let sigma2 = s / 9.2
//             var eta = 0.0
            
//             for i in stride(from: 0, to: 30, by: 1) {
//                 eta = eta + ni[i] * pow((1 / sigma1 - 0.513) , Ii[i]) * pow((sigma2 - 0.524) , Ji[i]);
//             }
//             return exp(eta) * 2800

//         }else{
//             //invalid_input();
//             //alert("Invalid Input!!!");
//             return 0.0
//         }
//     }
    
    
//     func P4_s (s:Double)-> Double{
//         //Uses h4_s && p_hs for the diffrent regions to determine p4_s;
//         let hsat = H4_s(s: s)
//         if(s > -0.0001545495919 && s <= 3.77828134 ){
//             return P1_hs(h: hsat, s: s)
//         }else if (s > 3.77828134 && s <= 5.210887663){
//             return P3_hs(h: hsat, s: s)
//         }else if (s > 5.210887663 && s < 9.155759395){
//             return P2_hs(h: hsat, s: s)
//         }else{
// //            invalid_input();
// //            //alert("Invalid Input!!!");
//             return 0.0
//         }
//     }
    
//     func h4L_p (p:Double)->Double{
//         if(p > 0.000611657 && p < 22.06395 ){
//             let Ts = T4_p(p: p)
//             if(p < 16.529 ){
//                 return h1_pT(p: p, T: Ts)
//             }else{
//                 //Iterate to find the the backward solution of p3sat_h;
//                 var Low_Bound1 = 1670.858218
//                 var High_Bound1 = 2087.23500164864
//                 var ps = 0.0
//                 var hs = 0.0
//                 while( abs(p - ps) > 0.00001){
//                     hs = (Low_Bound1 + High_Bound1) / 2
//                     ps = P3sat_h(h: hs)
//                     if(ps > p ){
//                         High_Bound1 = hs
//                     }else{
//                         Low_Bound1 = hs
//                     }
//                 }
//                 return hs
//             }
//         }else{
//             return 0
//         }
//     }
    
//     func h4V_p (p:Double)->Double{
//         if(p > 0.000611657 && p < 22.06395 ){
//             let Ts = T4_p(p: p)
//             if(p < 16.529 ){
//                 return h2_pT(p: p, T: Ts)
//             }else{
//                 //Iterate to find the the backward solution of p3sat_h;
//                 var Low_Bound2 = 2087.23500164864;
//                 var High_Bound2 = 2563.592004 + 5; //5 added to extrapolate to ensure even the border ==350°C solved.;
//                 var ps = 0.0
//                 var hs = 0.0
//                 while( abs(p - ps) > 0.0000000001){
//                     hs = (Low_Bound2 + High_Bound2) / 2
//                     ps = P3sat_h(h: hs)
//                     if(ps < p ){
//                         High_Bound2 = hs
//                     }else{
//                         Low_Bound2 = hs
//                     }
//                 }
//                 return  hs
//             }
//         }else{
//             return  0
//         }
//     }
    
//     func x4_Ph (p:Double, h:Double)->Double{
//         //Calculate vapour fraction from hL && hV for given p;
//         let h4v = h4V_p(p: p)
//         let h4l = h4L_p(p: p)

//         if(h > h4v ){
//             return 1.0
//         }else if (h <= h4l){
//             return 0.0
//         }else{
//             return (h - h4l) / (h4v - h4l)
//         }
//     }

async function X4_ps (p, s){
    var ssL = 0.0
    var ssV = 0.0
    if(p < 16.529 ){
        ssV = await s2_pT(p, await T4_p(p))
        ssL = await s1_pT(p, await T4_p(p))
    }else{
        ssV = await s3_rhoT(1/ await  V3_ph(p, await h4V_p(p)), await T4_p(p))
        ssL = await s3_rhoT(1/ await  V3_ph(p, await h4L_p(p)), await T4_p(p))
    }
    
    if(s < ssL ){
        return 0
    }else if (s > ssV){
        return 1
    ;
    }else{
        return (s - ssL) / (ssV - ssL)
    }
}
    
//     func T4_hs (h:Double, s:Double)->Double{
//         //Supplementary Release on Backward Equations ( ) , p h s for Region 3,;
//         //Chapter 5.3 page 30.;
//         //The if 97 function is only valid for part of region4. Use iteration outsida.;
//         let Ii:[Double] = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 8, 10, 10, 12, 14, 14, 16, 16, 18, 18, 18, 20, 28]
//         let Ji:[Double] = [0, 3, 12, 0, 1, 2, 5, 0, 5, 8, 0, 2, 3, 4, 0, 1, 1, 2, 4, 16, 6, 8, 22, 1, 20, 36, 24, 1, 28, 12, 32, 14, 22, 36, 24, 36]
//         let ni = [0.179882673606601, -0.267507455199603, 1.162767226126, 0.147545428713616, -0.512871635973248, 0.421333567697984, 0.56374952218987, 0.429274443819153, -3.3570455214214, 10.8890916499278, -0.248483390456012, 0.30415322190639, -0.494819763939905, 1.07551674933261, 7.33888415457688E-02, 1.40170545411085E-02, -0.106110975998808, 1.68324361811875E-02, 1.25028363714877, 1013.16840309509, -1.51791558000712, 52.4277865990866, 23049.5545563912, 2.49459806365456E-02, 2107964.67412137, 366836848.613065, -144814105.365163, -1.7927637300359E-03, 4899556021.00459, 471.262212070518, -82929439019.8652, -1715.45662263191, 3557776.82973575, 586062760258.436, -12988763.5078195, 31724744937.1057]
        
//         if((s > 5.210887825 && s < 9.15546555571324) ){
//             let sigma = s / 9.2
//             let eta = h / 2800
//             var teta = 0.0
//             for i:Int in 0...35{
//                 teta = teta + ni[i] * pow((eta - 0.119) , Ii[i]) * pow((sigma - 1.07) , Ji[i])
//             }
//             return teta * 550
//         }else{
//             //Function psat_h;
//             var PL = 0.0
//             if(s > -0.0001545495919 && s <= 3.77828134){//3.77828134
//                 var Low_Bound = 0.000611
//                 var High_Bound = 165.291642526045
//                 let hL=0.0
//                 while( abs(hL - h) > 0.00001 && abs(High_Bound - Low_Bound) > 0.0001){
//                     PL = (Low_Bound + High_Bound) / 2
//                     let Ts = T4_p(p: PL)
//                     let hL = h1_pT(p: PL, T: Ts)
//                     if(hL > h ){
//                         High_Bound = PL
//                     }else{
//                         Low_Bound = PL
//                     }
//                 }
//             }else if(s > -0.0001545495919 && s <= 5.210887663 && h == 1200.0){
//                 var Low_Bound = 0.000611
//                 var High_Bound = 165.291642526045
//                 let hL=0.0
//                 while( abs(hL - h) > 0.00001 && abs(High_Bound - Low_Bound) > 0.0001){
//                     PL = (Low_Bound + High_Bound) / 2
//                     let Ts = T4_p(p: PL)
//                     let hL = h1_pT(p: PL, T: Ts)
//                     if(hL > h ){
//                         High_Bound = PL
//                     }else{
//                         Low_Bound = PL
//                     }
//                 }
//             }else if (s > 3.77828134 && s <= 4.41202148223476){
//                 PL = P3sat_h(h: h)
//             }else if (s > 4.41202148223476 && s <= 5.210887663){
//                 PL = P3sat_h(h: h)
//             }
            
//             var Low_Boundd = 0.000611
//             var High_Boundd = PL
//             var ss = 0.0
//             var pp = 0.0
//             var s4V = 0.0
//             var s4L = 0.0
//             while( abs(s - ss) > 0.000001 && abs(High_Boundd - Low_Boundd) > 0.0000001){
//                 pp = (Low_Boundd + High_Boundd) / 2
        
//                 //Calculate s4_ph;
//                 let Tss = T4_p(p: pp)
//                 let xss = x4_Ph(p: pp, h: h)
//                 if(pp < 16.529 ){
//                     s4V = s2_pT(p: pp, T: Tss)
//                     s4L = s1_pT(p: pp, T: Tss)
//                 }else{
//                     let v4V = V3_ph(p: pp, h: h4V_p(p: pp))
//                     s4V = s3_rhoT(rho: 1/v4V, T: Tss)
//                     let v4L = V3_ph(p: pp, h: h4L_p(p: pp))
//                     s4L = s3_rhoT(rho: 1/v4L, T: Tss)
        
//                 }
//                 ss = (xss * s4V + (1 - xss) * s4L)
        
//                 //alert("xs: "+xs+"  s4v: "+s4V+"  s4l: "+s4L);
//                 if(ss < s ){
//                     High_Boundd = pp;
//                 }else{
//                     Low_Boundd = pp;
//                 }
//             }
//             return T4_p(p: pp)
//         }
//     }



//*3 Region Selection
    //***********************************************************************************************************
    //*3.1 Regions as a function of pT
    
async function region_pT (p, t){
    if(t > 1073.15 && p < 10 && t < 2273.15 && p > 0.000611 ){
        return 5
    }else if (t <= 1073.15 && t > 273.15 && p <= 100 && p > 0.000611){
        if(t > 623.15 ){
            if(p > await B23p_T(t)){
                
                if(t < 647.096 ){
                    let ps = await p4_T(t)
                    if(Math.abs(p - ps) < 0.00001 ){
                        return 4
                    }
                }
                return 3
            }else{
                return 2
            }
        }else{
            let ps = await p4_T(t)
            if(Math.abs(p - ps) < 0.00001 ){
                return 4
            }else if (p > ps){
                return 1

            }else{
                return 2
            }
        }
    }else{
        return 0 //**Error, Outside valid area;
    }
}

     //***********************************************************************************************************
    //*3.2 Regions as a function of ph
    
async function Region_ph (p, h){
    //Check if outside pressure limits;
    if(p < 0.000611657 || p > 100 ){
        return 0
        //break region_ph;
    }
    //Check if outside low h.;
    if(h < 0.963 * p + 2.2 ){ //Linear adaption to h1_pt()+2 to speed up calcualations.;
        if(h < await h1_pT(p, 273.15)){
            return 0
        }
    }
    
    if(p < 16.5292 ){ //Bellow region 3,Check  region 1,4,2,5;
        //Check Region 1;
        let Ts = await T4_p(p)
        var hL = 109.6635 * Math.log(p) + 40.3481 * p + 734.58 //Approximate function for hL_p;
        
        if(Math.abs(h - hL) < 100 ){ //If approximate is ! god enough use real function;
            hL = await h1_pT(p, Ts)
        }
        
        if(h <= hL ){
            return 1
        }
        
        //Check Region 4;
        var hV = 45.1768 * Math.log(p) - 20.158 * p + 2804.4 //Approximate function for hV_p;
        if(Math.abs(h - hV) < 50 ){ //If approximate is ! god enough use real function;
            hV = await h2_pT(p, Ts)
        }
        if(h < hV ){
            return 4
        }
        
        //Check upper limit of region 2 Quick Test;
        if(h < 4000 ){
            return 2
        }
        
        //Check region 2 (Real value);
        let h_45 = await h2_pT(p, 1073.15)
        if(h <= h_45 ){
            return 2
        }
        
        //Check region 5;
        if(p > 50 ){
            return 0
        }

        let h_5u = await h5_pT(p, 2273.15)
        if(h < h_5u ){
            return 5
        }
        return 0
    }else{ //For p>16.5292;
        //Check if in region1;
        if(h < await h1_pT(p, 623.15)){
            return 1
        }
    
        //Check if in region 3 || 4 (Bellow Reg 2);
        if(h < await h2_pT(p, await B23T_p(p))){
            //Region 3 || 4;
            if(p > await P3sat_h(h)){
                return 3
            }else{
                return 4
            }
        }
        
        //Check if region 2;
        //h2_pT(p, 1073.15);
        if(h < await h2_pT(p, 1073.15)){
            return 2
        }
    }
    return 0
}
    
    
    // //***********************************************************************************************************
    // //*3.3 Regions as a function of ps
    
async function Region_ps (p, s){
    var ss = 0.0
    if(p < 0.000611657 || p > 100 || s < 0 || s > await s5_pT(p, 2273.15) ){
        return 0
    }
    
    //Check region 5;
    if(s > await s2_pT(p, 1073.15) ){
        if(p <= 10 ){
            return 5
        }else{
            return 0
        }
    }
    
    
    //Check region 2;
    if(p > 16.529 ){
        ss = await s2_pT(p, await B23T_p(p)) //Between 5.047 && 5.261. Use to speed up!;
    }else{
        ss = await s2_pT(p, await T4_p(p))
    }
    if(s > ss ){
        return 2
    }
    
    //Check region 3;
    ss = await s1_pT(p, 623.15)
    if(p > 16.529 && s > ss ){
        if(p > await P3sat_s(s) ){
            return 3
        }else{
            return 4
        }
    }
    
    //Check region 4 (Not inside region 3);
    if(p < 16.529 && s > await s1_pT(p, await T4_p(p)) ){
        return 4
    }
    
    //Check region 1;
    if(p > 0.000611657 && s > await s1_pT(p, 273.15) ){
        return 1
    }
    return 1
}
    
    
    // //***********************************************************************************************************
    // //*3.4 Regions as a function of hs
    
    
    // func Region_hs (h:Double, s:Double)->Int{
    //     //var TMax,  hMax,  hB,  hL,  hV,  vmax,  Tmin,  hMin;
    //     if(s < -0.0001545495919 ){
    //         return 0
    //     }
        
    //     //Check linear adaption to p=0.000611. If bellow region 4.;
    //     let hMin = (((-0.0415878 - 2500.89262) / (-0.00015455 - 9.155759)) * s)
    //     if(s < 9.155759395 && h < hMin ){
    //     return 0
    //     }
        
    //     //******Kolla 1 eller 4. (+liten bit över B13);
    //     if(s >= -0.0001545495919 && s <= 3.77828134 ){
    //         if(h < H4_s(s: s) ){
    //             return 4
    //         }else if (s < 3.397782955){
    //             //100MPa line is limiting;
    //             let TMax = T1_ps(p: 100, s: s)
    //             let hMax = h1_pT(p: 100, T: TMax)
    //             if(h < hMax ){
    //                 return 1
    //             }else{
    //                 return 0
    //             }
    //         }else{ //The point is either in region 4,1,3. Check B23;
    //             let hB = hB13_s(s: s)
    //             if(h < hB ){
    //                 return 1
    //             }
    //             let TMax = T3_ps(p: 100, s: s)
    //             let vmax = V3_ps(p: 100, s: s)
    //             let hMax = h3_rhoT(rho: 1/vmax, T: TMax)
    //             if(h < hMax ){
    //                 return 3
    //             }else{
    //                 return 0
    //             }
    //         }
    //     }
        
        
    //     // //******Kolla region 2 eller 4. (Övre delen av område b23-> max);
    //     if(s >= 5.260578707 && s <= 11.9212156897728 ){
    //         if(s > 9.155759395 ){
    //             //Above region 4;
    //             let Tmin = T2_ps(p: 0.000611, s: s)
    //             let hMin = h2_pT(p: 0.000611, T: Tmin)
    //             //Function adapted to h(1073.15,s);
    //             let hMax = -0.07554022 * pow(s,4) + 3.341571 * pow(s,3) - 55.42151 * pow(s,2) + 408.515 * s + 3031.338
    //             if(h > hMin && h < hMax ){
    //                 return 2
    //             }else{
    //                 return 0
    //             }
    //         }
            
    //         let hV = H4_s(s: s)
    //         if(h < hV ){
    //             //Region 4. Under region 3.;
    //             return 4
    //         }
            
    //         var hMax = 0.0
        
    //         if(s < 6.04048367171238 ){
    //             let TMax = T2_ps(p: 100, s: s)
    //             hMax = h2_pT(p: 100, T: TMax)
    //         }else{
    //             //Function adapted to h(1073.15,s);
    //             hMax = -2.988734 * pow(s,4) + 121.4015 * pow(s,3) - 1805.15 * pow(s,2) + 11720.16 * s - 23998.33
    //         }
        
    //         if(h < hMax ){
    //             //Region 2. Över region 4.;
    //             return 2
    //         }else{
    //             return 0
    //         }
    //     }
        
    //     //Kolla region 3 eller 4. Under kritiska punkten.;
    //     if(s >= 3.77828134 && s <= 4.41202148223476 ){
    //         let hL = H4_s(s: s)
    //         if(h < hL ){
    //             return 4
    //         }
    //         let TMax = T3_ps(p: 100, s: s)
    //         let vmax = V3_ps(p: 100, s: s)
    //         let hMax = h3_rhoT(rho: 1/vmax, T: TMax)
    //         if(h < hMax ){
    //             return 3
    //         }else{
    //             return 0
    //         }
    //     }
        
    //     //Kolla region 3 eller 4 från kritiska punkten till övre delen av b23;
    //     if(s >= 4.41202148223476 && s <= 5.260578707 ){
    //         let hV = H4_s(s: s)
    //         if(h < hV ){
    //             return 4
    //         }
        
    //         //Kolla om vi är under b23 giltighetsområde.;
    //         if(s <= 5.048096828 ){
    //             let TMax = T3_ps(p: 100, s: s)
    //             let vmax = V3_ps(p: 100, s: s)
    //             let hMax = h3_rhoT(rho: 1/vmax, T: TMax)
    //             if(h < hMax ){
    //                 return 3
    //             }else{
    //                 return 0
    //             }
    //         }else{ //Inom området för B23 i s led.;
    //             if((h > 2812.942061) ){
    //                 //Ovanför B23 i h_led;
    //                 if(s > 5.09796573397125 ){
    //                     let TMax = T2_ps(p: 100, s: s)
    //                     let hMax = h2_pT(p: 100, T: TMax)
    //                     if(h < hMax ){
    //                         return 2
    //                     }else{
    //                         return 0
    //                     }
    //                 }else{
    //                     return 0
    //                 }
    //             }
    //             if((h < 2563.592004) ){
    //                 //Nedanför B23 i h_led men vi har redan kollat ovanför hV2c3b;
    //                 return 3
    //             }
        
    //             //Vi är inom b23 området i både s och h led.;
    //             if(P2_hs(h: h, s: s) > B23p_T(T: TB23_hs(h: h, s: s))){
    //                 return 3
    //             }else{
    //                 return 2
    //             }
    //         }
    //     }
    //     return 0
    //     //alert("Invalid Input!!!");
    // }
    
    
    // //***********************************************************************************************************
    // //*3.5 Regions as a function of p and rho
    
    // func Region_prho (p:Double, rho:Double)->Double{
    //  	var v = 0.0
    //  	v = 1 / rho
    //  	if(p < 0.000611657 || p > 100 ){
    //  		return 0;
    //  	}
    
    //  	if(p < 16.5292 ){
    //  		//Bellow region 3, Check region 1,4,2;
    //  		if(v < v1_pT(p: p, T: 273.15) ){ //Observe that this is ! actually min of v. Not valid Water of 4°C is ligther.;
    //  			return 0
    //  		}
    //  		if(v <= v1_pT(p: p, T: T4_p(p: p)) ){
    //  			return 1
    //  		}
    //  		if(v < v2_pT(p: p, T: T4_p(p: p)) ){
    //  			return 4
    //  		}
    //  		if(v <= v2_pT(p: p, T: 1073.15) ){
    //  			return 2
    //  		}
    //  		if(p > 10 ){ //Above region 5;
    //  			return 0
    //  		}
    //  		if(v <= v5_pT(p: p, T: 2073.15) ){
    //  			return 5
    //  		}
    //  	}else{ //Check region 1,3,4,3,2 (Above the lowest point of region 3.);
    //  		if(v < v1_pT(p: p, T: 273.15) ){ //Observe that this is ! actually min of v. Not valid Water of 4°C is ligther.;
    //  			return 0
    //  		}
    //  		if(v < v1_pT(p: p, T: 623.15) ){
    //  			return 1
    //  		}
    
    //  		//Check if in region 3 || 4 (Bellow Reg 2);
    //  		if(v < v2_pT(p: p, T: B23T_p(p: p)) ){
    //  			//Region 3 || 4;
    //  			if(p > 22.064 ){ //Above region 4;
    //  				return 3
    //  			}
    //  			if(v < V3_ph(p: p, h: h4L_p(p: p)) || v > V3_ph(p: p, h: h4V_p(p: p)) ){//Uses iteration!!;
    //  				return 3
    //  			}else{
    //  				return 4
    //  			}
    //  		}
    //  		//Check if region 2;
    //  		if(v < v2_pT(p: p, T: 1073.15) ){
    //  			return 2
    //  		}
    //  	}
    //  	return 0
    //  }

 //*4 Region Borders
     //***********************************************************************************************************
     //**********************************************************************************************************
     //*4.1 Boundary between region 2 and 3.
    
async function B23p_T(T){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam;
    //1997;
    //Section 4 Auxiliary Equation for the Boundary between Regions 2 && 3;
    //Eq 5, Page 5;
    return  348.05185628969 - 1.1671859879975 * T + 1.0192970039326E-03 * Math.pow(T,2)
}

    async function B23T_p (p){

    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam;
    //1997;
    //Section 4 Auxiliary Equation for the Boundary between Regions 2 && 3;
    //Eq 6, Page 6;
    return 572.54459862746 + Math.pow(((p - 13.91883977887) / 1.0192970039326E-03), 0.5)
}
    
    
    // //**********************************************************************************************************   

//*4.2 Region 3. pSat_h and pSat_s
async function P3sat_h(h) {
    // Revised Supplementary Release on Backward Equations for the Functions T(p,h), v(p,h) && T(p,s), v(p,s) for Region 3 of the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam;
    // 2004;
    // Section 4 Boundary Equations psat(h) && psat(s) for the Saturation Lines of Region 3;
    // See pictures Page 17, Eq 10, Table 17, Page 18;

    const Ii = [0, 1, 1, 1, 1, 5, 7, 8, 14, 20, 22, 24, 28, 36];
    const Ji = [0, 1, 3, 4, 36, 3, 0, 24, 16, 16, 3, 18, 8, 24];
    const ni = [0.600073641753024, -9.36203654849857, 24.6590798594147, -107.014222858224, -91582131580576.8, -8623.32011700662, -23.5837344740032, 2.52304969384128E+17, -3.89718771997719E+18, -3.33775713645296E+22, 35649946963.6328, -1.48547544720641E+26, 3.30611514838798E+18, 8.13641294467829E+37];

    h = h / 2600;
    let ps = 0.0;

    for (let i = 0; i <= 13; i++) {
        ps += ni[i] * Math.pow((h - 1.02), Ii[i]) * Math.pow((h - 0.608), Ji[i]);
    }

    return ps * 22;
}

async function P3sat_s(s){
    let Ii = [0, 1, 1, 4, 12, 12, 16, 24, 28, 32]
    let Ji = [0, 1, 32, 7, 4, 14, 36, 10, 0, 18]
    let ni = [0.639767553612785, -12.9727445396014, -2.24595125848403E+15, 1774667.41801846, 7170793495.71538, -3.78829107169011E+17, -9.55586736431328E+34, 1.87269814676188E+23, 119254746466.473, 1.10649277244882E+36]
    let sigma = s / 5.2
    var p = 0.0
    for (let i = 0; i <= 9; i++){
        p = p + ni[i] * Math.pow((sigma - 1.03) , Ii[i]) * Math.pow((sigma - 0.699) , Ji[i])
    }
    return p * 22
}

// Example usage:
// var result = P3sat_h(2000); // Replace 2000 with the desired value for 'h'
// console.log(result);

 // //***********************************************************************************************************
    //2.5 Functions for region 5 

async function h5_pT(p, T){
    //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //Basic Equation for Region 5;
    //Eq 32,33, Page 36, Tables 37-41;
    let R = 0.461526   //kJ/(kg K)
    let Ji0 = [0, 1, -3, -2, -1, 2]
    let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    let Iir = [1, 1, 1, 2, 3]
    let Jir = [0, 1, 3, 9, 3]
    let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    let tau = 1000 / T
    var gamma0_tau = 0.0
    for (let i = 0; i <= 5; i++){
        gamma0_tau = gamma0_tau + ni0[i] * Ji0[i] * Math.pow(tau , (Ji0[i] - 1))
    }
    var gammar_tau = 0.0
    for (let i = 0; i <= 4; i++){
        gammar_tau = gammar_tau + nir[i] * Math.pow(p , Iir[i]) * Jir[i] * Math.pow(tau , (Jir[i] - 1))
    }
    return R * T * tau * (gamma0_tau + gammar_tau)
}
    
    // func v5_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //Basic Equation for Region 5;
    //     //Eq 32,33, Page 36, Tables 37-41;
    //     let R = 0.461526   //kJ/(kg K)
    //     //let Ji0:[Double] = [0, 1, -3, -2, -1, 2]
    //     //let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    //     let Iir:[Double] = [1, 1, 1, 2, 3]
    //     let Jir:[Double] = [0, 1, 3, 9, 3]
    //     let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    //     let tau = 1000 / T
    //     let gamma0_pi = 1 / p
    //     var gammar_pi = 0.0
    //     for i:Int in 0...4{
    //         gammar_pi = gammar_pi + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * pow(tau , Jir[i])
    //     }
    //     return R * T / p * p * (gamma0_pi + gammar_pi) / 1000
    // }
    
    // func u5_pT (p:Double, T:Double)->Double{
    //     //Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //     //Basic Equation for Region 5;
    //     //Eq 32,33, Page 36, Tables 37-41;
    //     let R = 0.461526   //kJ/(kg K);
    //     let Ji0:[Double] = [0, 1, -3, -2, -1, 2]
    //     let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    //     let Iir:[Double] = [1, 1, 1, 2, 3]
    //     let Jir:[Double] = [0, 1, 3, 9, 3]
    //     let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    //     let tau = 1000 / T
    //     let gamma0_pi = 1 / p
    //     var gamma0_tau = 0.0
    //     for i:Int in 0...5{
    //         gamma0_tau = gamma0_tau + ni0[i] * Ji0[i] * pow(tau , (Ji0[i] - 1))
    //     }
    //     var gammar_pi = 0.0
    //     var gammar_tau = 0.0
    //     for i:Int in 0...4{
    //         gammar_pi = gammar_pi + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * pow(tau , Jir[i])
    //         gammar_tau = gammar_tau + nir[i] * pow(p , Iir[i]) * Jir[i] * pow(tau , (Jir[i] - 1))
    //     }
    //     return R * T * (tau * (gamma0_tau + gammar_tau) - p * (gamma0_pi + gammar_pi))
    // }
    
    // func Cp5_pT (p:Double, T:Double)->Double{
    //  	//var Iir,  Jir,  nir,  ni0,  Ji0,  tau,  gamma0_tautau,  gammar_tautau,  i;
    //  	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //  	//Basic Equation for Region 5;
    //  	//Eq 32,33, Page 36, Tables 37-41;
    //  	let R = 0.461526   //kJ/(kg K)
    //     let Ji0:[Double] = [0, 1, -3, -2, -1, 2]
    //  	let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    //  	let Iir:[Double] = [1, 1, 1, 2, 3]
    //  	let Jir:[Double] = [0, 1, 3, 9, 3]
    //  	let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    //  	let tau = 1000 / T
    //  	var gamma0_tautau = 0.0
    //  	for i:Int in 0...5{
    //  		gamma0_tautau = gamma0_tautau + ni0[i] * Ji0[i] * (Ji0[i] - 1) * pow(tau , (Ji0[i] - 2))
    //  	}
    //  	var gammar_tautau = 0.0
    //  	for i:Int in 0...4{
    //  		gammar_tautau = gammar_tautau + nir[i] * pow(p , Iir[i]) * Jir[i] * (Jir[i] - 1) * pow(tau , (Jir[i] - 2))
    //  	}
    //  	return -R * pow(tau ,2) * (gamma0_tautau + gammar_tautau)
    //  }
    
async function s5_pT (p, T){
    // Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    // Basic Equation for Region 5;
    // Eq 32,33, Page 36, Tables 37-41;
    let R = 0.461526   //kJ/(kg K);
    let Ji0 = [0, 1, -3, -2, -1, 2]
    let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    let Iir = [1, 1, 1, 2, 3]
    let Jir = [0, 1, 3, 9, 3]
    let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    let tau = 1000 / T
    var gamma0 = Math.log(p)
    var gamma0_tau = 0.0
    
    for (let i = 0; i <= 5; i++){
        gamma0_tau = gamma0_tau + ni0[i] * Ji0[i] * Math.pow(tau , (Ji0[i] - 1));
        gamma0 = gamma0 + ni0[i] * Math.pow(tau , Ji0[i]);
    }
    var gammar = 0.0
    var gammar_tau = 0.0
    
    for (let i = 0; i <= 4; i++){
        gammar = gammar + nir[i] * Math.pow(p, Iir[i]) * Math.pow(tau,Jir[i]);
        gammar_tau = gammar_tau + nir[i] * Math.pow(p , Iir[i]) * Jir[i] * Math.pow(tau , (Jir[i] - 1));
    }
    return R * (tau * (gamma0_tau + gammar_tau) - (gamma0 + gammar))
}
    
    // func Cv5_pT (p:Double, T:Double)->Double{
    //  	//var Iir,  Jir,  nir,  ni0,  Ji0,  tau,  gamma0_tautau,  gammar_pi,  gammar_pitau,  gammar_pipi,  gammar_tautau,  i;
    //  	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //  	//Basic Equation for Region 5;
    //  	//Eq 32,33, Page 36, Tables 37-41;
    //  	let R = 0.461526  //kJ/(kg K)
    //     let Ji0:[Double] = [0, 1, -3, -2, -1, 2]
    //  	let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    //  	let Iir:[Double] = [1, 1, 1, 2, 3]
    //  	let Jir:[Double] = [0, 1, 3, 9, 3]
    //  	let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    //  	let tau = 1000 / T;
    //  	var gamma0_tautau = 0.0
    //     for i:Int in 0...5{
    //  		gamma0_tautau = gamma0_tautau + ni0[i] * (Ji0[i] - 1) * Ji0[i] * pow(tau , (Ji0[i] - 2))
    //  	}
    //  	var gammar_pi = 0.0
    //  	var gammar_pitau = 0.0
    //  	var gammar_pipi = 0.0
    //  	var gammar_tautau = 0.0
    //  	for i:Int in 0...4{
    //  		gammar_pi = gammar_pi + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * pow(tau , Jir[i])
    //  		gammar_pitau = gammar_pitau + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * Jir[i] * pow(tau , (Jir[i] - 1))
    //  		gammar_pipi = gammar_pipi + nir[i] * Iir[i] * (Iir[i] - 1) * pow(p , (Iir[i] - 2)) * pow(tau , Jir[i])
    //  		gammar_tautau = gammar_tautau + nir[i] * pow(p , Iir[i]) * Jir[i] * (Jir[i] - 1) * pow(tau , (Jir[i] - 2))
    //  	}
    //  	return R * (-(pow(tau ,2) * (gamma0_tautau + gammar_tautau)) - (1 + p * gammar_pi - tau * p * pow(gammar_pitau ,2)) / (1 - pow(p ,2) * gammar_pipi))
    // }
    
    // func w5_pT (p:Double, T:Double)->Double{
    //  	//var Iir,  Jir,  nir,  ni0,  Ji0,  tau,  gamma0_tautau,  gammar_pi,  gammar_pitau,  gammar_pipi,  gammar_tautau,  i;
    //  	//Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water && Steam, September 1997;
    //  	//Basic Equation for Region 5;
    //  	//Eq 32,33, Page 36, Tables 37-41;
    //  	let R = 0.461526   //kJ/(kg K)
    //     let Ji0:[Double] = [0, 1, -3, -2, -1, 2]
    //  	let ni0 = [-13.179983674201, 6.8540841634434, -0.024805148933466, 0.36901534980333, -3.1161318213925, -0.32961626538917]
    //  	let Iir:[Double] = [1, 1, 1, 2, 3]
    //  	let Jir:[Double] = [0, 1, 3, 9, 3]
    //  	let nir = [-1.2563183589592E-04, 2.1774678714571E-03, -0.004594282089991, -3.9724828359569E-06, 1.2919228289784E-07]
    //  	let tau = 1000 / T
    //  	var gamma0_tautau = 0.0
    //  	for i:Int in 0...5{
    //  		gamma0_tautau = gamma0_tautau + ni0[i] * (Ji0[i] - 1) * Ji0[i] * pow(tau , (Ji0[i] - 2))
    //  	}
    //  	var gammar_pi = 0.0
    //  	var gammar_pitau = 0.0
    //  	var gammar_pipi = 0.0
    //  	var gammar_tautau = 0.0
    //  	for i:Int in 0...4{
    //  		gammar_pi = gammar_pi + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * pow(tau , Jir[i])
    //  		gammar_pitau = gammar_pitau + nir[i] * Iir[i] * pow(p , (Iir[i] - 1)) * Jir[i] * pow(tau , (Jir[i] - 1))
    //  		gammar_pipi = gammar_pipi + nir[i] * Iir[i] * (Iir[i] - 1) * pow(p , (Iir[i] - 2)) * pow(tau , Jir[i])
    //  		gammar_tautau = gammar_tautau + nir[i] * pow(p , Iir[i]) * Jir[i] * (Jir[i] - 1) * pow(tau , (Jir[i] - 2))
    //  	}
    //  	return pow((1000 * R * T * (1 + 2 * p * gammar_pi + pow(p ,2) * pow(gammar_pi ,2)) / ((1 - pow(p ,2) * gammar_pipi) + (1 + p * gammar_pi - tau * p * pow(gammar_pitau ,2)) / (pow(tau ,2) * (gamma0_tautau + gammar_tautau)))) ,0.5)
    //  }
    
async function T5_ph (p, h){
    //Solve with half interval method;
    
    var Low_Bound = 1073.15
    var High_Bound = 2273.15
    var hs = 0.0
    var Ts = 0.0
    while(Math.abs(h - hs) > 0.00001){
        Ts = (Low_Bound + High_Bound) / 2
        hs = await h5_pT(p, Ts)
        if(hs > h ){
            High_Bound = Ts
        }else{
            Low_Bound = Ts
        }
    }
    return Ts
}
        
async function T5_ps (p, s){
    //Solve with half interval method;
    var Low_Bound = 1073.15
    var High_Bound = 2273.15
    var ss = 0.0
    var Ts = 0.0
    while(Math.abs(s - ss) > 0.00001){
        Ts = (Low_Bound + High_Bound) / 2
        ss = await s5_pT(p, Ts)
        if(ss > s ){
            High_Bound = Ts
        }else{
            Low_Bound = Ts
        }
    }
    return Ts
}
    
    // func T5_prho (p:Double, rho:Double)->Double{
    //  	//Solve by iteration. Observe that fo low temperatures this equation has 2 solutions.;
    //  	//Solve with half interval method;
    //  	var Low_Bound = 1073.15
    //  	var High_Bound = 2073.15
    //     var rhos = 0.0
    //     var Ts = 0.0
    //  	while(abs(rho - rhos) > 0.000001){
    //  		Ts = (Low_Bound + High_Bound) / 2
    //  		rhos = 1 / v2_pT(p: p, T: Ts)
    //  		if(rhos < rho ){
    //  			High_Bound = Ts
    //  		}else{
    //  			Low_Bound = Ts
    //  		}
    //  	}
    //  	return Ts
    //  }
    




//6. UNITS

async function toSIunit_p(p) {
    // Translate bar to MPa
    return p / 10;
}

async function fromSIunit_p(p) {
    // Translate MPa to bar
    return p * 10;
}

async function toSIunit_T(t) {
    // Translate degC to Kelvin
    return t + 273.15;
}

async function fromSIunit_T(t) {
    // Translate Kelvin to degC
    return t - 273.15;
}

async function toSIunit_h(h) {
    return h;
}

async function fromSIunit_h(h) {
    return h;
}

async function toSIunit_v(v) {
    return v;
}

async function fromSIunit_v(v) {
    return v;
}

async function toSIunit_s(s) {
    return s;
}

async function fromSIunit_s(s) {
    return s;
}

async function toSIunit_u(u) {
    return u;
}

async function fromSIunit_u(u) {
    return u;
}

async function toSIunit_Cp(cp) {
    return cp;
}

async function fromSIunit_Cp(cp) {
    return cp;
}

async function toSIunit_Cv(cv) {
    return cv;
}

async function fromSIunit_Cv(cv) {
    return cv;
}

async function toSIunit_w(w) {
    return w;
}

async function fromSIunit_w(w) {
    return w;
}

async function toSIunit_tc(tc) {
    return tc;
}

async function fromSIunit_tc(tc) {
    return tc;
}

async function toSIunit_st(st) {
    return st;
}

async function fromSIunit_st(st) {
    return st;
}

async function toSIunit_x(x) {
    return x;
}

async function fromSIunit_x(x) {
    return x;
}

async function toSIunit_vx(vx) {
    return vx;
}

async function fromSIunit_vx(vx) {
    return vx;
}

async function toSIunit_my(my) {
    return my;
}

async function fromSIunit_my(my) {
    return my;
}




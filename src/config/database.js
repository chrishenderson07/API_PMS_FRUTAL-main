let ambiente = undefined;

switch(process.env.PUBLICAR){
    case 'HML': 
        ambiente = configurarHML();
        break;
    case 'PRD':
        ambiente = configurarPRD();
        break;
    default:
        ambiente = configurarLOCAL();
}

function configurarHML(){
    return {
        dialect: process.env.HML_DIALECT,
        host: process.env.HML_HOST,
        port: process.env.HML_PORT,
        username: process.env.HML_USER_NAME,
        password: process.env.HML_PASSWORD,
        database: process.env.HML_DATABASE,
        define: {
            timestamps: true,
            underscored: true,
        }
    }
}

function configurarPRD(){
    return {
        dialect: process.env.PRD_DIALECT,
        host: process.env.PRD_HOST,
        port: process.env.PRD_PORT,
        username: process.env.PRD_USER_NAME,
        password: process.env.PRD_PASSWORD,
        database: process.env.PRD_DATABASE,
        define: {
            timestamps: true,
            underscored: true,
        }
    }
}

function configurarLOCAL(){
    return {
        dialect: process.env.LOCAL_DIALECT,
        host: process.env.LOCAL_HOST,
        port: process.env.LOCAL_PORT,
        username: process.env.LOCAL_USER_NAME,
        password: process.env.LOCAL_PASSWORD,
        database: process.env.LOCAL_DATABASE,
        define: {
            timestamps: true,
            underscored: true,
        }
    }
    
}

module.exports = ambiente;
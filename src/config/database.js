let ambiente = undefined

switch (process.env.PUBLICAR) {
	case 'HML':
		ambiente = configurarHML()
		break
	case 'PRD':
		ambiente = configurarPRD()
		break
	default:
		ambiente = configurarLOCAL()
}

function configurarHML() {
	return {
		host: process.env.HML_HOST,
		port: process.env.HML_PORT,
		username: process.env.HML_USER_NAME,
		password: process.env.HML_PASSWORD,
		database: process.env.HML_DATABASE,
	}
}

function configurarPRD() {
	return {
		host: process.env.PRD_HOST,
		port: process.env.PRD_PORT,
		username: process.env.PRD_USER_NAME,
		password: process.env.PRD_PASSWORD,
		database: process.env.PRD_DATABASE,
	}
}

function configurarLOCAL() {
	return {
		host: process.env.LOCAL_HOST,
		port: process.env.LOCAL_PORT,
		username: process.env.LOCAL_USER_NAME,
		password: process.env.LOCAL_PASSWORD,
		database: process.env.LOCAL_DATABASE,
	}
}

module.exports = ambiente

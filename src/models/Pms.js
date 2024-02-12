const { Model, DataTypes } = require('sequelize');

class Pms extends Model{
    static init(connection){
        super.init({
            descricao: DataTypes.STRING,
            codigo: DataTypes.STRING,
            unidade: DataTypes.STRING,
            valor: DataTypes.DOUBLE,
            valorDefault: DataTypes.DOUBLE,
            input: DataTypes.BOOLEAN,
            limiteMax: DataTypes.DOUBLE,
            limiteMin: DataTypes.DOUBLE,
        },{
            sequelize: connection,
            schema: 'public',
            tableName: 'pms',
            createdAt: 'criadoEm',
            updatedAt: 'atualizadoEm',
            timestamps: true,
            underscored: false
        })
    }
}

module.exports = Pms;
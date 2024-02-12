'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('pms', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      unidade: {
        type: Sequelize.STRING,
        allowNull: true
      },
      valor: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      valorDefault: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      limiteMax: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      limiteMin: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      input: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      criadoEm: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      atualizadoEm: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
      }
   });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('pms')
  }
};

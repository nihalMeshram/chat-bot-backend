'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10;

    const users = [
      {
        id: uuidv4(),
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('AdminPass123!', saltRounds),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        fullName: 'Editor User',
        email: 'editor@example.com',
        password: await bcrypt.hash('EditorPass123!', saltRounds),
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        fullName: 'Viewer User',
        email: 'viewer@example.com',
        password: await bcrypt.hash('ViewerPass123!', saltRounds),
        role: 'viewer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'editor@example.com', 'viewer@example.com'],
    });
  }
};

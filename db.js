const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/library_books');


const Book = sequelize.define('book', {
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

const Genre = sequelize.define('genre', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});



module.exports = { 
    sequelize,
    Book,
    Genre
};
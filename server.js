const express = require('express');
const app = express();
const db = require('./db');

const setup = async() => {
    try {
        await db.sequelize.sync({ force: true });
        console.log('connected');
    }
    catch(err) {
        console.log(err)
    }
};

setup();
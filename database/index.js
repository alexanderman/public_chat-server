const { Sequelize, DataTypes } = require('sequelize');
const DATABASE = process.env.DATABASE_NAME || 'public_chat_db';
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306';


let sequelize;

function createSchema() {
    const Table = sequelize.define('messages', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        user: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    /** creates table if not exists */
    return sequelize.sync();
}

function saveMessage({ user, message }) {
    return sequelize.model('messages').create({ user: JSON.stringify(user), message });
}

function fetchLastMessages(count) {
    return sequelize.model('messages').findAll({ 
        limit: count,
        order: [[ 'id', 'DESC' ]]
    })
    .then(recs => {
        console.log('fetched last messages from database');
        /** reorder */
        recs.sort((r1, r2) => r1.id < r2.id ? -1 : 1);
        /** json parse user */
        return recs.map(({ message, user, id }) => ({ id, message, user: JSON.parse(user) }));
    })
}

function ensureDatabase() {
    sequelize = new Sequelize(DATABASE_URL);
    return sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');

        return sequelize.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE};`)
        .then(() => {
            /** close connection and create new connection with database */
            sequelize.close();
            sequelize = new Sequelize(`${DATABASE_URL}/${DATABASE}`);
            return sequelize;
        })
        .catch(console.error);    
    })  
    .catch(err => {
        console.log('Unable to connect to the database:', err);
    });
}


module.exports = function init() {
    return ensureDatabase()
    .then(() => {
        /** create table if not exists */
        return createSchema();
    })
    .then(() => {
        return { saveMessage, fetchLastMessages };
    })
    .catch(console.error);    
}



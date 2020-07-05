const initDatabase = require('../database');
const MAX_COUNT = parseInt(process.env.MESSAGES_CACHE_COUNT || 10, 10);

function createMessagesStore(prevMessages = [], onMessagesAdded) {
    const messagesList = [...prevMessages];

    const addMessages = messages => {
        messagesList.push(...messages);
        if (messagesList.length > MAX_COUNT) {
            messagesList.splice(0, messagesList.length -  MAX_COUNT);
        }

        if (onMessagesAdded) {
            onMessagesAdded(messages);
        }
    }

    const getMessages = () => [...messagesList];

    return { addMessages, getMessages };
}


/** returns promise, when resolved has last messages loaded from db */
function loadStore() {
    let database;

    return initDatabase()
    .then(db => {
        database = db;
        return database.fetchLastMessages(MAX_COUNT);
    })
    .then(messages => {
        
        const onReceiveMessages = messages => { 
            /** store in db */ 
            messages.forEach(m => {
                database.saveMessage(m);
            });
            
            console.log('store in db');
        };

        return createMessagesStore(messages, onReceiveMessages);
    });
}

module.exports = loadStore;

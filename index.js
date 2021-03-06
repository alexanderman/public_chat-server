require('dotenv').config();

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const cors = require('cors');
const loadStore = require('./services/last-messages-store');

app.use(cors());

const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'production';

if (process.env.NODE_ENV === 'development') {
    app.use(require('errorhandler')());
}

loadStore().then(store => {

    io.on('connection', socket => {
        console.log('socket connected');
        socket.on('disconnect', () => {
            console.log('socket disconnected');
        });

        /** send last messages */
        socket.on('get_prev_messages', () => {
            socket.emit('prev_messages', store.getMessages());
        });
                
        socket.on('message', messages => {
            console.log('received ', messages);
            store.addMessages(messages);
            socket.broadcast.emit('message', messages);
        });
    });
    
    http.listen(port, () => {
        console.log(`*${env}* server started at port ${port}`);
    });
    
}).catch(console.error);


app.get('/', (req, res) => {
    res.send('hello server');
});
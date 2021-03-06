const mongoose = require('mongoose');
require('./locations');

// root:example@
const dbURL = 'mongodb://root:example@localhost:27017/Loc8r';
mongoose.connect(dbURL, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURL}`);
})
.on('error', err => {
    console.log(`Mongoose connection error: ${err}`);
})
.on('disconnected', () => {
    console.log(`Mongoose disconnected`);
});

const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close( () => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
    process.exit(0);
    });
});
const mongoose = require('mongoose');
const { Deposit } = require('./server');

const DATABASE_URL = 'mongodb://localhost:27017/';

mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database.');
        cleanDatabase().then(() => mongoose.disconnect());
    })
    .catch((error) => console.error('Error connecting to the database:', error));

const cleanDatabase = async () => {
    try {
        await Deposit.updateMany(
            { method: 'bank-transfer' },
            { $unset: { cryptoDetails: "", digitalWalletDetails: "" } }
        );
        await Deposit.updateMany(
            { method: 'crypto' },
            { $unset: { bankDetails: "", digitalWalletDetails: "" } }
        );
        await Deposit.updateMany(
            { method: 'digital-wallets' },
            { $unset: { bankDetails: "", cryptoDetails: "" } }
        );

        console.log('Database cleaned successfully!');
    } catch (error) {
        console.error('Error cleaning database:', error);
    }
};

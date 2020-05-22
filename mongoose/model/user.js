const mongoose = require('mongoose');
const TableName = require('./tableNames');
const Schema = mongoose.Schema;
const Users = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    userType: {
        type: Number
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model(TableName.userTable, Users);
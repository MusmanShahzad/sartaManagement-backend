const mongoose = require('mongoose');
const TableName = require('./tableNames');
const Schema = mongoose.Schema;
const tenant = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.userTable
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.roomTable
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Boolean
    }
}, {
    timestamps: true
});
module.exports = mongoose.model(TableName.tenantTable, tenant);
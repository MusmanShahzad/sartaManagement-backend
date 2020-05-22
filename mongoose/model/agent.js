const mongoose = require('mongoose');
const TableName = require('./tableNames');
const Schema = mongoose.Schema;
const agent = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.userTable
    },
    buildings: [{
        buildingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableName.buildingTable
        },
        status: {
            type: Boolean,
            default: true
        }
    }],
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
module.exports = mongoose.model(TableName.agentTable, agent);
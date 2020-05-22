const mongoose = require('mongoose');
const TableName = require('./tableNames');

const Schema = mongoose.Schema;
const room = new Schema({
    name: {
        type: String
    },
    address: {
        type: String
    },
    building: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.buildingTable
    },
    ownersId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.ownerTable
    },
    tenantId:{type: mongoose.Schema.Types.ObjectId,
        ref: TableName.tenantTable},
    tenantsHistory: [{
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableName.tenantTable
        },
        joinedDate: {
            type: Date,
            default: Date.now()
        },
        removeDate: {
            type: Date
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
        type: Boolean,
        default:true
    },
    available:{
        type: Boolean,
        default:true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model(TableName.roomTable, room);
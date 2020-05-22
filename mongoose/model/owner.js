const mongoose = require('mongoose');
const TableName = require('./tableNames');
const Schema = mongoose.Schema;
const requestStatus= require('./requestStatus');
const owner = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableName.userTable
    },
    buildings: [{
        building: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableName.buildingTable
        }
    }],
    createdDate: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Boolean
    },
rooms:[
    {
        roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: TableName.roomTable
    }
}]
}, {
    timestamps: true
});
module.exports = mongoose.model(TableName.ownerTable, owner);
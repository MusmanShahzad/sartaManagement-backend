const mongoose = require('mongoose');
const TableName = require('./tableNames');
const requestStatus = require('./requestStatus');
const Schema = mongoose.Schema;
const notification = new Schema({
    booking:{type:String},
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:TableName.userTable
    },
    type:{type:String},
    building:{type:mongoose.Schema.Types.ObjectId,ref:TableName.buildingTable},
    date:{type:Date},
    status:{type:Number,default:requestStatus.pending},
}, {
    timestamps: true
});
module.exports = mongoose.model('booking', notification);
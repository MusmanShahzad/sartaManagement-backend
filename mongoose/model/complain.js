const mongoose = require('mongoose');
const TableName = require('./tableNames');
const requestStatus = require('./requestStatus');
const Schema = mongoose.Schema;
const request = new Schema({
    complain:{type:String},
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:TableName.userTable
    },
    building:{type:mongoose.Schema.Types.ObjectId,ref:TableName.buildingTable},
    roomId:{type:mongoose.Schema.Types.ObjectId,ref:TableName.roomTable},
    createdAt:{type:Date,default:Date.now()},
    status:{type:Number,default:requestStatus.pending}
}, {
    timestamps: true
});
module.exports = mongoose.model('complain', request);
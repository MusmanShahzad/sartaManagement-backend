const mongoose = require('mongoose');
const TableName = require('./tableNames');

const Schema = mongoose.Schema;

const building = new Schema(
    { 
name:{type:String},
address:{type:String},
agentId:{type:mongoose.Schema.Types.ObjectId,ref: TableName.agentTable},
ownersId: { type: mongoose.Schema.Types.ObjectId,ref: TableName.ownerTable},
rooms:[
    {roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: TableName.roomTable}}],
message:[
    {
        userId:{type:mongoose.Schema.Types.ObjectId,ref: TableName.userTable},
        messageType:{type:Number},
        message:{type:String},
        url:{type:String}
}],
status:{type: Boolean,default:true}
}
);
module.exports = mongoose.model(TableName.buildingTable, building);
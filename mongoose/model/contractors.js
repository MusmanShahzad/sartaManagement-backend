const mongoose = require('mongoose');
const TableName = require('./tableNames');
const requestStatus = require('./requestStatus');
const Schema = mongoose.Schema;
const request = new Schema({
userId:{type:mongoose.Schema.Types.ObjectId,ref:TableName.userTable},
name:{type:String},
email:{type:String},
phoneNo:{type:String},
type:{type:String},
price:{type:Number},
}, {
    timestamps: true
});
module.exports = mongoose.model('contractors', request);
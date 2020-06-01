const mongoose = require('mongoose');
const TableName = require('./tableNames');
const requestStatus = require('./requestStatus');
const Schema = mongoose.Schema;
const notification = new Schema({
    notification:{type:String},
    url:{type:String},
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:TableName.userTable
    },
    date:{type:Date,default: Date.now()},
}, {
    timestamps: true
});
module.exports = mongoose.model('notification', notification);
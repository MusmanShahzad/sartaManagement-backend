const User = require('./../mongoose/model/user');
const Owner = require('./../mongoose/model/owner');
const Tenant = require('./../mongoose/model/tenant');
const Agent = require('./../mongoose/model/agent');
const getAllTenants = async()=>{
    return await Tenant.find();
}
const getTenantById = async(id)=>{
    return await Tenant.findById(id);
}
module.exports ={getAllTenants, getTenantById};
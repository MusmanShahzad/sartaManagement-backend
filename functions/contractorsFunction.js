const Contractors = require('../mongoose/model/contractors');
const createContractors = async (name,type,price,email,phoneNo)=>{
    let contract = new Contractors({
        name,type,price,email,phoneNo
    });
    return await contract.save();
}
const getAllContractors = async ()=>{
    return await Contractors.find();
}
module.exports = {createContractors,getAllContractors};
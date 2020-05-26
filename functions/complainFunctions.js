const Complain = require('./../mongoose/model/complain');
const Tenant = require('./../mongoose/model/tenant');
const Owner = require('./../mongoose/model/owner');
const User = require('./../mongoose/model/user');
const Types = require('./../mongoose/model/types');
const createComplain = async (userId, complainText) => {
    let tenant = await Tenant.findOne({
        userId
    }).populate('roomId');
    if (!tenant.roomId) {
        return {
            error: 'unauthorized',
            message: 'must be tenant of room to complain'
        }
    }
    let complain = new Complain({
        userId,
        roomId: tenant.roomId._id,
        building: tenant.roomId.building,
        complain: complainText
    });
    return await complain.save();

}
const getAllComplaints = async (userId) => {
    let user = await User.findById(userId);
    if (!user) {
        console.log({
            error: 'not found',
            message: 'user not found'
        });
        return null;
    }
    if(user.userType=== Types.admin){
        return await Complain.find({}).populate('userId building roomId');
    }
    if (user.userType === Types.tenant) {
        
        return await Complain.find({
            userId
        }).populate('userId building roomId');
    }
    if (user.userType === Types.owner) {
        let owner = await Owner.findOne({
            userId
        }).populate('rooms.roomId buildings');
        let buildings = [];
        owner.rooms.forEach(ele => {
            buildings.push(ele.roomId.building);
        });
        owner.buildings.forEach(ele => {
            if (buildings.find(build => {
                    return build == ele.building
                }) == null) {
                buildings.push(ele.building)
            }
        });
        return await Complain.find({building:{$in: buildings}}).populate('userId building roomId')
    }
    if(user.userType === Types.agent){
        let agent = await Agent.findOne({userId});
        if(!agent){
            console.log({error:'not found',message:'agent not found'})
            return null;
        }
        let buildings=[];
        agent.buildings.forEach(ele => {
            buildings.push(ele.buildingId);
        });
        return await Complain.find({building:{$in: buildings}}).populate('userId building roomId')
    }
    console.log('no type found')

}
module.exports = {getAllComplaints,createComplain};
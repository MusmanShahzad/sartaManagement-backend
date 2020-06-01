const Request = require('../mongoose/model/request');
const RequestStatus = require('../mongoose/model/requestStatus');
const Owner = require('../mongoose/model/owner');
const Tenant = require('../mongoose/model/tenant');
const Agent = require('../mongoose/model/agent');
const Room = require('../mongoose/model/room');
const Building = require('../mongoose/model/building');
const {addTenantToRoom,changeRoomOwner} = require('../functions/roomFunctions');
const {addNewOwnerToBuilding,addAgentToBuilding} = require('../functions/buildingFunction');

const NotificationType = require('../mongoose/model/notificationType');
const getRequestForOwner = async(userId) => {
    let owner =await Owner.findOne({
        userId
    });
    if (!owner) {
        return null;
    }

    // let buildings = owner.buildings.filter((ele) => {
    //     return ele.building;
    // });
    let buildings=[];
    for(let i=0; i<owner.buildings.length; i++) {
        buildings.push(owner.buildings[i].building);
    }
    let rooms=[];
    for(let i=0; i<owner.rooms.length; i++) {
        rooms.push(owner.rooms[i].roomId);
    }
    console.log(rooms)
    // let rooms =  owner.rooms.filter((ele) => {
    //     return ele.roomId;
    // });
    let requests=[];
    requests = requests.concat(await Request.find({
                building: {
                    $in: buildings
                }
            }).populate('userId building roomId'));
            requests= requests.concat( await Request.find(
            {
                roomId: {
                    $in: rooms
                }
            }).populate('userId building roomId'));
            return requests;
}
const getAllRequests = async()=>{
    return await Request.find({});
}
const getRequestOfUser = async (userId)=>{
    return await Request.find({userId: userId})
    .populate('userId building roomId');
}
const createRequest = async (userId, building, roomId, notificationType,url) => {
    console.log(url);
    let temp = [];
    if(roomId){
      temp=  (await Request.find(
            {userId,
            roomId,
            status:RequestStatus.pending
            }));
    }
    if(building){
       temp =  (await Request.find(
            {userId,
            building,
            status:RequestStatus.pending
            }));
    }
    if(temp.length>0) {
        return{error:'duplicate',message:'Request already exists'}
    }
    if (notificationType == NotificationType.tenants) {
        let tenant = await Tenant.findOne({
            userId
        }).populate('userId');
        if (!tenant) {
            return {
                error: 'not found',
                message: 'tenant not found'
            }
        }
        let room = await Room.findById(roomId);
        if (!room) {
            return {
                error: 'not found',
                message: 'room not found'
            }
        }
        if (room.tenantId) {
            if (room.tenantId.toString() == tenant._id.toString()) {
                return {
                    error: 'duplicate',
                    message: 'you are already a tenant of this room'
                }
            }
        }
        return await Request.create({
            notificationType,
            userId,
            notification: `Tenant:${tenant.userId.name} have request to be tenant of your room:${room.name}`,
            roomId,
            url
        });
    } else if (notificationType == NotificationType.owner && roomId) {
        let owner = await Owner.findOne({
            userId
        }).populate('userId');
        if (!owner) {
            return {
                error: 'not found',
                message: 'owner not found'
            }
        }
        let room = await Room.findById(roomId);
        if (!room) {
            return {
                error: 'not found',
                message: 'room not found'
            };
        }
        if (room.ownersId.toString() == owner._id.toString()) {
            return {
                error: 'duplicate',
                message: 'You are already a EcMember of this room'
            }
        }
        return await Request.create({
                notificationType,
                userId,
                roomId,
                notification: `EcMember:${owner.userId.name} have request to become EcMember of your room:${room.name}`
            },
            
        );
    } else if (notificationType == NotificationType.owner && building) {
        let owner = await Owner.findOne({
            userId
        }).populate('userId');
        if (!owner) {
            return {
                error: 'not found',
                message: 'owner not found'
            }
        }
        let buildingData = await Building.findById(building);

        if (!buildingData) {
            return {
                error: 'not found',
                message: 'building not found'
            };
        }
        if (owner._id.toString() == buildingData.ownersId.toString()) {
            return {
                error: 'duplicate',
                message: 'You are already a EcAdmin of building'
            }
        }
        //let request = new Request({notificationType})
        return await Request.create({
            notificationType,
            userId,
            notification: `EcMember:${owner.userId.name} have request to become EcAdmin of your Building:${buildingData.name}`,
            building
        });
    } else if (notificationType == NotificationType.agent) {
        let agent = await Agent.findOne({
            userId
        }).populate('userId');
        if (!agent) {
            return {
                error: 'not found',
                message: 'agent not found'
            }
        }
        let buildingData = await Building.findById(building);

        if (!buildingData) {
            return {
                error: 'not found',
                message: 'building not found'
            };
        }
        if (buildingData.agentId) {
            if (buildingData.agentId.toString() == agent._id.toString()) {
                return {
                    error: 'duplicate',
                    message: 'You are already a Agent of building'
                }
            }
        }
        return await Request.create({
                notificationType,
                userId,
                notification: `Agent:${agent.userId.name} have request to become Agent of your Building:${buildingData.name}`,
                building },
            
        );
    } else {
        return {
            error: 'not found',
            message: 'Request type not supported'
        }
    }

}
const approveRequest = async (requestId,userId)=>{
    
    let request = await Request.findById(requestId);
    if(!request){
        return{error: 'not found',message: 'request not found'}
    }
    if(request.notificationType==NotificationType.tenants){
        let tenant = await Tenant.findOne({
            userId:request.userId
        }).populate('userId');
        if(!tenant){
            return{error: 'not found',message: 'tenant not found'}
        }
        let room = await addTenantToRoom(request.roomId, tenant._id);
        if(room.error){
            return room;
        }
        request.status = RequestStatus.accept;
        return await request.save();
    }
    if(request.notificationType==NotificationType.owner){
        let owner = await Owner.findOne({userId});
    if(!owner){
        return{error:'not found',message:'Owner not found'}
    }
        if(request.roomId){
            let newOwner = await Owner.findOne({userId:request.userId});
            if(!newOwner){
                return{error:'not found',message:'Requesting Owner not found'};
            }
            let room = await changeRoomOwner(request.roomId,newOwner._id,owner._id);
            if(room.error){
                return room;
            }
            request.status = RequestStatus.accept;
            return await request.save();
        }
    }
    if(request.notificationType==NotificationType.owner){
        let owner = await Owner.findOne({userId});
    if(!owner){
        return{error:'not found',message:'Owner not found'}
    }
        if(request.building){
            let newOwner = await Owner.findOne({userId:request.userId});
            if(!newOwner){
                return{error:'not found',message:'Requesting Owner not found'};
            }
           let building = await addNewOwnerToBuilding(newOwner._id,request.building,userId);
           if(building.error){
               return building;
           }
           request.status = RequestStatus.accept;
           return await request.save();
           
        }

    }
    if(request.notificationType==NotificationType.agent){
        if(request.building){
            let agent = await Agent.findOne({userId:request.userId});
            if(!agent){
                return{error:'not found',message:'Requesting Agent not found'};
            }
            let building = await addAgentToBuilding(agent._id,request.building);
            if(building.error){
                return building;
            }
            request.status = RequestStatus.accept;
           return await request.save();
        }
        else{
            return{error:'not found',message:'Requesting building not found'};
        }
    }

}
module.exports = {
    createRequest,
    getRequestForOwner,
    getRequestOfUser,
    approveRequest,
    getAllRequests
};
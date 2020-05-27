const User = require('./../mongoose/model/user');
const Owner = require('./../mongoose/model/owner');
const Tenant = require('./../mongoose/model/tenant');
const Room = require('./../mongoose/model/room');
const Building = require('./../mongoose/model/building');

const addRoom = async (name, address, buildingId, userId) => {
    let owner = (await Owner.findOne({
        userId
    }).select('_id'));
    if (!owner && owner !== null) {
        return {
            error: 'not found',
            message: 'owner not found'
        };
    }
    let building = (await Building.findById(buildingId));
    if (!building && building == null) {
        return {
            error: 'not found',
            message: 'building not found'
        };
    }
    let room = new Room({
        name,
        address,
        building: building._id,
        ownersId: owner._id
    });
    
    room = await room.save();
    if (room !== null && room) {
        building.rooms.push({roomId: room._id});
        building=  await building.save();
        return room;
    } else {
        return {
            error: 'unsuccessfully',
            message: 'error saving room'
        };
    }
}
const getAllRoom = async () => {
    return Room.find({
        status: true
    }).populate('building ownersId tenantId tenants.tenantsId')
    .populate({
        path: "ownersId",
        populate: {
          path: "userId"
        },
    }).populate({
        path: "tenantId",
        populate: {
          path: "userId"
        },
    });
}
const getRoomByID = async (id) => {
    return Room.findById(id)
    .populate('building ownersId tenants.tenantsId').populate({
        path: "building.ownersId",
        populate: {
          path: "userId"
        },
    }).populate({
        path: "building.agentId",
        populate: {
          path: "userId"
        },
    })
    .populate({
        path: "ownersId",
        populate: {
          path: "userId"
        },
    }).populate({
        path: "tenantId",
        populate: {
          path: "userId"
        },
    });
}
const getRoomOfOwner = async (id) => {
    return await Room.find({
        ownersId: id
    }).populate('building ownersId tenantId tenants.tenantsId')
    .populate({
        path: "ownersId",
        populate: {
          path: "userId"
        },
    }).populate({
        path: "tenantId",
        populate: {
          path: "userId"
        },
    });
}
const getRoomOfTenant = async (id) => {
    return await Room.find({
        tenantId: id
    }).populate('building ownersId tenantId tenants.tenantsId')
    .populate({
        path: "ownersId",
        populate: {
          path: "userId"
        },
    }).populate({
        path: "tenantId",
        populate: {
          path: "userId"
        },
    });
}
const addTenantToRoom = async (roomId, tenantId) => {
    let room = await Room.findById(roomId);
    if (!room) {
        return {
            error: 'not found',
            message: 'room not found'
        }
    }

    let tenant = await Tenant.findById(tenantId);
    if (!tenant) {
        return {
            error: 'not found',
            message: 'tenant not found'
        }
    }
    if (tenant.roomId) {
        return {
            error: 'unsuccessfully',
            message: 'already owns a room'
        }
    }
    room.tenantId = tenant._id;
    room.tenantsHistory.push({
        tenantId: tenant._id
    });
    room.available=false;
    room = await room.save();
    tenant.roomId = room._id;
    tenant = await tenant.save();
    return room;
}
const removeTenantFromRoom = async (roomId) => {
    
    let room = await Room.findById(roomId);
    if (!room) {
        return {
            error: 'not found',
            message: 'room not found'
        }
    }
    if (!room.tenantId) {
        return{error:'not found',message:'no tenant found to remove'};
    }
    let tenant = await Tenant.findById(room.tenantId);
    if(!tenant){
        return {error:'not found',message:'tenant not found'};
    }
    room.tenantsHistory.push({
        tenantId: room.tenantId
    });
        room.tenantId = null;
       
        
        console.log(tenant.roomId);
        tenant.roomId = null;
        tenant = await tenant.save();
        room = await room.save();
        return await getRoomByID(room._id);

}
const changeRoomOwner = async (roomId,ownerId,currentOwnerId)=>{
    let room = await Room.findById(roomId);
    if (!room) {
        return {error: 'not found',message:'room not found'}
    }
    let owner = await Owner.findById(ownerId);
    if(!owner){
        return{error: 'not found',message:'owner not found'};
    }
    if(owner._id==room.ownersId){
        return{error: 'duplicate',message:'you are already a owner'};
    }
    let  currentOwner= await Owner.findById(currentOwnerId);
    if(!currentOwner){
        return{error: 'not found',message:'current owner not found'};
    }
    if(room._id==currentOwner._id){
        return{error: 'authentication',message:'you are not a owner'}
    }
    currentOwner= await Owner.findByIdAndUpdate(currentOwnerId,{$pull:{rooms:{roomId}}});
    owner= await Owner.findByIdAndUpdate(ownerId,{$push:{rooms:{roomId}}});
    room.ownersId=owner._id;
    return await room.save();
}

module.exports = {
    addRoom,
    getRoomByID,
    getAllRoom,
    getRoomOfOwner,
    addTenantToRoom,
    removeTenantFromRoom,
    changeRoomOwner,
    getRoomOfTenant
};
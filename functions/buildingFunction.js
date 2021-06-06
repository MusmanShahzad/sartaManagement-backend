const User = require("./../mongoose/model/user");
const Owner = require("./../mongoose/model/owner");
const Tenant = require("./../mongoose/model/tenant");
const Room = require("./../mongoose/model/room");
const Agent = require("./../mongoose/model/agent");
const Building = require("./../mongoose/model/building");

const addBuilding = async (name, address, userId, rooms) => {
  let owner = await Owner.findOne({ userId });
  if (!owner && owner !== null) {
    return { error: "not found", message: "owner not found" };
  }
  let building = new Building({
    name,
    address,
    ownersId: owner._id,
  });
  building = await building.save();
  if (building !== null && building) {
    owner.buildings.push({
      building: building._id,
    });

    owner = await owner.save();
  } else {
    return { error: "unsuccessfully", message: "error saving building" };
  }
  if (rooms && rooms.length) {
    for (let i = 0; i < rooms.length; i++) {
      rooms[i].building = building._id;
      rooms[i].ownersId = owner._id;
    }
    let roomsSave = [];
    roomsSave = await Room.insertMany(rooms);
    rooms = [];
    for (let room of roomsSave) {
      rooms.push({ roomId: room._id });
      if (owner.rooms && owner.rooms.length > 0) {
        owner.rooms.push({ roomId: room._id });
      } else {
        owner.rooms = [];
        owner.rooms.push({ roomId: room._id });
      }
    }
    await owner.save();
  }

  building.rooms = rooms;
  return await building.save();
};
const getAllBuilding = async () => {
  return await Building.find()
    .populate("agentId ownersId tenantId rooms.roomId")
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "tenantId",
      populate: {
        path: "userId",
      },
    });
};
const getAllBuildingOfOwner = async (id) => {
  return await Building.find({ ownersId: id })
    .populate("agentId ownersId tenantId rooms.roomId")
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "tenantId",
      populate: {
        path: "userId",
      },
    });
};
const getAllBuildingOfAgent = async (id) => {
  let agent = await Agent.findOne({ userId: id });
  return await Building.find({ agentId: agent._id })
    .populate("agentId ownersId tenantId rooms.roomId")
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "tenantId",
      populate: {
        path: "userId",
      },
    });
};
const getAllBuildingOfTenant = async (userId) => {
  let tenant = await Tenant.findOne({ userId }).populate("roomId");
  if (!tenant.roomId) {
    return [];
  }
  return [await getBuildingById(tenant.roomId.building)];
};
const getBuildingById = async (id) => {
  return await Building.findById(id)
    .populate(
      "agentId ownersId rooms.roomId message.userId messageOwner.userId"
    )
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "rooms.roomId",
      populate: {
        path: "tenantId",
      },
    })
    .populate({
      path: "rooms.roomId.tenantId",
      populate: {
        path: "userId",
      },
    });
};
const addAgentToBuilding = async (agentId, buildingId) => {
  let building = await getBuildingById(buildingId);
  if (!building) {
    return { error: "not found", message: "building not found" };
  }
  if (building.agentId) {
    return { error: "duplicate", message: "building already got agent" };
  }
  let agent = await Agent.findById(agentId);
  if (!agent) {
    return { error: "not found", message: "agent not found" };
  }
  agent.buildings.push({ buildingId: building._id });
  agent = await agent.save();
  building.agentId = agent._id;
  building = await building.save();
  return await Building.findById(building._id)
    .populate("agentId ownersId")
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    });
};
const addNewOwnerToBuilding = async (ownerId, buildingId, userId) => {
  let building = await getBuildingById(buildingId);
  //checks
  if (!building) {
    return { error: "not found", message: "building not found" };
  }
  let previousOwner = await Owner.findOne({ userId });
  if (!previousOwner) {
    return { error: "not found", message: "previous owner not found" };
  }
  let owner = await Owner.findById(ownerId);
  if (!owner) {
    return { error: "not found", message: "owner not found" };
  }

  if (building.ownersId._id.toString() !== previousOwner._id.toString()) {
    return { error: "unauthorized", message: "you don't own the building" };
  }
  if (building.ownersId.toString() == owner._id.toString()) {
    return { error: "duplicate", message: "building already owned" };
  }
  //data saving
  previousOwner = await Owner.updateOne(
    { _id: previousOwner._id },
    {
      $pull: {
        buildings: { building: buildingId },
      },
    }
  );
  building.ownersId = owner._id;
  building = await building.save();
  owner.buildings.push({ building: building._id });
  owner = await owner.save();
  // await Room.updateMany({building: building._id},{ownerId:owner._id});
  return await Building.findById(building._id)
    .populate("agentId ownersId")
    .populate({
      path: "agentId",
      populate: {
        path: "userId",
      },
    })
    .populate({
      path: "ownersId",
      populate: {
        path: "userId",
      },
    });
};
const updateBuilding = async (buildingId, userId, name, address, rooms) => {
  let building = await Building.findById(buildingId);
  let owner = await Owner.findOne({ userId });
  if (!owner) {
    return { error: "not found", message: "owner not found" };
  }
  if (!building) {
    return { error: "not found", message: "building not found" };
  }
  if (building.ownersId.toString() != owner._id.toString()) {
    return {
      error: "unauthorized",
      message: "you are not allowed to edit building",
    };
  }
  building.name = name;
  building.address = address;
  if (rooms && rooms.length) {
    for (let i = 0; i < rooms.length; i++) {
      rooms[i].building = building._id;
      rooms[i].ownersId = owner._id;
    }

    let roomsSave = [];
    roomsSave = await Room.insertMany(rooms);
    rooms = [];
    for (let room of roomsSave) {
      rooms.push({ roomId: room._id });
    }
  }
  building.rooms.push({ ...rooms });
  await building.save();
  return await getBuildingById(building._id);
};
const removeAgent = async (buildingId) => {
  let building = await Building.findById(buildingId);
  if (!building) {
    return { error: "not found", message: "building not found" };
  }
  if (!building.agentId) {
    return { error: "not found", message: "there is no agent of building" };
  }
  let agent = await Agent.findById(building.agentId);
  if (!agent) {
    return { error: "not found", message: "agent not found" };
  }

  await Agent.findByIdAndUpdate(agent._id, {
    $pull: {
      buildings: {
        buildingId: building._id,
      },
    },
  });
  building.agentId = null;
  return await building.save();
};

module.exports = {
  addBuilding,
  getAllBuilding,
  getAllBuildingOfOwner,
  getBuildingById,
  addAgentToBuilding,
  addNewOwnerToBuilding,
  updateBuilding,
  removeAgent,
  getAllBuildingOfAgent,
  getAllBuildingOfTenant,
};

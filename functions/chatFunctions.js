const Owner = require("./../mongoose/model/owner");
const Room = require("./../mongoose/model/room");
const Building = require("./../mongoose/model/building");
const getBuildingsOwnerChat = async (userId) => {
  let owner = await Owner.findOne({ userId }).populate("rooms.roomId");
  if (!owner) {
    return null;
  }
  let buildings = [];
  owner.rooms.forEach((ele) => {
    buildings.push(ele.roomId.building);
  });

  owner.buildings.forEach((ele) => {
    if (
      buildings.find((build) => {
        return build == ele.building;
      }) == null
    ) {
      buildings.push(ele.building);
    }
  });

  return await Building.find({ _id: { $in: buildings } });
};
const addChatOwner = async (buildingId, message, url, userId) => {
  let building = await Building.findById(buildingId);
  if (!building) {
    return { error: "not found", message: "building not found" };
  }

  return await Building.findByIdAndUpdate(
    building,
    {
      $push: {
        messageOwner: { message, url, userId },
      },
    },
    { new: true }
  ).populate("messageOwner.userId");
};
const addChatAll = async (buildingId, message, url, userId) => {
  let building = await Building.findById(buildingId);
  if (!building) {
    return { error: "not found", message: "building not found" };
  }

  return await Building.findByIdAndUpdate(
    building,
    {
      $push: {
        message: { message, url, userId },
      },
    },
    { new: true }
  ).populate("messageOwner.userId");
};
module.exports = { getBuildingsOwnerChat, addChatOwner, addChatAll };

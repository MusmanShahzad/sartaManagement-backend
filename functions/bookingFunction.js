const Booking = require("./../mongoose/model/booking");
const User = require("./../mongoose/model/user");
const userType = require("./../mongoose/model/types");
const Tenant = require("./../mongoose/model/tenant");
const Owner = require("./../mongoose/model/owner");
const requestStatus = require("./../mongoose/model/requestStatus");

const addBooking = async (userId, date, type, bookingText) => {
  let user = await User.findById(userId);
  if (!user) {
    return { error: "not found", message: "user not found" };
  }
  if (user.userType != userType.tenant) {
    return { error: "not allowed", message: "user is not allowed to book" };
  }
  let tenant = await Tenant.findOne({ userId }).populate("roomId");
  if (!tenant) {
    return { error: "not Found", message: "tenant not found" };
  }
  if (!tenant.roomId) {
    return { error: "not found", message: "you are not tenant of any room" };
  }
  let booking = new Booking({
    userId,
    type,
    date,
    building: tenant.roomId.building,
    userId,
    booking: bookingText,
  });
  return await booking.save();
};
const getBookingsForOwner = async (userId) => {
  let user = await User.findById(userId);
  if (!user) {
    console.log({ error: "not found", message: "user not found" });
    return [];
  }

  let owner = await Owner.findOne({ userId });
  if (!owner) {
    console.log({ error: "not found", message: "owner not found" });
    return [];
  }
  let buildings = [];
  owner.buildings.forEach((ele) => {
    buildings.push(ele.building);
  });
  return await Booking.find({ building: { $in: buildings } }).populate(
    "userId building"
  );
};
const getBookingsForUser = async (userId) => {
  let user = await User.findById(userId);
  if (!user) {
    return { error: "not found", message: "user not found" };
  }

  return await Booking.find({ userId }).populate("userId building");
};
const acceptBooking = async (bookingId) => {
  return await Booking.findByIdAndUpdate(bookingId, {
    status: requestStatus.accept,
  });
};
const rejectBooking = async (bookingId) => {
  return await Booking.findByIdAndUpdate(bookingId, {
    status: requestStatus.reject,
  });
};
module.exports = {
  acceptBooking,
  rejectBooking,
  addBooking,
  getBookingsForOwner,
  getBookingsForUser,
};

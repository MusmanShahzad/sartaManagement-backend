const { gql } = require("apollo-server-express");
module.exports = gql`
  type user {
    _id: ID
    name: String
    email: String
    userType: Int
    createdDate: String
    status: Boolean
  }
  type message {
    userId: user
    messageType: Int
    message: String
    url: String
    date: String
  }
  type request {
    _id: ID
    notification: String
    notificationType: Int
    userId: user
    building: building
    roomId: room
    status: Boolean
  }
  type buildings {
    _id: ID
    buildingId: building
    status: Boolean
  }
  type agent {
    _id: ID
    userId: user
    buildings: [buildings]
    createdDate: String
    status: Boolean
  }
  type tenantsHistory {
    _Id: ID
    tenantsId: tenant
    joinedDate: String
    removeDate: String
    status: Boolean
  }

  type room {
    _id: ID
    name: String
    address: String
    building: building
    ownersId: owner
    tenantId: tenant
    tenantsHistory: [tenantsHistory]
    createdDate: String
    status: Boolean
  }
  type rooms {
    roomId: room
  }
  type tenant {
    _id: ID
    userId: user
    roomId: room
    createdDate: String
    status: Boolean
  }

  type owner {
    _id: ID
    userId: user
    buildings: [buildings]
    rooms: [rooms]
    createdDate: String
    status: Boolean
  }

  type building {
    _id: ID
    name: String
    address: String
    agentId: agent
    ownersId: owner
    status: Boolean
    rooms: [rooms]
    message: [message]
    messageOwner: [message]
  }
  type booking {
    _id: ID
    booking: String
    userId: user
    type: String
    building: building
    date: String
    status: Int
  }
  type Error {
    error: String
    message: String
  }
  type registerData {
    user: user
    token: String
  }
  type registerOutput {
    Errors: [Error]
    Data: registerData
  }
  type addRoomOutput {
    Errors: [Error]
    Data: room
  }
  type addBuildingOutput {
    Errors: [Error]
    Data: building
  }
  type requestOutput {
    Errors: [Error]
    Data: request
  }
  input roomsInput {
    name: String
    address: String
  }
  type complain {
    _id: ID
    complain: String
    userId: user
    building: building
    url: String
    roomId: room
    status: Int
  }
  type complainOutput {
    Errors: [Error]
    Data: complain
  }
  type bookingOutput {
    Errors: [Error]
    Data: booking
  }
  type contractors {
    _id: ID
    userId: user
    name: String
    email: String
    phoneNo: String
    type: String
    price: Int
  }
  type notification {
    notification: String
    url: String
    userId: user
    date: String
  }
  type Mutation {
    singleUpload(file: Upload): String
    ##user mutation
    RegisterUser(
      name: String
      email: String
      password: String
      userType: Int
    ): registerOutput
    LoginUser(email: String, password: String): registerOutput
    ## Room Mutation
    AddRoom(name: String, address: String, buildingId: String): addRoomOutput
    RemoveTenantFromRoom(roomId: String): addRoomOutput
    ## building mutation
    AddBuilding(
      name: String
      address: String
      rooms: [roomsInput]
    ): addBuildingOutput
    UpdateBuilding(
      name: String
      address: String
      rooms: [roomsInput]
      id: ID
    ): addBuildingOutput
    RemoveAgent(buildingId: ID): addBuildingOutput
    CreateRequest(building: ID, roomId: String): requestOutput
    ApproveRequest(requestId: ID): requestOutput
    RejectRequest(requestId: ID): requestOutput
    ##chat mutations
    AddChatOwner(
      buildingId: ID
      message: String
      file: Upload
    ): addBuildingOutput
    AddChatAll(buildingId: ID, message: String, file: Upload): addBuildingOutput
    ##complains mutations
    CreateComplain(complain: String, file: Upload): complainOutput
    AcceptComplain(complainId: ID): complainOutput
    RejectComplain(complainId: ID): complainOutput
    ##status blocking
    UserStatusUpdate(userId: ID): registerOutput
    BuildingStatusUpdate(buildingId: ID): addBuildingOutput
    RoomStatusChange(roomId: ID): addRoomOutput
    ##booking mutation
    AddBooking(date: String, type: String, booking: String): bookingOutput
    BookingStatusAccept(bookingId: ID): bookingOutput
    BookingStatusReject(bookingId: ID): bookingOutput
    CreateContractor(
      name: String
      email: String
      phoneNo: String
      type: String
      price: Int
    ): contractors
    DeleteContractor(id: ID): contractors
    CreateNotification(
      notification: String
      file: Upload
      userIds: [ID]
    ): [notification]
  }
  type Subscription {
    ChatOwnerUpdate(buildingId: ID): building
    ChatAllUpdate(buildingId: ID): building
  }
  type Query {
    getAllUsers: [user]
    getUserById(id: ID): user
    getUser: user
    GetUsersOfOwner: [user]
    ## Room Queries
    GetAllRooms: [room]
    GetRoomById(roomId: ID): room
    getRoomOfOwner: [room]
    ## Building Queries
    GetAllBuilding: [building]
    GetAllBuildingOfOwner(ownerId: ID): [building]
    GetAllBuildingOfAgent(ownerId: ID): [building]
    GetBuildingById(buildingId: ID): building
    ## Request Queries
    GetRequestForOwner: [request]
    GetRequestOfUser: [request]
    ##Chat Queries
    GetViewChats: [building]
    ##Complain Query
    GetAllComplaints: [complain]
    GetAllComplaintsOfOwner: [complain]
    ## Booking Queries
    GetAllBookingsOfUser: [booking]
    ## Contractors Queries
    GetAllContractors: [contractors]
    ##notification queries
    GetAllNotificationsOfUser: [notification]
  }
`;

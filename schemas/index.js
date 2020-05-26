const { gql } = require("apollo-server-express");
module.exports=gql`
type user{
    _id:ID
    name:String
    email:String
    userType:Int
    createdDate:String
    status:Boolean
}
type message{
    userId:user
    messageType:Int
    message:String
    url:String
    date:String
}
type request{
    _id:ID
    notification:String
    notificationType:Int
    userId:user
    building:building
    roomId:room
    status:Boolean
}
type buildings{
    _id:ID
    buildingId:building
    status:Boolean
}
type agent{
    _id:ID
    userId:user
    buildings:[buildings]
    createdDate:String
    status:Boolean
}
type tenantsHistory{
    _Id:ID
    tenantsId:tenant
    joinedDate:String
    removeDate:String
    status:Boolean
}

type room{
    _id:ID
    name:String
    address:String
    building:building
    ownersId:owner
    tenantId:tenant
    tenantsHistory:[tenantsHistory]
    createdDate:String
    status:Boolean
}
type rooms{
    roomId:room
}
type tenant{
    _id:ID
    userId:user
    roomId:room
    createdDate:String
    status:Boolean
}

type owner{
    _id:ID
    userId:user
    buildings:[buildings]
    rooms:[rooms]
    createdDate:String
    status:Boolean
}

type building{
    _id:ID
    name:String
    address:String
    agentId:agent
    ownersId:owner
    status:Boolean
    rooms:[rooms]
    message:[message]
    messageOwner:[message]
}
type Error{
    error:String
    message:String
}
type registerData{
    user:user
    token:String
}
type registerOutput{
    Errors:[Error]
    Data:registerData
}
type addRoomOutput{
    Errors:[Error]
    Data:room
}
type addBuildingOutput{
    Errors:[Error]
    Data:building
}
type requestOutput{
    Errors:[Error]
    Data:request
}
input roomsInput {
    name:String
    address:String
}
type complain{
    complain:String
    userId:user
    building:building
    roomId:room
    status:Boolean
}
type complainOutput{
    Errors:[Error]
    Data:complain
}
type Mutation{
    singleUpload(file:Upload):String
    ##user mutation
    RegisterUser(name:String,email:String,password:String,userType:Int):registerOutput
    LoginUser(email:String,password:String):registerOutput
    ## Room Mutation
    AddRoom(name:String,address:String,buildingId:String):addRoomOutput
    RemoveTenantFromRoom(roomId:String):addRoomOutput
    ## building mutation
    AddBuilding(name:String,address:String,rooms:[roomsInput]):addBuildingOutput
    UpdateBuilding(name:String,address:String,rooms:[roomsInput],id:ID):addBuildingOutput
    RemoveAgent(buildingId:ID):addBuildingOutput
    CreateRequest(building:ID,roomId:String):requestOutput
    ApproveRequest(requestId:ID):requestOutput
    ##chat mutations
    AddChatOwner(buildingId:ID,message:String,url:String):addBuildingOutput
    AddChatAll(buildingId:ID,message:String,url:String):addBuildingOutput
    ##complains mutations
    CreateComplain(complain:String):complainOutput
    UserStatusUpdate(userId:ID):registerOutput
    BuildingStatusUpdate(buildingId:ID):addBuildingOutput
    RoomStatusChange(roomId:ID):addRoomOutput
    }
    type Subscription{
        ChatOwnerUpdate(buildingId:ID):building
        ChatAllUpdate(buildingId:ID):building
    }
type Query{
    getAllUsers:[user]
    getUserById(id:ID):user
    getUser:user
    ## Room Queries
    GetAllRooms:[room]
    GetRoomById(roomId:ID):room
    getRoomOfOwner:[room]
    ## Building Queries
    GetAllBuilding:[building]
    GetAllBuildingOfOwner(ownerId:ID):[building]
    GetAllBuildingOfAgent(ownerId:ID):[building]
    GetBuildingById(buildingId:ID):building
    ## Request Queries
    GetRequestForOwner:[request]
    GetRequestOfUser:[request]
    ##Chat Queries
    GetViewChats:[building]
    ##Complain Query
    GetAllComplaints:[complain]
}
`
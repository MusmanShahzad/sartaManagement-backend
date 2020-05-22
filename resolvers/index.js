const types = require('./../mongoose/model/types');
const {
    getAllRoom,
    getRoomByID,
    addRoom,
    getRoomOfOwner,
    removeTenantFromRoom
} = require('./../functions/roomFunctions');
const {
    CreateUser,
    getAllUsers,
    loginUser,
    getUserById
} = require('./../functions/userFunctions');
const Owner = require('./../mongoose/model/owner');
const {
    createRequest,
    getRequestForOwner,
    getRequestOfUser,
    approveRequest
} = require('./../functions/requestFunction');
const {
    addBuilding,
    getAllBuilding,
    getAllBuildingOfOwner,
    getBuildingById,
    updateBuilding
} = require('./../functions/buildingFunction');
module.exports = {
    Query: {
        getAllUsers: async (parent, args, context) => {
            return await getAllUsers();
        },
        getUserById: async (parent, args, context) => {
            return await getUserById(args.id);
        },
        getUser:async (parent, args, context) => {
            return await getUserById(context.userId);
        },
        //Room Queries
        GetAllRooms: async (parent, args, context) => {
            return getAllRoom();
        },
        GetRoomById: async (parent, args, context) => {
            return getRoomByID(args.roomId);
        },
        //Building Queries
        GetAllBuilding: async (parent, args, context) => {
            return await getAllBuilding();
        },
        GetAllBuildingOfOwner: async (parent, args, context) => {
            if (context.isAuth) {
                if (context.type == 2) {

                    let owner = await Owner.findOne({
                        userId: context.userId
                    });
                    if (!owner) {
                        return null;
                    }
                    return await getAllBuildingOfOwner(owner._id)
                }
            }
            return await getAllBuildingOfOwner(args.ownerId);
        },
        GetBuildingById: async (parent, args, context) => {
            return await getBuildingById(args.buildingId);
        },
        getRoomOfOwner:async (parent, args, context) => {
            if(!context.isAuth){
                return null
            }
            let owner = await Owner.findOne({userId: context.userId});
            if(owner==null){
                return null;
            }
            return await getRoomOfOwner(owner._id);

        },
        //Request Queries
        GetRequestForOwner: async (parent, args, context) => {
            if(!context.isAuth){
                return null;
            }
            return await getRequestForOwner(context.userId);
        },
        GetRequestOfUser: async (parent, args, context) => {
            if(!context.isAuth){
                return null;
            }
            return await getRequestOfUser(context.userId);
        }
    },
    Mutation: {
        singleUpload: async (parent, args, context) => {
            console.log(args);
            return null;
        },
        RegisterUser: async (parent, args, context) => {
            let Errors = [];
            let Data = await CreateUser(args.name, args.email, args.password, args.userType);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors
                }
            }
            if (Errors.length === 0) {
                return {
                    Errors: null,
                    Data
                };
            } else {
                return {
                    Errors
                };
            }
        },
        LoginUser: async (parent, args, context) => {
            let Errors = [];
            let Data = await loginUser(args.email, args.password);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors
                }
            }
            if (Errors.length === 0) {
                return {
                    Errors: null,
                    Data
                };
            } else {
                return {
                    Errors
                };
            }
        },
        // Room mutations
        AddRoom: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (context.type !== types.owner) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated to perform this task'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            let Data = await addRoom(args.name, args.address, args.buildingId, context.userId);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors,
                    Data: null
                };
            }
            return {
                Errors: null,
                Data
            };
        },
        // building mutations
        AddBuilding: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (context.type !== types.owner) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated to perform this task'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            let Data = await addBuilding(args.name, args.address, context.userId, args.rooms);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors,
                    Data: null
                };
            }
            return {
                Errors: null,
                Data
            };
        },
        UpdateBuilding: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (context.type !== types.owner) {
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated to perform this task'
                });
                return {
                    Errors,
                    Data: null
                };
            }

            let Data = await updateBuilding(args.id, context.userId, args.name, args.address, args.rooms);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors,
                    Data: null
                };
            }
            return {
                Errors: null,
                Data
            };
        },
        //request mutations
        CreateRequest: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
               
                Errors.push({
                    error: 'authentication',
                    message: 'not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            let Data = await createRequest(context.userId, args.building, args.roomId, context.type);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors,
                    Data: null
                };
            }
            return {
                Errors: null,
                Data
            };
        },
        ApproveRequest:async (parent, args, context) => {
            let Errors = [];
            let Data =await approveRequest(args.requestId,context.userId);
            if(Data.error){
                Errors.push(Data);
                return{Errors, Data:null};
            }
            return{Errors:null,Data};
        },
        RemoveTenantFromRoom:async (parent, args, context) => {
            if(!context.isAuth){
    
            }
           let Errors=[];
           if(Errors.length==0){
               let Data = await removeTenantFromRoom(args.roomId);
               if(Data.error){
                   Errors.push(Data);
                   return {Errors, Data:null};
               }
               return {Errors:null,Data}
           }
        }
    },
    

    

}
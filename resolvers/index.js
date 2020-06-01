const types = require('./../mongoose/model/types');
const Agent = require('./../mongoose/model/agent');
const User = require('./../mongoose/model/user');
const Building = require('./../mongoose/model/building');
const Room = require('./../mongoose/model/room');
const Complain = require('./../mongoose/model/complain');
const Contractors = require('./../mongoose/model/contractors');
const Notification = require('./../mongoose/model/notifications');
const path = require("path");
const {
    createWriteStream
} = require("fs");
const {
    withFilter,
    PubSub
} = require('graphql-subscriptions');
const pubsub = new PubSub();
const {
    getAllRoom,
    getRoomByID,
    addRoom,
    getRoomOfOwner,
    removeTenantFromRoom,
    getRoomOfTenant
} = require('./../functions/roomFunctions');
const {
    CreateUser,
    getAllUsers,
    loginUser,
    getUserById,
    getUsersOfOwner
} = require('./../functions/userFunctions');
const {
    getAllContractors,
    createContractors
} = require('./../functions/contractorsFunction');
const {
    createComplain,
    getAllComplaints,
    getAllComplaintsOfOwner
} = require('./../functions/complainFunctions');
const Owner = require('./../mongoose/model/owner');
const Tenant = require('./../mongoose/model/tenant');

const {
    createRequest,
    getRequestForOwner,
    getRequestOfUser,
    approveRequest,
    getAllRequests
} = require('./../functions/requestFunction');
const {
    addBuilding,
    getAllBuilding,
    getAllBuildingOfOwner,
    getBuildingById,
    updateBuilding,
    removeAgent,
    getAllBuildingOfAgent,
    getAllBuildingOfTenant
} = require('./../functions/buildingFunction');
const {
    addBooking,
    getBookingsForOwner,
    getBookingsForUser,
    acceptBooking,
    rejectBooking
} = require('./../functions/bookingFunction');
const {
    getBuildingsOwnerChat,
    addChatOwner,
    addChatAll
} = require('./../functions/chatFunctions');
let server = 'https://sartamanagement-backend.herokuapp.com/';
module.exports = {
    Query: {
        getAllUsers: async (parent, args, context) => {
            return await getAllUsers();
        },
        getUserById: async (parent, args, context) => {
            return await getUserById(args.id);
        },
        getUser: async (parent, args, context) => {
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
                if (context.type == types.agent) {

                    let owner = await Agent.findOne({
                        userId: context.userId
                    });
                    if (!owner) {
                        return null;
                    }
                    return await getAllBuildingOfAgent(owner._id)
                }
            }
            return null;
        },
        GetAllBuildingOfAgent: async (parent, args, context) => {
            if (context.isAuth) {

            }
            return null;
        },
        GetBuildingById: async (parent, args, context) => {
            return await getBuildingById(args.buildingId);
        },
        getRoomOfOwner: async (parent, args, context) => {
            if (!context.isAuth) {
                return null
            }
            if (context.type == types.owner) {
                let owner = await Owner.findOne({
                    userId: context.userId
                });
                if (owner == null) {
                    return null;
                }
                return await getRoomOfOwner(owner._id);
            }
            if (context.type == types.tenant) {
                let tenant = await Tenant.findOne({
                    userId: context.userId
                });
                if (tenant == null) {
                    return null;
                }
                return await getRoomOfTenant(tenant._id);
            }
            return null;

        },
        //Request Queries
        GetRequestForOwner: async (parent, args, context) => {
            if (!context.isAuth) {
                return null;
            }
            return await getRequestForOwner(context.userId);
        },
        GetRequestOfUser: async (parent, args, context) => {
            if (!context.isAuth) {
                return null;
            }
            if (context.type == types.tenant || context.type == types.owner) {
                return await getRequestOfUser(context.userId);
            }
            if (context.type == types.admin) {
                return await getAllRequests();
            }
        },
        GetViewChats: async (parent, args, context) => {
            if (context.isAuth) {
                if (context.type === types.owner) {
                    return await getBuildingsOwnerChat(context.userId);
                }
                if (context.type === types.tenant) {
                    return await getAllBuildingOfTenant(context.userId);;
                }
                if (context.type === types.agent) {
                    return await getAllBuildingOfAgent(context.userId);
                }
                if (context.type === types.admin) {
                    return await getAllBuilding();
                }
                return null;

            } else {
                console.log('not authenticated');
                return null;
            }
        },
        //complain queries
        GetAllComplaints: async (parent, args, context) => {
            if (context.isAuth) {
                return await getAllComplaints(context.userId);
            }
            return null;
        },
        GetAllComplaintsOfOwner: async (parent, args, context) => {
            if (context.isAuth) {
                return await getAllComplaintsOfOwner(context.userId);
            }
            console.log('not authorized')
            return null;
        },
        //booking queries
        GetAllBookingsOfUser: async (parent, args, context) => {
            if (context.isAuth) {
                if (context.type == types.tenant) {
                    return await getBookingsForUser(context.userId);
                } else if (context.type == types.owner) {
                    return await getBookingsForOwner(context.userId);
                }
                return [];
            }
            console.log('not authorized');
            return [];
        },
        GetAllContractors: async (parent, args, context) => {
            return getAllContractors();
        },
        GetUsersOfOwner: async (parent, args, context) => {
            if(context.type==types.owner){
            return await getUsersOfOwner(context.userId);
            }
            if(context.type==types.admin){
                return await getAllUsers();
            }
            return [];
        },
        //request queries
        GetAllNotificationsOfUser: async (parent, args, context) => {
            return Notification.find({
                userId: context.userId
            }).populate('userId');
        }



    },
    Mutation: {
        singleUpload: async (parent, args, context) => {
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
        UserStatusUpdate: async (parent, args, context) => {
            let Errors = [];
            if (context.isAuth) {
                if (context.type == 0) {
                    let user = await User.findById(args.userId);
                    if (user) {
                        user.status = !user.status;
                    } else {
                        Errors.push({
                            error: 'not found',
                            message: 'user not found'
                        });
                        return {
                            Errors,
                            Data: null
                        };
                    }
                    return {
                        Errors: null,
                        Data: {
                            user: (await user.save())
                        }
                    };
                }
                Errors.push({
                    error: 'not autorized',
                    message: 'not Admin'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            Errors.push({
                error: 'not auterized',
                message: 'Relogin'
            });
            return {
                Errors,
                Data: null
            };
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
            console.log(args);

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
        BuildingStatusUpdate: async (parent, args, context) => {
            let Errors = [];
            if (context.isAuth) {
                if (context.type == 0) {
                    let building = await Building.findById(args.buildingId);
                    if (building) {
                        building.status = !building.status;
                        return {
                            Errors: null,
                            Data: (await building.save())
                        }
                    } else {
                        Errors.push({
                            error: 'not Found',
                            message: 'building not found'
                        });
                        return {
                            Errors,
                            Data: null
                        };
                    }
                } else {
                    Errors.push({
                        error: 'not authenticated',
                        message: 'retry login'
                    });
                    return {
                        Errors,
                        Data: null
                    };
                }

            } else {
                Errors.push({
                    error: 'not authenticated',
                    message: 'retry login'
                });
                return {
                    Errors,
                    Data: null
                };
            }
        },
        RoomStatusChange: async (parent, args, context) => {
            let Errors = [];
            if (context.isAuth) {
                if (context.type == 0) {
                    let room = await Room.findById(args.roomId);
                    if (room) {
                        room.status = !room.status;
                        return {
                            Errors: null,
                            Data: (await room.save())
                        }
                    } else {
                        Errors.push({
                            error: 'not Found',
                            message: 'room not found'
                        });
                        return {
                            Errors,
                            Data: null
                        };
                    }
                } else {
                    Errors.push({
                        error: 'not authenticated',
                        message: 'retry login'
                    });
                    return {
                        Errors,
                        Data: null
                    };
                }

            } else {
                Errors.push({
                    error: 'not authenticated',
                    message: 'retry login'
                });
                return {
                    Errors,
                    Data: null
                };
            }
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
        ApproveRequest: async (parent, args, context) => {
            let Errors = [];
            let Data = await approveRequest(args.requestId, context.userId);
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
        RemoveTenantFromRoom: async (parent, args, context) => {
            if (!context.isAuth) {

            }
            let Errors = [];
            if (Errors.length == 0) {
                let Data = await removeTenantFromRoom(args.roomId);
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
                }
            }
        },
        RemoveAgent: async (parent, args, context) => {
            let Errors = [];
            let Data = await removeAgent(args.buildingId);
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
        AddChatOwner: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (context.type != types.owner) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (args.file) {
                try {
                    const {
                        createReadStream,
                        filename,
                        mimetype,
                        encoding
                    } = await args.file;
                    _filename = (Math.random() * (9999999 - 1) + 1) + "-" + filename;
                    await new Promise((res) =>
                        createReadStream()
                        .pipe(
                            createWriteStream(
                                path.join(__dirname, "./../uploads", _filename)
                            )
                        )
                        .on("close", res)
                    );
                    // console.log(path.join(__dirname, "./../uploads", _filename))
                    let Data = await addChatOwner(args.buildingId, args.message, (server + "uploads/" + _filename), context.userId);
                    if (Data.error) {
                        Errors.push(Data);
                        return {
                            Errors,
                            Data: null
                        };
                    }
                    pubsub.publish('ChatOwnerUpdate', {
                        ChatOwnerUpdate: Data
                    });
                    return {
                        Errors: null,
                        Data
                    };

                    // 3. Record the file upload in your DB.
                    // const id = await recordFile( … )
                    //return { data:null, error: null };
                } catch (error) {
                    console.log(error)
                    return {
                        Data: null,
                        Errors: {
                            message: 'server error',
                            error: error.message
                        }
                    };
                }
            } else {
                let Data = await createComplain(context.userId, args.complain, null);
                if (Data.error) {
                    Errors.push(Data);
                    return {
                        Errors,
                        Data: null
                    };
                }
                pubsub.publish('ChatOwnerUpdate', {
                    ChatOwnerUpdate: Data
                });
                return {
                    Errors: null,
                    Data
                };
            }

        },
        AddChatAll: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (args.file) {
                try {
                    const {
                        createReadStream,
                        filename,
                        mimetype,
                        encoding
                    } = await args.file;
                    console.log(await args.file);
                    _filename = (Math.random() * (9999999 - 1) + 1) + "-" + filename;
                    await new Promise((res) =>
                        createReadStream()
                        .pipe(
                            createWriteStream(
                                path.join(__dirname, "./../uploads", _filename)
                            )
                        )
                        .on("close", res)
                    );
                    // console.log(path.join(__dirname, "./../uploads", _filename))
                    let Data = await addChatAll(args.buildingId, args.message, (server + "uploads/" + _filename), context.userId);

                    if (Data.error) {
                        Errors.push(Data);
                        return {
                            Errors,
                            Data: null
                        };
                    }
                    pubsub.publish('chatAll', {
                        ChatAllUpdate: Data
                    });

                    return {
                        Errors: null,
                        Data
                    };

                    // 3. Record the file upload in your DB.
                    // const id = await recordFile( … )
                    //return { data:null, error: null };
                } catch (error) {
                    console.log(error)
                    return {
                        Data: null,
                        Errors: [{
                            message: 'server error',
                            error: error.message
                        }]
                    };
                }
            } else {
                let Data = await addChatAll(args.buildingId, args.message, null, context.userId);

                if (Data.error) {
                    Errors.push(Data);
                    return {
                        Errors,
                        Data: null
                    };
                }
                pubsub.publish('chatAll', {
                    ChatAllUpdate: Data
                });

                return {
                    Errors: null,
                    Data
                };
            }
        },
        //complain mutation
        CreateComplain: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            if (context.type != types.tenant) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not Tenant'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            try {
                const {
                    createReadStream,
                    filename,
                    mimetype,
                    encoding
                } = await args.file;
                _filename = (Math.random() * (9999999 - 1) + 1) + "-" + filename;
                await new Promise((res) =>
                    createReadStream()
                    .pipe(
                        createWriteStream(
                            path.join(__dirname, "./../uploads", _filename)
                        )
                    )
                    .on("close", res)
                );
                // console.log(path.join(__dirname, "./../uploads", _filename))
                let Data = await createComplain(context.userId, args.complain, (server + "uploads/" + _filename));
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
                // 3. Record the file upload in your DB.
                // const id = await recordFile( … )
                //return { data:null, error: null };
            } catch (error) {
                return {
                    data: null,
                    error: error.message
                };
            }

        },
        //add booking
        AddBooking: async (parent, args, context) => {
            let Errors = [];
            console.log('here');
            console.log(context)
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                };
            }
            let Data = await addBooking(context.userId, args.date, args.type, args.booking);
            if (Data.error) {
                Errors.push(Data);
                return {
                    Errors,
                    Data: null
                }
            }
            return {
                Errors: null,
                Data
            };
        },
        BookingStatusAccept: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                }
            }
            if (context.type != types.owner) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not owner'
                });
            }
            let Data = await acceptBooking(args.bookingId);
            if (Data.error) {
                return {
                    Errors,
                    Data: null
                }
            }
            return {
                Errors: null,
                Data
            }
        },
        BookingStatusReject: async (parent, args, context) => {
            let Errors = [];
            if (!context.isAuth) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not authenticated'
                });
                return {
                    Errors,
                    Data: null
                }
            }
            if (context.type != types.owner) {
                Errors.push({
                    error: 'not authorized',
                    message: 'you are not owner'
                });
            }
            let Data = await rejectBooking(args.bookingId);
            if (Data.error) {
                return {
                    Errors,
                    Data: null
                }
            }
            return {
                Errors: null,
                Data
            }
        },
        AcceptComplain: async (parent, args, context) => {
            let Data = await Complain.findByIdAndUpdate(args.complainId, {
                status: 1
            });
            return {
                Errors: null,
                Data
            }
        },
        RejectComplain: async (parent, args, context) => {
            let Data = await Complain.findByIdAndUpdate(args.complainId, {
                status: -1
            });
            return {
                Errors: null,
                Data
            }
        },
        //(name:String,email:String,phoneNo:String,type:String,price:Int)
        CreateContractor: async (parent, args, context) => {
            return createContractors(args.name, args.type, args.phoneNo, args.email, args.price);
        },
        CreateNotification: async (parent, args, context) => {

            if (args.file) {
                try {
                    const {
                        createReadStream,
                        filename,
                        mimetype,
                        encoding
                    } = await args.file;
                    console.log(await args.file);
                    _filename = (Math.random() * (9999999 - 1) + 1) + "-" + filename;
                    await new Promise((res) =>
                        createReadStream()
                        .pipe(
                            createWriteStream(
                                path.join(__dirname, "./../uploads", _filename)
                            )
                        )
                        .on("close", res)
                    );
                    let notifications = [];
                    args.userIds.forEach(ele => {
                        notifications.push(new Notification({
                            notification: args.notification,
                            url: (server + "uploads/" + _filename),
                            userId: ele
                        }));
                    });
                    return await Notification.insertMany(notifications);
                } catch (error) {
                    console.log(error)
                    return null
                }
            } else {
                let notifications = [];
                args.userIds.forEach(ele => {
                    notifications.push(new Notification({
                        notification: args.notification,
                        url: (server + "uploads/" + _filename),
                        userId: ele
                    }));
                });
                return await Notification.insertMany(notifications);
            }
        }


    },
    Subscription: {
        ChatOwnerUpdate: {
            subscribe: withFilter(() => pubsub.asyncIterator('ChatOwnerUpdate'), (payload, variables) => {

                return payload.ChatOwnerUpdate._id == variables.buildingId;
            }),
        },
        ChatAllUpdate: {
            subscribe: withFilter(() => pubsub.asyncIterator('chatAll'), (payload, variables) => {
                return payload.ChatAllUpdate._id == variables.buildingId;
            }),
        }
    }



}
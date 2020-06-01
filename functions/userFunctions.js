const User = require('./../mongoose/model/user');
const Owner = require('./../mongoose/model/owner');
const Tenant = require('./../mongoose/model/tenant');
const Agent = require('./../mongoose/model/agent');

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const CreateUser = async (name, email, password, userType) => {
    if(await User.findOne({email})!=null){
        return {error:'Duplicate',message:'email already exists'};
    }
    
    if(userType<0||userType>3){
      return {error:'Invalid',message:'invalid user type'};
    }
    let user = new User({
        name,
        email,
        password:await bcrypt.hash(password, 12),
        userType
    });
    user=await user.save();

    if(user!=null && user){
        const token = jwt.sign(
            { userId: user._id, type:user.userType },
            'process.env.JWT_SECRET',
            {
              expiresIn: "15d",
            }
          );
          
          switch(user.userType){
              case 1:{
                  let temp = new Tenant({
                    userId:user._id  
                });
                  temp=(await temp.save());
                  break;
              }
              case 2:{
                let temp = new Owner({
                  userId:user._id  
              });
              
                await temp.save();
                break;
            }
            case 3:{
                let temp = new Agent({
                  userId:user._id  
              })
                await temp.save();
                break;
            }
          }
          user['token'] = token;
        return {user,token};
    }
    else{
        return {error:'unSuccessfully',message:'error during registration'};
    }
}
const loginUser = async(email,password)=>{

    let user=await User.findOne({email});
    if(user){
        if(await bcrypt.compare(password,user.password)){
            const token = jwt.sign(
                { userId: user._id, type:user.userType },
                'process.env.JWT_SECRET',
                {
                  expiresIn: "15d",
                }
              );
            return { user,token }
        }
        
    }
    
        return { error:'unsucessfull',message:'email or password is incorrect' };
    
}
const getAllUsers=async () => {
    return await User.find();
}
const  getUserById=async (id)=>{
    return await User.findById(id);
}
const getUsersOfOwner= async (userId)=>{
  let owner = await (await Owner.findOne({userId}).populate('rooms.roomId')).populate({
    path: "rooms.roomId",
    populate: {
      path: "tenantId"
    }
  }).populate({
    path: "rooms.roomId",
    populate: {
      path: "ownersId"
    }
  });
  let ownersId=[];
  let tenantsId=[]
   owner.rooms.forEach( room =>{
     
    if(room.roomId.ownersId.toString()!=owner._id.toString()){
      console.log(room.roomId.ownersId,owner._id);
    ownersId.push(room.roomId.ownersId);
    }
    if(room.roomId.tenantId){
      tenantsId.push(room.roomId.tenantId);
    }
  })
  let owners = await Owner.find({_id:{$in:ownersId}});
  let tenants = await Tenant.find({_id:{$in:tenantsId}});
  let userIds=[];
  owners.forEach(ele=>{
    userIds.push(ele.userId)
  })
  tenants.forEach(ele=>{
    userIds.push(ele.userId);
  })
  
  return await User.find({_id:{$in: userIds}});
}
module.exports = {getUsersOfOwner,CreateUser,loginUser,getAllUsers,getUserById}
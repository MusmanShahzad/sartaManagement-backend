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
    return await User.find({status:true});
}
const  getUserById=async (id)=>{
    return await User.findById(id);
}
module.exports = {CreateUser,loginUser,getAllUsers,getUserById}
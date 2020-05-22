const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const resolvers= require('./resolvers/index');
const typeDefs= require('./schemas/index');
const {createRequest} = require('./functions/requestFunction');
const {CreateUser,loginUser} = require('./functions/userFunctions');
const {addBuilding,addNewOwnerToBuilding} = require('./functions/buildingFunction');
const {addRoom,addTenantToRoom} = require('./functions/roomFunctions');

let PORT = 8888;
const Start=async()=>{
    try{
    await mongoose.connect(
        `mongodb+srv://test:test@cluster0-00xdi.mongodb.net/test?retryWrites=true&w=majority`,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useFindAndModify:false
        });
//TEST:

         //console.log(await createRequest('5ebd43c1a4934a5730e5aad9',null,'5ebd7fbe272c07421c32ae16',2))
        //console.log(await addRoom('test','address','5ebd57c0c9df762228acff68','5ebd43c1a4934a5730e5aad9'))
        //console.log(await addBuilding('test','hello here near','5ebd43c1a4934a5730e5aad9'))
        //console.log(await loginUser('email4','password'));
        //console.log(await addNewOwnerToBuilding('5ebe02b04468684d1803eb2e','5ebe0a2e99e47d4c1867e844','5ebd43c1a4934a5730e5aad9'));
       // console.log(await addTenantToRoom('5ebd5964fe3cff55340ce376','5ebe0d55521cd82fc8340c1c'))









const server = new ApolloServer({
    //schema
    typeDefs,
    //resolvers
    resolvers,
    
    introspection: true,
    playground: true,
    context: ({ req, connection }) => {
      if(connection){
        return connection.context;
      } else {

        if (req && req.headers &&req.headers.authtoken) {
          
          let result =jwt.verify((req.headers.authtoken),'process.env.JWT_SECRET') ;
          return { isAuth: true,userId:result.userId,type: result.type };
        }
        return { isAuth: false };
      }
    },
    subscriptions: {
        onConnect: async (connectionParams, webSocket, context) => {
          
            console.log('connect socket')
        },
      onDisconnect: async (webSocket, context) => {
        console.log('Disconnect Socket');
      },
    },
  });
  server.applyMiddleware({
    app,
  });
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
    );
  });
    }
    catch (err){
        console.log(err);
    }
    
}


// console.log(process.env.JWT_SECRET);
    // const token = jwt.sign(
    //     { userId: 'userId', petId: 'petId' },
    //     'process.env.JWT_SECRET',
    //     {
    //       expiresIn: "15d",
    //     }
    //   );
    //   console.log(token);
//       console.log(jwt.verify(token,'process.env.JWT_SECRET'));
Start();


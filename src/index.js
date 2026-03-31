// src/index.js
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const typeDefs          = require('./schema/typeDefs');
const Query             = require('./resolvers/query');
const Mutation          = require('./resolvers/mutation');
const { subscriptionResolvers } = require('./resolvers/subscription');
const typeResolvers      = require('./resolvers/types');
const connectDB          = require('./db/connect');
const { verifyToken }    = require('./auth');

connectDB();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    ...typeResolvers,
    Query,
    Mutation,
    Subscription: subscriptionResolvers,
  },
});

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req?.headers?.authorization?.replace('Bearer ', '');
    const user  = token ? verifyToken(token) : null;
    return { user };
  },
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

async function start() {
  await server.start();
  server.applyMiddleware({ app });
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}
start();
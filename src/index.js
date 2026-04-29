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

function buildAuthContextFromToken(token) {
  if (!token) {
    return { user: null, roles: [], isAdmin: false };
  }

  return verifyToken(token).then(user => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];

    return {
      user,
      roles,
      isAdmin: roles.includes('admin'),
    };
  });
}

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ 
  schema,
  context: async (ctx) => {
    const authHeader = ctx.connectionParams?.authorization;
    const token = authHeader?.replace('Bearer ', '');

    try {
      return await buildAuthContextFromToken(token);
    } catch (err) {
      console.error('WS token verification failed:', err);
      return { user: null, roles: [], isAdmin: false };
    }
  }
}, wsServer);

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    if (req?.body?.operationName === 'IntrospectionQuery') {
      return { user: null, roles: [], isAdmin: false };
    }

    const token = req?.headers?.authorization?.replace('Bearer ', '');

    try {
      return await buildAuthContextFromToken(token);
    } catch (err) {
      console.error("Token verification failed:", err);
      return { user: null, roles: [], isAdmin: false };
    }
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

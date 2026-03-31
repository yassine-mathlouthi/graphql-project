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

const serverCleanup = useServer({ 
  schema,
  context: async (ctx) => {
    const authHeader = ctx.connectionParams?.authorization;
    if (!authHeader) throw new Error("Accès refusé : Authentification WS requise.");
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);
    return { user };
  }
}, wsServer);

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // On autorise la requête locale d'introspection pour que le playground Apollo fonctionne
    if (req?.body?.operationName === 'IntrospectionQuery') return;

    const token = req?.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error("Accès refusé : Vous devez être connecté via Keycloak.");
    }
    
    try {
      const user = await verifyToken(token);
      return { user };
    } catch (err) {
      console.error("Token verification failed:", err);
      throw new Error("Accès refusé : Token Keycloak invalide ou expiré.");
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
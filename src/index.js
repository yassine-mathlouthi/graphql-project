// src/index.js
require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs          = require('./schema/typeDefs');
const Query             = require('./resolvers/query');
const Mutation          = require('./resolvers/mutation');
const { subscriptionResolvers } = require('./resolvers/subscription');
const typeResolvers      = require('./resolvers/types');
const connectDB          = require('./db/connect');
const { verifyToken }    = require('./auth');

connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    ...typeResolvers,
    Query,
    Mutation,
    Subscription: subscriptionResolvers,
  },
  context: ({ req }) => {
    const token = req?.headers?.authorization?.replace('Bearer ', '');
    const user  = token ? verifyToken(token) : null;
    return { user };
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`API ready at ${url}`);
});
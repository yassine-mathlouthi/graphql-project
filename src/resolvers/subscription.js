// src/resolvers/subscription.js
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const subscriptionResolvers = {
  gameAdded: {
    subscribe: () => pubsub.asyncIterator(['GAME_ADDED']),
  },
  reviewAdded: {
    subscribe: (_, { gameId }) => pubsub.asyncIterator([`REVIEW_ADDED_${gameId}`]),
  },
};

module.exports = { subscriptionResolvers, pubsub };
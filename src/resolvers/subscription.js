// src/resolvers/subscription.js
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const subscriptionResolvers = {
  gameAdded: {
    subscribe: () => pubsub.asyncIterableIterator(['GAME_ADDED']),
  },
  gameUpdated: {
    subscribe: () => pubsub.asyncIterableIterator(['GAME_UPDATED']),
  },
  gameDeleted: {
    subscribe: () => pubsub.asyncIterableIterator(['GAME_DELETED']),
  },
  reviewAdded: {
    subscribe: (_, { gameId }) => pubsub.asyncIterableIterator([`REVIEW_ADDED_${gameId}`]),
  },
};

module.exports = { subscriptionResolvers, pubsub };
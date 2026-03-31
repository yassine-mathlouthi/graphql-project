// src/resolvers/mutation.js
const Game   = require('../models/Game');
const Studio = require('../models/Studio');
const Review = require('../models/Review');
const { pubsub } = require('./subscription');

module.exports = {
  addGame: async (_, { title, year, studioId, genres = [] }, { user }) => {
    if (!user) throw new Error('Unauthorized');

    const game = await Game.create({ title, year, studio: studioId, genres });
    await game.populate('studio');

    pubsub.publish('GAME_ADDED', { gameAdded: game });
    return game;
  },

  updateGame: async (_, { id, ...updates }, { user }) => {
    if (!user) throw new Error('Unauthorized');

    return await Game.findByIdAndUpdate(id, updates, { new: true }).populate('studio');
  },

  deleteGame: async (_, { id }, { user }) => {
    if (!user) throw new Error('Unauthorized');

    await Game.findByIdAndDelete(id);
    await Review.deleteMany({ game: id }); // cascade delete reviews
    return true;
  },

  addReview: async (_, { gameId, rating, comment }, { user }) => {
    if (!user) throw new Error('Unauthorized');

    const review = await Review.create({ game: gameId, rating, comment });
    await review.populate('game');

    pubsub.publish(`REVIEW_ADDED_${gameId}`, { reviewAdded: review });
    return review;
  },
};
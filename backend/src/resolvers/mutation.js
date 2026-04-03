const Game   = require('../models/Game');
const Studio = require('../models/Studio');
const Review = require('../models/Review');
const { pubsub } = require('./subscription');

function requireAdmin(isAdmin) {
  if (!isAdmin) {
    throw new Error('Forbidden: admin role is required for this action.');
  }
}

module.exports = {
  addGame: async (_, { title, year, studioId, genres = [], imageUrl }, { isAdmin }) => {
    requireAdmin(isAdmin);

    const game = await Game.create({ title, year, studio: studioId, genres, imageUrl });
    await game.populate('studio');

    pubsub.publish('GAME_ADDED', { gameAdded: game });
    return game;
  },

  updateGame: async (_, { id, ...updates }, { isAdmin }) => {
    requireAdmin(isAdmin);

    const game = await Game.findByIdAndUpdate(id, updates, { returnDocument: 'after' }).populate('studio');
    pubsub.publish('GAME_UPDATED', { gameUpdated: game });
    return game;
  },

  deleteGame: async (_, { id }, { isAdmin }) => {
    requireAdmin(isAdmin);

    await Game.findByIdAndDelete(id);
    await Review.deleteMany({ game: id }); // cascade delete reviews
    
    pubsub.publish('GAME_DELETED', { gameDeleted: id });
    return true;
  },

  addReview: async (_, { gameId, rating, comment }) => {
    const review = await Review.create({ game: gameId, rating, comment });
    await review.populate('game');

    pubsub.publish(`REVIEW_ADDED_${gameId}`, { reviewAdded: review });
    return review;
  },
};

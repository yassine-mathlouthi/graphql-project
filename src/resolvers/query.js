// src/resolvers/query.js
const Game   = require('../models/Game');
const Studio = require('../models/Studio');

module.exports = {
  me: async (_, __, { user }) => {
    return user;
  },

  games: async (_, { page = 1, limit = 10, genre, sortBy = 'title', order = 'asc' }) => {
    const filter = genre ? { genres: genre } : {};
    const sort   = { [sortBy]: order === 'asc' ? 1 : -1 };

    return await Game.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('studio');
  },

  gameCount: async (_, { genre }) => {
    const filter = genre ? { genres: genre } : {};
    return await Game.countDocuments(filter);
  },

  game: async (_, { id }) => {
    return await Game.findById(id).populate('studio');
  },

  studios: async () => {
    return await Studio.find();
  },
};

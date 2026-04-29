module.exports = {
  Game: {
    id: (parent) => parent._id.toString(),
    reviews: async (parent) => {
      const Review = require('../models/Review');
      return await Review.find({ game: parent._id });
    },
  },
  Studio: {
    id: (parent) => parent._id.toString(),
    games: async (parent) => {
      const Game = require('../models/Game');
      return await Game.find({ studio: parent._id });
    },
  },
  Review: {
    id: (parent) => parent._id.toString(),
  },
};

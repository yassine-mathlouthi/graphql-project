// src/resolvers/mutation.js
const Game   = require('../models/Game');
const Studio = require('../models/Studio');
const Review = require('../models/Review');
const User = require('../models/User');
const { pubsub } = require('./subscription');
const { hashPassword, signToken, toSafeUser, verifyPassword } = require('../auth');

function requireAdmin(isAdmin) {
  if (!isAdmin) {
    throw new Error('Forbidden: admin role is required for this action.');
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
}

module.exports = {
  register: async (_, { username, email, password, adminCode }) => {
    const trimmedUsername = username.trim();
    const normalizedEmail = normalizeEmail(email);

    if (trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }

    validatePassword(password);

    const [existingUser, isFirstUser] = await Promise.all([
      User.findOne({
        $or: [{ email: normalizedEmail }, { username: trimmedUsername }],
      }),
      User.estimatedDocumentCount().then(count => count === 0),
    ]);

    if (existingUser) {
      throw new Error('An account with this email or username already exists.');
    }

    const { passwordHash, passwordSalt } = hashPassword(password);
    const adminInviteCode = process.env.ADMIN_INVITE_CODE;
    const shouldGrantAdmin =
      isFirstUser || (adminInviteCode && adminCode && adminCode === adminInviteCode);

    const user = await User.create({
      username: trimmedUsername,
      email: normalizedEmail,
      passwordHash,
      passwordSalt,
      roles: shouldGrantAdmin ? ['admin'] : [],
    });

    return {
      token: signToken(user),
      user: toSafeUser(user),
    };
  },

  login: async (_, { email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new Error('Invalid email or password.');
    }

    return {
      token: signToken(user),
      user: toSafeUser(user),
    };
  },

  addGame: async (_, { title, year, studioId, genres = [], imageUrl }, { isAdmin }) => {
    requireAdmin(isAdmin);

    const game = await Game.create({ title, year, studio: studioId, genres, imageUrl });
    await game.populate('studio');

    pubsub.publish('GAME_ADDED', { gameAdded: game });
    return game;
  },

  updateGame: async (_, { id, ...updates }, { isAdmin }) => {
    requireAdmin(isAdmin);

    const game = await Game.findByIdAndUpdate(id, updates, { new: true }).populate('studio');
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
    if (rating < 1 || rating > 10) {
      throw new Error('Rating must be between 1 and 10.');
    }

    const review = await Review.create({ game: gameId, rating, comment });
    await review.populate('game');

    pubsub.publish(`REVIEW_ADDED_${gameId}`, { reviewAdded: review });
    return review;
  },
};

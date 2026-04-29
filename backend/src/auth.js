<<<<<<< HEAD:src/auth.js
const crypto = require('crypto');
=======
>>>>>>> 0a47ef5249ad467dca169664e5f4f256d4afc8a9:backend/src/auth.js
const jwt = require('jsonwebtoken');

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'atlas-dev-secret-change-me';
const TOKEN_EXPIRY = '7d';
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = 'sha512';

function createPasswordSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt = createPasswordSalt()) {
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST)
    .toString('hex');

  return { passwordHash, passwordSalt: salt };
}

function verifyPassword(password, passwordSalt, passwordHash) {
  const attemptedHash = crypto
    .pbkdf2Sync(password, passwordSalt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST)
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(attemptedHash, 'hex'), Buffer.from(passwordHash, 'hex'));
}

function toSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles : [],
    isAdmin: Array.isArray(user.roles) && user.roles.includes('admin'),
  };
}

function signToken(user) {
  const safeUser = toSafeUser(user);

  return jwt.sign(
    {
      id: safeUser.id,
      sub: safeUser.id,
      username: safeUser.username,
      email: safeUser.email,
      roles: safeUser.roles,
    },
    AUTH_JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  return Promise.resolve(jwt.verify(token, AUTH_JWT_SECRET));
}

<<<<<<< HEAD:src/auth.js
module.exports = {
  hashPassword,
  signToken,
  toSafeUser,
  verifyPassword,
  verifyToken,
};
=======
module.exports = { verifyToken };
>>>>>>> 0a47ef5249ad467dca169664e5f4f256d4afc8a9:backend/src/auth.js

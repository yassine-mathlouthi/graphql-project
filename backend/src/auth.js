const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Correspond au Realm que vous avez créé dans Keycloak
const KEYCLOAK_ISSUER = 'http://localhost:8080/realms/graphql-realm';

const client = jwksClient({
  jwksUri: `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err, null);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      { algorithms: ['RS256'], issuer: KEYCLOAK_ISSUER },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}

module.exports = { verifyToken };

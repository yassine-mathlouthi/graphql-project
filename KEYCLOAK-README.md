# Guide d'Intégration Keycloak avec React & Apollo Server

Ce guide vous explique étape par étape comment configurer l'authentification OAuth2/OIDC avec **Keycloak** pour votre application React (avec Vite) et votre API GraphQL (Apollo Server).

## 1. Démarrer Keycloak via Docker

La méthode la plus simple pour exécuter Keycloak en développement est d'utiliser Docker. Ouvrez un terminal et exécutez :

```bash
docker run -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.2.4 start-dev
```

Cela va lancer le serveur d'identité Keycloak, accessible sur le port 8080.

## 2. Configurer le Royaume (Realm) et le Client dans Keycloak

1.  Ouvrez votre navigateur et allez sur **http://localhost:8080/**.
2.  Cliquez sur **Administration Console**.
3.  Connectez-vous avec les identifiants définis dans la commande Docker (`admin` / `admin`).

### Créer le Realm
1.  Dans le coin supérieur gauche, survolez le texte `master` (qui est le *realm* par défaut).
2.  Cliquez sur le bouton **Create Realm**.
3.  Dans le champ **Realm name**, tapez exactement `graphql-realm`.
4.  Cliquez sur **Create**.

### Créer le Client (pour React)
1.  Assurez-vous d'être dans le `graphql-realm` (vérifiez en haut à gauche).
2.  Dans le menu de gauche, cliquez sur **Clients**.
3.  Cliquez sur **Create client**.
4.  Dans **Client ID**, tapez exactement `react-client`. Cliquez sur **Next** jusqu'à l'écran *Login settings*.
5.  Sous **Login settings**, configurez :
    *   **Valid redirect URIs** : `http://localhost:5174/*` (Remplacez `5174` par le port utilisé par votre projet Vite, ajoutez bien le `/*` à la fin).
    *   **Web origins** : `*` (pour autoriser le CORS en développement).
6.  Cliquez sur **Save**.

### Créer un Utilisateur de Test
1.  Dans le menu de gauche, cliquez sur **Users**, puis **Add user**.
2.  Remplissez un **Username** (ex: `yassine`) et cliquez sur **Create**.
3.  Allez dans l'onglet **Credentials** de cet utilisateur fraîchement créé.
4.  Cliquez sur **Set password**.
5.  Saisissez un mot de passe.
6.  **TRÈS IMPORTANT** : Décochez la case **Temporary** (sinon il demandera de changer le mot de passe à la première connexion).
7.  Cliquez sur **Save**, puis **Save password**.

---

## 3. Configuration du Backend (Node.js + Apollo Server)

Le backend doit être capable de déchiffrer le token JWT envoyé par Keycloak en utilisant les clés publiques fournies par ce dernier.

### Installation
Installez le package pour récupérer dynamiquement les clés de signature :
```bash
npm install jwks-rsa jsonwebtoken
```

### Le fichier d'authentification (`backend/src/auth.js`)
Voici le script qui interroge Keycloak pour valider la signature du Token :

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Correspond à l'URL et au Realm configuré dans Keycloak
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
```

### Sécuriser les appels (`backend/src/index.js`)
Dans votre ApolloServer, utilisez le contexte (`context`) pour bloquer toute requête HTTP ou WebSocket qui ne possède pas de `Bearer Token` valide.

```javascript
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // Autorise l'introspection pour le fonctionnement de l'UI Apollo Sandbox
    if (req?.body?.operationName === 'IntrospectionQuery') return;

    const token = req?.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error("Access denied: Please authenticate via Keycloak.");
    }
    
    try {
      const user = await verifyToken(token);
      return { user };
    } catch (err) {
      throw new Error("Access denied: Keycloak token is missing, invalid or expired.");
    }
  },
});
```

---

## 4. Configuration du Frontend (React + Vite)

L'application React doit intercepter l'utilisateur au chargement, l'envoyer sur la page de connexion Keycloak (si non authentifié), récupérer le Token, et l'injecter dans chaque requête Apollo.

### Installation
Allez dans le répertoire frontend et installez le client Keycloak :
```bash
cd frontend
npm install keycloak-js
```

### Le fichier Keycloak (`frontend/src/keycloak.js`)
Créez une instance de client :
```javascript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'graphql-realm',
  clientId: 'react-client',
});

export default keycloak;
```

### Intercepter l'application (`frontend/src/main.jsx`)
Ne rendez l'application `<App />` que lorsque l'utilisateur s'est connecté.

```javascript
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import keycloak from './keycloak';
import App from './App.jsx';

function KeycloakProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const isRun = useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(auth => setAuthenticated(auth))
      .catch(console.error);
  }, []);

  if (!authenticated) return <div>Redirection vers l'authentification...</div>;

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KeycloakProvider>
      <App />
    </KeycloakProvider>
  </React.StrictMode>,
);
```

### Injection du Token (Apollo Client)
Mettez à jour `frontend/src/apollo/client.jsx` pour inclure le token.

```javascript
import { setContext } from '@apollo/client/link/context';
import keycloak from '../keycloak';

const authLink = setContext(async (_, { headers }) => {
  if (keycloak.token) {
    await keycloak.updateToken(30).catch(() => keycloak.login());
  }
  return {
    headers: {
      ...headers,
      authorization: keycloak.token ? `Bearer ${keycloak.token}` : '',
    },
  };
});
```

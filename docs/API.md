# Documentation API GraphQL

## Base URL
- HTTP: http://localhost:4000/graphql
- WebSocket: ws://localhost:4000/graphql

## Authentification
Le backend lit le token dans le header HTTP `Authorization`.

Format attendu:

```http
Authorization: Bearer <token>
```

Rappel:
- Les mutations d'administration exigent le role `admin`.
- Les tokens sont verifies via Keycloak dans backend/src/auth.js.

## Types

### Game
| Champ | Type | Description |
|---|---|---|
| id | ID! | Identifiant du jeu |
| title | String! | Titre |
| year | Int! | Annee de sortie |
| genres | [String!]! | Liste des genres |
| imageUrl | String | URL d'illustration |
| studio | Studio! | Studio associe |
| reviews | [Review!]! | Avis associes |

### Studio
| Champ | Type | Description |
|---|---|---|
| id | ID! | Identifiant du studio |
| name | String! | Nom du studio |
| games | [Game!]! | Jeux publies |

### Review
| Champ | Type | Description |
|---|---|---|
| id | ID! | Identifiant de l'avis |
| rating | Int! | Note de 1 a 10 |
| comment | String! | Commentaire |
| game | Game! | Jeu concerne |

## Queries

### games
Signature:

```graphql
games(page: Int, limit: Int, genre: String, sortBy: String, order: String): [Game!]!
```

Comportement:
- Pagination avec `page` et `limit`.
- Filtre optionnel par `genre`.
- Tri dynamique avec `sortBy` et `order` (`asc` ou `desc`).

Exemple:

```graphql
query GetGames($page: Int, $limit: Int, $genre: String, $sortBy: String, $order: String) {
  games(page: $page, limit: $limit, genre: $genre, sortBy: $sortBy, order: $order) {
    id
    title
    year
    genres
    studio {
      id
      name
    }
  }
}
```

Variables:

```json
{
  "page": 1,
  "limit": 10,
  "genre": null,
  "sortBy": "title",
  "order": "asc"
}
```

### gameCount
Signature:

```graphql
gameCount(genre: String): Int!
```

Exemple:

```graphql
query CountGames($genre: String) {
  gameCount(genre: $genre)
}
```

### game
Signature:

```graphql
game(id: ID!): Game
```

Exemple:

```graphql
query GetGame($id: ID!) {
  game(id: $id) {
    id
    title
    year
    genres
    imageUrl
    studio {
      id
      name
    }
    reviews {
      id
      rating
      comment
    }
  }
}
```

### studios
Signature:

```graphql
studios: [Studio!]!
```

Exemple:

```graphql
query GetStudios {
  studios {
    id
    name
  }
}
```

## Mutations

### addGame
Signature:

```graphql
addGame(title: String!, year: Int!, studioId: ID!, genres: [String!], imageUrl: String): Game!
```

Autorisation:
- Role `admin` requis.

Exemple:

```graphql
mutation AddGame($title: String!, $year: Int!, $studioId: ID!, $genres: [String!], $imageUrl: String) {
  addGame(title: $title, year: $year, studioId: $studioId, genres: $genres, imageUrl: $imageUrl) {
    id
    title
    year
  }
}
```

Variables:

```json
{
  "title": "Example Game",
  "year": 2024,
  "studioId": "<studio-id>",
  "genres": ["Action", "Adventure"],
  "imageUrl": "https://example.com/game.jpg"
}
```

### updateGame
Signature:

```graphql
updateGame(id: ID!, title: String, year: Int): Game!
```

Autorisation:
- Role `admin` requis.

Exemple:

```graphql
mutation UpdateGame($id: ID!, $title: String, $year: Int) {
  updateGame(id: $id, title: $title, year: $year) {
    id
    title
    year
  }
}
```

### deleteGame
Signature:

```graphql
deleteGame(id: ID!): Boolean!
```

Autorisation:
- Role `admin` requis.

Effet:
- Supprime aussi les reviews liees au jeu.

Exemple:

```graphql
mutation DeleteGame($id: ID!) {
  deleteGame(id: $id)
}
```

### addReview
Signature:

```graphql
addReview(gameId: ID!, rating: Int!, comment: String!): Review!
```

Exemple:

```graphql
mutation AddReview($gameId: ID!, $rating: Int!, $comment: String!) {
  addReview(gameId: $gameId, rating: $rating, comment: $comment) {
    id
    rating
    comment
    game {
      id
      title
    }
  }
}
```

## Subscriptions

### gameAdded
Signature:

```graphql
subscription OnGameAdded {
  gameAdded {
    id
    title
    year
  }
}
```

### gameUpdated
Signature:

```graphql
subscription OnGameUpdated {
  gameUpdated {
    id
    title
    year
  }
}
```

### gameDeleted
Signature:

```graphql
subscription OnGameDeleted {
  gameDeleted
}
```

### reviewAdded
Signature:

```graphql
subscription OnReviewAdded($gameId: ID!) {
  reviewAdded(gameId: $gameId) {
    id
    rating
    comment
    game {
      id
    }
  }
}
```

## Erreurs frequentes
- `Forbidden: admin role is required for this action.`: token valide mais sans role admin.
- `Token verification failed`: token absent, invalide, ou expire.
- `MongoDB connection error`: valeur `MONGO_URI` invalide ou base indisponible.

## Reference implementation
- Schema: backend/src/schema/typeDefs.js
- Queries: backend/src/resolvers/query.js
- Mutations: backend/src/resolvers/mutation.js
- Subscriptions: backend/src/resolvers/subscription.js
- Auth: backend/src/auth.js

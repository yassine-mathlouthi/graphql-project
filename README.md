# graphql-project

This repository is a small GraphQL server implementation using Apollo Server and MongoDB. It includes implemented models, schema, resolvers, a seed script, and simple JWT-based auth helpers.

API documentation:
- `docs/API.md`
- `docs/api-reference.html`

<img width="1440" height="1312" alt="image" src="https://github.com/user-attachments/assets/0c7c135b-1d9e-4488-adb5-15fe5ee2c2ad" />


Project highlights
- `backend/src/index.js` — application entry. Loads environment variables (`dotenv`), connects to MongoDB, and starts Apollo Server.
- `backend/src/db/connect.js` — MongoDB connection helper using `mongoose` and `process.env.MONGO_URI`.
- `backend/src/seed.js` — script that seeds studios, games, and reviews into the database.
- `backend/src/auth.js` — `generateToken` / `verifyToken` using `JWT_SECRET` from `.env`.
- `backend/src/models/` — Mongoose models: `Game.js`, `Studio.js`, `Review.js`.
- `backend/src/schema/typeDefs.js` — GraphQL type definitions.
- `backend/src/resolvers/` — resolvers for `Query`, `Mutation`, `Subscription`, and type resolvers (`types.js`).

Prerequisites
- Node.js (v16+ recommended)
- A running MongoDB instance (local or remote)

Setup
1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Ensure the backend `.env` file at `backend/.env` contains:

```text
MONGO_URI=mongodb://localhost:27017/graphql_project
JWT_SECRET=your_jwt_secret_here
```

Seeding the database
Run the seed script to populate sample `studios`, `games`, and `reviews`:

```powershell
cd backend
npm run seed
```

You should see output similar to:

```
✅ Seeded:
   8 studios
   24 games
   35 reviews
```

Starting the server
Start the GraphQL server with:

```powershell
cd backend
npm run dev
```

Expected output when successful:

```
MongoDB connected
API ready at http://localhost:4000/
```

Authentication
- `backend/src/auth.js` exposes `generateToken(user)` and `verifyToken(token)`. `backend/src/index.js` uses `verifyToken` in the Apollo `context` to populate `context.user` from the `Authorization: Bearer <token>` header. Most mutations check `context.user` and will throw `Unauthorized` if missing.

Examples (use GraphQL playground)

Query: list games (pagination, sort and optional genre filter)

```graphql
query GetGames($page: Int, $limit: Int, $genre: String) {
  games(page: $page, limit: $limit, genre: $genre) {
    id
    title
    year
    genres
    studio { id name }
    reviews { id rating comment }
  }
}

# variables
{
  "page": 1,
  "limit": 10,
  "genre": null
}
```

Mutation: add a game (requires Authorization header)

```graphql
mutation AddGame($title: String!, $year: Int!, $studioId: ID!, $genres: [String!]) {
  addGame(title: $title, year: $year, studioId: $studioId, genres: $genres) {
    id
    title
  }
}

# variables
{
  "title": "Example Game",
  "year": 2024,
  "studioId": "<studio-id>",
  "genres": ["Action"]
}
```

When calling protected mutations, add a header:

```
Authorization: Bearer <JWT_TOKEN>
```

Subscriptions
- `gameAdded` and `reviewAdded(gameId: ID!)` are available. The project uses an in-process `PubSub` (`graphql-subscriptions`) so subscriptions work when the server process is running.



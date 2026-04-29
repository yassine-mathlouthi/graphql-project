# GraphQL Project - Full Architecture and Code Documentation

This repository is a full-stack GraphQL application with:

- A Node.js backend using Apollo Server, MongoDB, and first-party JWT auth
- A React frontend using Vite, Apollo Client, and GraphQL subscriptions
- Role-aware behavior with admin-gated mutations
- Real-time notifications over WebSockets

This document follows a Diataxis-style structure:

- Tutorial: quick start to run the full system
- How-to guides: task-focused operations
- Reference: architecture, files, and API
- Explanation: design decisions and tradeoffs

---

## Table of Contents

1. [Project at a Glance](#project-at-a-glance)
2. [Tutorial: Run the Full Stack Locally](#tutorial-run-the-full-stack-locally)
3. [How-to Guides](#how-to-guides)
4. [Reference: Architecture and Source Code](#reference-architecture-and-source-code)
5. [Reference: GraphQL API](#reference-graphql-api)
6. [Reference: Environment Variables](#reference-environment-variables)
7. [Explanation: Core Concepts and Decisions](#explanation-core-concepts-and-decisions)
8. [Troubleshooting](#troubleshooting)
9. [Known Gaps and Improvement Opportunities](#known-gaps-and-improvement-opportunities)

---

## Project at a Glance

### Functional domain

The app manages a catalog of games, their studios, and user reviews.

- `Studio` owns many `Game`
- `Game` belongs to one `Studio`
- `Game` has many `Review`
- `Review` belongs to one `Game`

### High-level runtime flow

1. The frontend sends GraphQL queries and mutations over HTTP.
2. The frontend opens a GraphQL WebSocket connection for subscriptions.
3. The backend validates locally signed JWTs for authenticated requests.
4. Resolvers execute Mongoose reads and writes.
5. The backend publishes in-memory subscription events.
6. The frontend receives live events and displays notifications.

---

## Tutorial: Run the Full Stack Locally

### Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB instance

### 1) Install dependencies

From the project root:

```bash
cd ../frontend
npm install
```

2. Ensure the `.env` file at the project root contains:

```env
MONGO_URI=mongodb://localhost:27017/graphql_project
AUTH_JWT_SECRET=replace-this-in-real-environments
ADMIN_INVITE_CODE=atlas-admin
```

Notes:

- `AUTH_JWT_SECRET` is used to sign and verify app-issued JWTs.
- `ADMIN_INVITE_CODE` is optional. The first registered account becomes admin automatically even without it.

### 3) Configure frontend environment

Create `frontend/.env`:

```powershell
node src/seed.js
```

Expected seed output:

```text
Seeded:
8 studios
21 games
35 reviews
```

### 5) Start the backend

From the project root:

```powershell
node src/index.js
```

Expected logs:

```text
MongoDB connected
API ready at http://localhost:4000/
```

Authentication
- `src/auth.js` exposes `generateToken(user)` and `verifyToken(token)`. `src/index.js` uses `verifyToken` in the Apollo `context` to populate `context.user` from the `Authorization: Bearer <token>` header. Most mutations check `context.user` and will throw `Unauthorized` if missing.

Examples (use GraphQL playground)

Query: list games (pagination, sort and optional genre filter)

```graphql
type Game {
  id: ID!
  title: String!
  year: Int!
  genres: [String!]!
  imageUrl: String
  studio: Studio!
  reviews: [Review!]!
}

type Studio {
  id: ID!
  name: String!
  games: [Game!]!
}

type Review {
  id: ID!
  rating: Int!
  comment: String!
  game: Game!
}

type AuthUser {
  id: ID!
  username: String!
  email: String!
  roles: [String!]!
  isAdmin: Boolean!
}

type AuthPayload {
  token: String!
  user: AuthUser!
}
```

### Queries

```graphql
me: AuthUser
games(page: Int, limit: Int, genre: String, sortBy: String, order: String): [Game!]!
gameCount(genre: String): Int!
game(id: ID!): Game
studios: [Studio!]!
```

### Mutations

```graphql
register(username: String!, email: String!, password: String!, adminCode: String): AuthPayload!
login(email: String!, password: String!): AuthPayload!
addGame(title: String!, year: Int!, studioId: ID!, genres: [String!], imageUrl: String): Game!
updateGame(id: ID!, title: String, year: Int): Game!
deleteGame(id: ID!): Boolean!
addReview(gameId: ID!, rating: Int!, comment: String!): Review!
```

### Subscriptions

```graphql
gameAdded: Game!
gameUpdated: Game!
gameDeleted: ID!
reviewAdded(gameId: ID!): Review!
```

### Authorization model

- Public queries are available without authentication.
- `register` and `login` are public.
- `addGame`, `updateGame`, and `deleteGame` require the `admin` role.
- `addReview` is public.

---

## Reference: Environment Variables

### Backend

- `MONGO_URI` required MongoDB connection string
- `AUTH_JWT_SECRET` required for real deployments
- `ADMIN_INVITE_CODE` optional invite code for additional admin registration

### Frontend

- `VITE_GRAPHQL_HTTP_URL` required GraphQL HTTP endpoint
- `VITE_GRAPHQL_WS_URL` optional GraphQL WebSocket endpoint

---

## Explanation: Core Concepts and Decisions

### Why first-party JWT auth here?

This project now owns a small built-in auth flow because it is simpler to run locally and easier to understand in a learning or demo environment. The backend issues its own JWTs and verifies them with a shared secret.

### Why PBKDF2 instead of an external hashing package?

Node provides `crypto.pbkdf2Sync`, which keeps the auth service lightweight and avoids extra dependency complexity for this project.

### Why keep admin as a role on the token?

Admin-gated mutations already depend on role-based checks. Embedding roles directly into the signed payload keeps resolver authorization straightforward.

### Why make the first account admin?

It reduces setup friction in local development. A fresh clone can be started and administered without a separate provisioning step.

### Why keep anonymous reviews?

The product already allowed public review submission. Keeping that flow preserves the current product behavior while still locking management actions behind admin access.

### Why in-memory PubSub?

It is enough for local development and single-instance deployments. For horizontal scaling, replace it with a shared pub/sub transport such as Redis, NATS, or Kafka.

---

## Troubleshooting

### Backend fails to connect to MongoDB

- Check `MONGO_URI`
- Confirm MongoDB is running
- Verify credentials and network access

### Login or registration fails

- Confirm the backend is running
- Check that `AUTH_JWT_SECRET` is configured
- Verify the email is unique on registration
- Verify the password is at least 8 characters

### Admin actions are blocked

- Make sure the account is the first registered user, or
- Register with the correct `ADMIN_INVITE_CODE`

### Subscriptions are not receiving events

- Verify `VITE_GRAPHQL_WS_URL`
- Confirm the WebSocket server started on `/graphql`
- Check browser console and network frames

---

## Known Gaps and Improvement Opportunities

1. Root `package.json` and lockfiles should be refreshed after dependency cleanup.
2. `updateGame` should guard against not-found ids before publishing updates.
3. `addReview` can validate that the target game exists before insert.
4. Sort fields could be allowlisted more strictly in the resolver.
5. The current auth flow is appropriate for local and demo use, but production should add refresh-token strategy, email verification, password reset, and stronger session management.

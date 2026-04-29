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
npm install
```

From the frontend folder:

```bash
cd frontend
npm install
```

### 2) Configure backend environment

Create a root `.env` file with at least:

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

```env
VITE_GRAPHQL_HTTP_URL=http://localhost:4000/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:4000/graphql
```

### 4) Seed data

From the project root:

```bash
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

```bash
node src/index.js
```

Expected logs:

```text
MongoDB connected
Server ready at http://localhost:4000/graphql
Subscriptions ready at ws://localhost:4000/graphql
```

### 6) Start the frontend

From the `frontend` folder:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### 7) Create your first account

Open the session menu in the header and register a user.

- The first registered account is promoted to `admin`.
- Later accounts become standard members unless they provide the configured admin invite code.

---

## How-to Guides

### How to sign in and out

1. Open the session menu in the header.
2. Choose `Sign in` or `Register`.
3. Submit your email and password.
4. Use `Logout` from the same menu to clear the local session.

### How to add a game as admin

1. Register the first account or use a valid admin invite code.
2. Open `/add-game`.
3. Fill title, year, studio, genres, and optional image URL.
4. Submit the form to trigger `addGame`.
5. Connected clients receive a `gameAdded` subscription event.

### How to update or delete a game

1. Open `/game/:id`.
2. If you are admin, use:
   - Edit form -> `updateGame`
   - Delete button -> `deleteGame`
3. The backend emits `gameUpdated` or `gameDeleted`.

### How to add a review

1. Open `/game/:id/add-review`.
2. Submit a rating from `1` to `10` and a comment.
3. The backend creates the review and publishes `reviewAdded(gameId)`.
4. The details page updates through `subscribeToMore`.

### How to filter and sort games

On the home page:

- Filter by genre
- Sort by `title` or `year`
- Choose ascending or descending order
- Move through paginated results

---

## Reference: Architecture and Source Code

### Repository structure

```text
graphql-project/
  src/                    # Backend
  frontend/               # Frontend
  Dockerfile              # Backend containerization
  README.md               # This file
```

### Backend reference (`src`)

#### `src/index.js`

Responsibilities:

- Loads environment variables
- Connects to MongoDB
- Builds the executable GraphQL schema
- Starts both HTTP and WebSocket servers
- Builds auth context from Bearer tokens

Auth context fields:

- `user`: decoded JWT payload or `null`
- `roles`: role array from token payload
- `isAdmin`: `roles.includes('admin')`

#### `src/auth.js`

Responsibilities:

- Hashes passwords with `crypto.pbkdf2Sync`
- Verifies passwords using timing-safe comparison
- Signs app-issued JWTs
- Verifies JWTs using `AUTH_JWT_SECRET`
- Produces safe user payloads for GraphQL responses

#### `src/models/User.js`

Mongoose user fields:

- `username`
- `email`
- `passwordHash`
- `passwordSalt`
- `roles`

#### `src/schema/typeDefs.js`

Defines:

- Domain types: `Game`, `Studio`, `Review`
- Auth types: `AuthUser`, `AuthPayload`
- Queries, mutations, and subscriptions

#### `src/resolvers/query.js`

Implements:

- `me`
- `games(page, limit, genre, sortBy, order)`
- `gameCount(genre)`
- `game(id)`
- `studios()`

#### `src/resolvers/mutation.js`

Implements:

- `register(username, email, password, adminCode)`
- `login(email, password)`
- `addGame(...)`
- `updateGame(id, updates)`
- `deleteGame(id)`
- `addReview(gameId, rating, comment)`

Behavior notes:

- The first registered user becomes admin automatically.
- `ADMIN_INVITE_CODE` can elevate later registrations.
- `addReview` validates the `1..10` rating range.

#### `src/resolvers/subscription.js`

Uses in-process `graphql-subscriptions` PubSub.

Channels:

- `GAME_ADDED`
- `GAME_UPDATED`
- `GAME_DELETED`
- `REVIEW_ADDED_<gameId>`

#### `src/resolvers/types.js`

Field resolvers:

- `Game.id`
- `Studio.id`
- `Review.id`
- `Game.reviews`
- `Studio.games`

#### `src/seed.js`

Responsibilities:

- Connects to MongoDB
- Clears `Game`, `Studio`, and `Review`
- Inserts predefined data
- Logs a summary and disconnects

### Frontend reference (`frontend/src`)

#### `frontend/src/main.jsx`

Responsibilities:

- Bootstraps the React app
- Loads global styling
- Renders the main application directly

#### `frontend/src/auth/session.js`

Responsibilities:

- Stores auth session data in `localStorage`
- Exposes the current token for Apollo links
- Broadcasts auth state changes to React consumers

#### `frontend/src/auth/useAuthSession.js`

Responsibilities:

- Subscribes React components to auth session changes
- Exposes `isAuthenticated`, `isAdmin`, token, and user info

#### `frontend/src/apollo/client.jsx`

Responsibilities:

- Builds HTTP and WebSocket Apollo links
- Injects the current Bearer token into both transports
- Splits subscriptions to WebSocket
- Configures cache behavior for `Query.games`

#### `frontend/src/components/Layout.jsx`

Responsibilities:

- Renders the app shell
- Hosts the sign-in and registration UI
- Stores successful auth payloads locally
- Shows admin-only navigation when allowed

#### `frontend/src/pages/AddGame.jsx`

Responsibilities:

- Protects the create screen behind `isAdmin`
- Loads studios for the selector
- Submits `ADD_GAME`

#### `frontend/src/pages/GameDetails.jsx`

Responsibilities:

- Loads one game by id
- Subscribes to `reviewAdded(gameId)`
- Supports inline admin edits and deletes
- Displays ratings on a `10` point scale

#### `frontend/src/pages/AddReview.jsx`

Responsibilities:

- Submits anonymous reviews
- Uses the updated `1..10` rating scale
- Refetches the game after submission

---

## Reference: GraphQL API

### Types

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

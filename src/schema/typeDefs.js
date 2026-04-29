// src/schema/typeDefs.js
const { gql } = require('apollo-server');

module.exports = gql`
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

  type Query {
    games(page: Int, limit: Int, genre: String, sortBy: String, order: String): [Game!]!
    gameCount(genre: String): Int!
    game(id: ID!): Game
    studios: [Studio!]!
    me: AuthUser
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, adminCode: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addGame(title: String!, year: Int!, studioId: ID!, genres: [String!], imageUrl: String): Game!
    updateGame(id: ID!, title: String, year: Int): Game!
    deleteGame(id: ID!): Boolean!
    addReview(gameId: ID!, rating: Int!, comment: String!): Review!
  }

  type Subscription {
    gameAdded: Game!
    gameUpdated: Game!
    gameDeleted: ID!
    reviewAdded(gameId: ID!): Review!
  }
`;

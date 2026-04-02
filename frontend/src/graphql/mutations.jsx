import { gql } from '@apollo/client';
import { GAME_FIELDS } from './queries';

export const ADD_GAME = gql`
  ${GAME_FIELDS}
  mutation AddGame($title: String!, $year: Int!, $studioId: ID!, $genres: [String!], $imageUrl: String) {
    addGame(title: $title, year: $year, studioId: $studioId, genres: $genres, imageUrl: $imageUrl) {
      ...GameFields
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($gameId: ID!, $rating: Int!, $comment: String!) {
    addReview(gameId: $gameId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      game {
        id
      }
    }
  }
`;

export const DELETE_GAME = gql`
  mutation DeleteGame($id: ID!) {
    deleteGame(id: $id)
  }
`;

export const UPDATE_GAME = gql`
  ${GAME_FIELDS}
  mutation UpdateGame($id: ID!, $title: String, $year: Int) {
    updateGame(id: $id, title: $title, year: $year) {
      ...GameFields
    }
  }
`;

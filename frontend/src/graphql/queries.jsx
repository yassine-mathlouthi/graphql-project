import { gql } from '@apollo/client';

// Fragments for reusable field sets
export const GAME_FIELDS = gql`
  fragment GameFields on Game {
    id
    title
    year
    genres
    studio {
      id
      name
    }
  }
`;

export const GET_GAMES = gql`
  ${GAME_FIELDS}
  query GetGames($page: Int, $limit: Int, $genre: String, $sortBy: String, $order: String) {
    games(page: $page, limit: $limit, genre: $genre, sortBy: $sortBy, order: $order) {
      ...GameFields
    }
  }
`;

export const GET_GAME = gql`
  ${GAME_FIELDS}
  query GetGame($id: ID!) {
    game(id: $id) {
      ...GameFields
      reviews {
        id
        rating
        comment
      }
    }
  }
`;

export const GET_STUDIOS = gql`
  query GetStudios {
    studios {
      id
      name
    }
  }
`;

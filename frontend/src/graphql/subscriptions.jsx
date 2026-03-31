import { gql } from '@apollo/client';
import { GAME_FIELDS } from './queries';

export const GAME_ADDED = gql`
  ${GAME_FIELDS}
  subscription GameAdded {
    gameAdded {
      ...GameFields
    }
  }
`;

export const GAME_UPDATED = gql`
  ${GAME_FIELDS}
  subscription GameUpdated {
    gameUpdated {
      ...GameFields
    }
  }
`;

export const GAME_DELETED = gql`
  subscription GameDeleted {
    gameDeleted
  }
`;

export const REVIEW_ADDED = gql`
  subscription ReviewAdded($gameId: ID!) {
    reviewAdded(gameId: $gameId) {
      id
      rating
      comment
      game {
        id
        title
      }
    }
  }
`;

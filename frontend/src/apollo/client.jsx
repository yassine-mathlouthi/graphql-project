import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { getAuthToken } from '../auth/session';

const GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL;
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || GRAPHQL_HTTP_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP_URL,
});

const wsLink = new GraphQLWsLink(createClient({
  url: GRAPHQL_WS_URL,
  connectionParams: async () => {
    const token = getAuthToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }
}));

const authLink = setContext(async (_, { headers }) => {
  const token = getAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    }
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          games: {
            merge(existing = [], incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
});

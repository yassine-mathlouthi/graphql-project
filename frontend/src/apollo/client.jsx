import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import keycloak from '../keycloak';

const GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL;
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || GRAPHQL_HTTP_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP_URL,
});

const wsLink = new GraphQLWsLink(createClient({
  url: GRAPHQL_WS_URL,
  connectionParams: async () => {
    if (keycloak.token) {
      await keycloak.updateToken(30).catch(() => undefined);
      return { authorization: `Bearer ${keycloak.token}` };
    }
    return {};
  }
}));

const authLink = setContext(async (_, { headers }) => {
  if (keycloak.token) {
    // Si le token expire dans moins de 30 secondes, on le rafraîchit
    await keycloak.updateToken(30).catch(() => undefined);
  }
  return {
    headers: {
      ...headers,
      ...(keycloak.token ? { authorization: `Bearer ${keycloak.token}` } : {}),
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

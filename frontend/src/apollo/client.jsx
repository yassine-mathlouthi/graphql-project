import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import keycloak from '../keycloak';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: async () => {
    if (keycloak.token) {
      await keycloak.updateToken(30).catch(() => keycloak.login());
      return { authorization: `Bearer ${keycloak.token}` };
    }
    return {};
  }
}));

const authLink = setContext(async (_, { headers }) => {
  if (keycloak.token) {
    // Si le token expire dans moins de 30 secondes, on le rafraîchit
    await keycloak.updateToken(30).catch(() => keycloak.login());
  }
  return {
    headers: {
      ...headers,
      authorization: keycloak.token ? `Bearer ${keycloak.token}` : '',
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

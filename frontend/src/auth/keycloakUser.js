import keycloak from '../keycloak';

function extractRoles(parsedToken) {
  const realmRoles = parsedToken?.realm_access?.roles || [];
  const clientRoles = Object.values(parsedToken?.resource_access || {})
    .flatMap(client => client?.roles || []);

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

export function getKeycloakUserState() {
  const parsedToken = keycloak.tokenParsed;
  const isAuthenticated = Boolean(keycloak.authenticated && keycloak.token);
  const roles = extractRoles(parsedToken);

  return {
    isAuthenticated,
    roles,
    isAdmin: roles.includes('admin'),
    username: parsedToken?.preferred_username || 'Guest',
    email: parsedToken?.email || null,
    realm: keycloak.realm || parsedToken?.iss?.split('/realms/')[1] || 'graphql-realm',
    clientId: keycloak.clientId || 'react-client',
  };
}

export async function login() {
  return keycloak.login();
}

export async function logout() {
  return keycloak.logout({ redirectUri: window.location.origin });
}

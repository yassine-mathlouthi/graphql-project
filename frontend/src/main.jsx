import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak';

function KeycloakProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const isRun = useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
      })
      .catch((err) => {
        console.error('Erreur initialisation Keycloak', err);
        // Sometimes it fails here due to quick reloads, we could try to handle it.
      });
  }, []);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium tracking-wide text-gray-800">
          Redirection vers l'authentification sécurisée...
        </div>
      </div>
    );
  }

  return children;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KeycloakProvider>
      <App />
    </KeycloakProvider>
  </React.StrictMode>,
)

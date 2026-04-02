import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak';

function KeycloakProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const isRun = useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    
    keycloak
      .init({ onLoad: 'check-sso', checkLoginIframe: false })
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error('Erreur initialisation Keycloak', err);
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
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

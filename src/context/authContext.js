// authContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest, graphScopes, apiScopes } from "../utils/azureAuth";

export const msalInstance = new PublicClientApplication({
  ...msalConfig,
  auth: {
    ...msalConfig.auth,
    // Evita que MSAL “regrese” a la URL original tras redirect (reduce hash vacíos)
    navigateToLoginRequestUrl: false,
    // Si NO estás embebiendo tu app en un iframe (Teams/Outlook), déjalo en false
    // allowRedirectInIframe: false (valor por defecto)
  },
});

const AuthContext = createContext(undefined);

async function acquire(msal, req, account) {
  try {
    const res = await msal.acquireTokenSilent({ ...req, account });
    return res.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      const res = await msal.acquireTokenPopup({ ...req, account });
      return res.accessToken;
    }
    throw e;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessTokenGraph, setAccessTokenGraph] = useState(null);
  const [accessTokenApi, setAccessTokenApi] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const startup = useCallback(async () => {
    await msalInstance.initialize();

    // 1) Procesa posibles respuestas de redirect (si alguna parte de tu app lo usa)
    const redirectRes = await msalInstance.handleRedirectPromise().catch(() => null);

    // 2) Recupera/establece cuenta activa desde cache o redirect
    let account =
      redirectRes?.account ||
      msalInstance.getActiveAccount() ||
      msalInstance.getAllAccounts()[0];

    // 3) Si NO hay cuenta -> ve DIRECTO a login interactivo (NO ssoSilent)
    if (!account) {
      const loginRes = await msalInstance.loginPopup(loginRequest);
      account = loginRes.account;
    }

    msalInstance.setActiveAccount(account);
    setUser(account);

    // 4) Tokens (silencioso con fallback a popup)
    const [graphToken, apiToken] = await Promise.all([
      acquire(msalInstance, { scopes: graphScopes }, account).catch(() => null),
      acquire(msalInstance, { scopes: apiScopes }, account).catch(() => null),
    ]);
    setAccessTokenGraph(graphToken);
    setAccessTokenApi(apiToken);

    // 5) Foto (opcional)
    if (graphToken) {
      try {
        const resp = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
          headers: { Authorization: `Bearer ${graphToken}` },
        });
        if (resp.ok) {
          const blob = await resp.blob();
          setProfilePhoto(URL.createObjectURL(blob));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await startup();
        setAuthError(null);
      } catch (e) {
        console.error("Auth startup failed:", e);
        if (!cancelled) setAuthError(e?.message || "Authentication failed");
      } finally {
        if (!cancelled) setAuthLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [startup]);

  const login = useCallback(async () => {
    // login bajo demanda (también interactivo)
    const res = await msalInstance.loginPopup(loginRequest);
    msalInstance.setActiveAccount(res.account);
    setUser(res.account);
  }, []);

  const logout = useCallback(async () => {
    await msalInstance.logoutPopup();
    setUser(null);
    setAccessTokenApi(null);
    setAccessTokenGraph(null);
    setProfilePhoto(null);
    setAuthError(null);
  }, []);

  const value = useMemo(() => ({
    user,
    accessTokenGraph,
    accessTokenApi,
    profilePhoto,
    authLoaded,
    authError,
    login,
    logout,
  }), [user, accessTokenGraph, accessTokenApi, profilePhoto, authLoaded, authError, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

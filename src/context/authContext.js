// src/context/authContext.jsx
import React, {
  createContext, useContext, useEffect, useMemo, useState, useCallback, useRef
} from "react";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { useAgents } from "./agentsContext";
import { ENDPOINT_URLS } from "../utils/js/constants";
import { msalConfig, apiScopes, graphScopes, loginRequest, SILENT_REDIRECT_URI } from "../utils/azureAuth";

export const msalInstance = new PublicClientApplication(msalConfig);
const AuthContext = createContext(undefined);

const graphRequest = { scopes: graphScopes, redirectUri: SILENT_REDIRECT_URI };
const apiRequest   = { scopes: apiScopes,   redirectUri: SILENT_REDIRECT_URI };

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

  const { state: agentsState } = useAgents();
  const [agentData, setAgentData] = useState(null);
  const bootRef = useRef(false);

  const API_BASE = ENDPOINT_URLS.API;

  // --- Bootstrapping MSAL: initialize + handleRedirectPromise (limpia hashes) ---
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;

    let mounted = true;
    (async () => {
      try {
        await msalInstance.initialize();
        // Procesa cualquier respuesta de redirect ANTES de montar la app
        await msalInstance.handleRedirectPromise().catch((e) => {
          // Si hubo un hash residual, aquí lo capturas sin romper la app
          console.warn('handleRedirectPromise error:', e?.message || e);
        });

        // Recupera cuenta activa o cualquiera cacheada
        const account =
          msalInstance.getActiveAccount() ||
          msalInstance.getAllAccounts()[0] ||
          null;

        if (mounted && account) {
          msalInstance.setActiveAccount(account);
          setUser(account);

          // tokens iniciales (opcional)
          const [tg, ta] = await Promise.all([
            acquire(msalInstance, graphRequest, account).catch(() => null),
            acquire(msalInstance, apiRequest,   account).catch(() => null),
          ]);
          setAccessTokenGraph(tg);
          setAccessTokenApi(ta);

          console.log("Access tokens acquired:", { tg, ta }); 

          // foto (opcional)
          if (tg) {
            try {
              const resp = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
                headers: { Authorization: `Bearer ${tg}` },
              });
              if (resp.ok) {
                const blob = await resp.blob();
                setProfilePhoto(URL.createObjectURL(blob));
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("MSAL bootstrap failed:", err);
        setAuthError(err?.message || "Auth bootstrap failed");
      } finally {
        if (mounted) setAuthLoaded(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // --- Login interactivo (popup) ---
  const login = useCallback(async () => {
    try {
      const resp = await msalInstance.loginPopup(loginRequest);
      const account = resp.account;
      if (!account) throw new Error("No active account after login.");
      msalInstance.setActiveAccount(account);
      setUser(account);

      const [tokenGraph, tokenApi] = await Promise.all([
        acquire(msalInstance, graphRequest, account).catch(() => null),
        acquire(msalInstance, apiRequest,   account).catch(() => null),
      ]);
      setAccessTokenGraph(tokenGraph);
      setAccessTokenApi(tokenApi);

      if (tokenGraph) {
        try {
          const r = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
            headers: { Authorization: `Bearer ${tokenGraph}` },
          });
          if (r.ok) {
            const blob = await r.blob();
            setProfilePhoto(URL.createObjectURL(blob));
          }
        } catch {}
      }

      setAuthError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError(err?.message || "Login failed");
    }
  }, []);

  const logout = useCallback(() => {
    msalInstance.logoutPopup().finally(() => {
      setUser(null);
      setAccessTokenApi(null);
      setAccessTokenGraph(null);
      setProfilePhoto(null);
      setAgentData(null);
      setAuthError(null);
    });
  }, []);

  // --- Token para tu API on-demand ---
  const getAccessTokenForApi = useCallback(
    async (accountOverride) => {
      const account = accountOverride || msalInstance.getActiveAccount() || user;
      if (!account) return null;
      try {
        const token = await acquire(msalInstance, apiRequest, account);
        setAccessTokenApi(token);
        return token;
      } catch (e) {
        setAuthError(e?.message || "Failed to acquire API token");
        return null;
      }
    },
    [user]
  );

  // --- Helper para llamar a tu API con Bearer ---
  const callApi = useCallback(
    async (path, init = {}) => {
      const account = msalInstance.getActiveAccount() || user;
      let token = accessTokenApi;
      if (!token) {
        token = await getAccessTokenForApi(account);
        if (!token) throw new Error("No API token available");
      }
      const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers || {}),
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? await res.json() : undefined;
    },
    [accessTokenApi, user, getAccessTokenForApi, API_BASE]
  );

  // --- Vincular datos de agentes a partir del correo ---
  useEffect(() => {
    if (!user) { setAgentData(null); return; }
    const list = (agentsState && agentsState.agents) ? agentsState.agents : [];
    if (!Array.isArray(list) || list.length === 0) { setAgentData(null); return; }

    const mail = (user.username || user.idTokenClaims?.preferred_username || "").toLowerCase();
    const match = list.find(a => (a.agent_email || "").toLowerCase() === mail);
    setAgentData(match || null);
  }, [user, agentsState]);

  const value = useMemo(() => ({
    user,
    accessTokenGraph,
    accessTokenApi,
    profilePhoto,
    agentData,
    department: agentData?.agent_department || null,
    authLoaded,
    authError,
    login,
    logout,
    getAccessTokenForApi,
    callApi,
  }), [
    user,
    accessTokenGraph,
    accessTokenApi,
    profilePhoto,
    agentData,
    authLoaded,
    authError,
    login,
    logout,
    getAccessTokenForApi,
    callApi,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

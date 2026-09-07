#!/usr/bin/env node
/**
 * Pilotest Sync Server (Node.js)
 * Prérequis : Node.js 18+
 * Usage     : node server.js
 */

import http from "http";
import fs   from "fs";
import path from "path";
import { URL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT        = 5000;
const BASE_URL    = "https://www.pilotest.com";
const DATA_DIR    = process.env.DATA_DIR ?? __dirname;
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const CACHE_FILE  = path.join(DATA_DIR, "cache.json");
const DEBUG_DIR   = path.join(DATA_DIR, "debug");

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Helpers fichiers ──────────────────────────────────────────────────────────

function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return null; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// Sauvegarde la réponse brute d'une étape qui a échoué, pour pouvoir diagnostiquer
// un changement de structure du site sans avoir à reproduire l'erreur en direct.
function saveDebug(name, content) {
  try {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    const file = path.join(DEBUG_DIR, `${name}.html`);
    fs.writeFileSync(file, content ?? "", "utf8");
    console.log(`[debug] Réponse sauvegardée dans ${file}`);
  } catch (e) {
    console.error(`[debug] Impossible d'écrire le fichier de debug : ${e.message}`);
  }
}

// ── Pilotest client ───────────────────────────────────────────────────────────

class PilotestClient {
  constructor(email, password) {
    this.email    = email;
    this.password = password;
    this.cookies  = {};
  }

  _cookieHeader() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  }

  // Stocke TOUS les Set-Cookie, y compris ceux des redirections
  _storeCookies(response) {
    const raw = response.headers.getSetCookie?.() ?? [];
    for (const c of raw) {
      const [pair] = c.split(";");
      const eqIdx  = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const k = pair.slice(0, eqIdx).trim();
      const v = pair.slice(eqIdx + 1).trim();
      if (k) {
        this.cookies[k] = v;
        console.log(`[cookie] ${k} = ${v.slice(0, 30)}…`);
      }
    }
  }

  async _get(url, { asJson = false } = {}) {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      "Cookie":     this._cookieHeader(),
      "Referer":    `${BASE_URL}/fr/results`,
    };
    if (asJson) {
      headers["Accept"]            = "application/json, text/javascript, */*; q=0.01";
      headers["X-Requested-With"]  = "XMLHttpRequest";
    } else {
      headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    }
    // redirect: "manual" pour capturer les cookies des redirections
    const r = await fetch(url, { headers, redirect: "manual" });
    this._storeCookies(r);

    // Suit les redirections manuellement pour ne pas perdre les cookies
    if (r.status >= 300 && r.status < 400) {
      const location = r.headers.get("location");
      if (location) {
        const next = location.startsWith("http") ? location : BASE_URL + location;
        console.log(`[redirect] ${url} → ${next}`);
        return this._get(next, { asJson });
      }
    }

    console.log(`[fetch] GET ${url} → ${r.status} (${r.headers.get("content-type") ?? "?"})`);
    return r;
  }

  async _post(url, formData) {
    const body = new URLSearchParams(formData).toString();
    // redirect: "manual" pour capturer le cookie de session posé lors du redirect post-login
    const r = await fetch(url, {
      method:  "POST",
      headers: {
        "User-Agent":   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie":       this._cookieHeader(),
      },
      body,
      redirect: "manual",
    });
    this._storeCookies(r);
    console.log(`[fetch] POST ${url} → ${r.status}`);

    // Suit la redirection post-login
    if (r.status >= 300 && r.status < 400) {
      const location = r.headers.get("location");
      if (location) {
        const next = location.startsWith("http") ? location : BASE_URL + location;
        console.log(`[redirect] POST → ${next}`);
        return this._get(next);
      }
    }
    return r;
  }

  // Cherche le token CSRF soit dans le champ caché du formulaire (ancien schéma Rails),
  // soit dans la balise <meta name="csrf-token"> (schéma utilisé par Turbo/UJS) —
  // le site a pu migrer de l'un à l'autre.
  _extractCSRF(html) {
    const hidden = html.match(/name="authenticity_token"\s+value="([^"]+)"/);
    if (hidden) return hidden[1];
    const meta = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    if (meta) return meta[1];
    return null;
  }

  // Détecte une page de challenge anti-bot (Cloudflare, etc.) plutôt que le contenu attendu —
  // cause fréquente d'échec silencieux quand un site renforce sa protection.
  _detectChallenge(html) {
    const markers = [
      "Just a moment",
      "cf-browser-verification",
      "cf-chl-",
      "Attention Required",
      "Checking your browser",
      "captcha",
    ];
    const lower = html.toLowerCase();
    return markers.find(m => lower.includes(m.toLowerCase())) ?? null;
  }

  async login() {
    console.log(`[pilotest] Connexion avec ${this.email}…`);

    const loginPage = await this._get(`${BASE_URL}/fr/users/sign_in`);
    const html      = await loginPage.text();

    const challenge = this._detectChallenge(html);
    if (challenge) {
      saveDebug("login-page-challenge", html);
      throw new Error(`Page de login bloquée par une protection anti-bot (marqueur : "${challenge}"). Voir debug/login-page-challenge.html.`);
    }

    const csrf = this._extractCSRF(html);
    if (!csrf) {
      saveDebug("login-page-no-csrf", html);
      throw new Error(`Token CSRF introuvable sur la page de login (HTTP ${loginPage.status}) — la structure du site a probablement changé. Voir debug/login-page-no-csrf.html.`);
    }
    console.log(`[pilotest] CSRF : ${csrf.slice(0, 20)}…`);

    const resp      = await this._post(`${BASE_URL}/fr/users/sign_in`, {
      authenticity_token:  csrf,
      "user[email]":       this.email,
      "user[password]":    this.password,
      "user[remember_me]": "1",
      commit:              "Se connecter",
    });

    const finalHtml = await resp.text();
    console.log(`[pilotest] URL finale après login : ${resp.url} (HTTP ${resp.status})`);

    if (resp.url?.includes("sign_in") || finalHtml.toLowerCase().includes("invalid")) {
      saveDebug("login-post-response", finalHtml);
      throw new Error(`Identifiants invalides, ou le formulaire de login a changé (champs attendus différents). Voir debug/login-post-response.html.`);
    }

    console.log("[pilotest] Connecté ! Cookies stockés :", Object.keys(this.cookies).join(", "));
    return true;
  }

  async fetchResults() {
    const url = `${BASE_URL}/fr/results.json`;
    console.log(`[pilotest] Récupération des résultats depuis ${url}…`);

    const r    = await this._get(url, { asJson: true });
    const text = await r.text();
    console.log(`[pilotest] Réponse HTTP ${r.status} (${r.headers.get("content-type") ?? "?"}), 200 premiers chars : ${text.slice(0, 200)}`);

    try {
      const data = JSON.parse(text);
      console.log(`[pilotest] ✓ ${Array.isArray(data) ? data.length : "?"} résultats`);
      return data;
    } catch {
      saveDebug("results-response", text);

      // Redirigé vers login → session invalide
      if (text.includes("sign_in")) {
        throw new Error("Session expirée ou invalide — le login n'a pas fonctionné correctement.");
      }
      const challenge = this._detectChallenge(text);
      if (challenge) {
        throw new Error(`Requête bloquée par une protection anti-bot (marqueur : "${challenge}"). Voir debug/results-response.html.`);
      }
      if (r.status === 404) {
        throw new Error(`L'URL /fr/results.json n'existe plus (HTTP 404) — le site a changé sa structure d'API. Voir debug/results-response.html.`);
      }
      throw new Error(`Réponse non-JSON depuis /fr/results.json (HTTP ${r.status}). Voir debug/results-response.html.`);
    }
  }
}

// ── Cache ─────────────────────────────────────────────────────────────────────

function loadCache() {
  return loadJSON(CACHE_FILE) ?? { results: null, updated_at: null, error: null };
}
function saveCache(results) {
  saveJSON(CACHE_FILE, { results, updated_at: new Date().toISOString(), error: null });
  console.log(`[cache] ${results.length} résultats sauvegardés`);
}
function saveCacheError(msg) {
  saveJSON(CACHE_FILE, { ...loadCache(), error: msg });
}

// ── Sync ──────────────────────────────────────────────────────────────────────

const syncState = { running: false, lastError: null };

async function doSync(email, password) {
  if (syncState.running) return;
  syncState.running   = true;
  syncState.lastError = null;
  try {
    const client = new PilotestClient(email, password);
    await client.login();
    const results = await client.fetchResults();
    saveCache(results);
    console.log("[sync] Terminée avec succès.");
  } catch (e) {
    console.error("[sync] Erreur :", e.message);
    syncState.lastError = e.message;
    saveCacheError(e.message);
  } finally {
    syncState.running = false;
  }
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "http://localhost:5173", // vite dev
  "http://localhost:4173", // vite preview
  "https://piscovi.ade-dev.fr", // prod
];

function cors(res, req) {
  const origin = req.headers.origin ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function jsonRes(res, req, code, data) {
  const body = JSON.stringify(data, null, 2);
  cors(res, req);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
async function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", c => data += c);
    req.on("end",  () => { try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") { cors(res, req); res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && pathname === "/status") {
    const cfg   = loadJSON(CONFIG_FILE) ?? {};
    const cache = loadCache();
    return jsonRes(res, req, 200, {
      configured:   !!cfg.email,
      sync_running: syncState.running,
      last_error:   syncState.lastError ?? cache.error,
      updated_at:   cache.updated_at,
      count:        cache.results?.length ?? 0,
    });
  }

  if (req.method === "GET" && pathname === "/results") {
    const cache = loadCache();
    if (!cache.results) return jsonRes(res, req, 503, { error: "Aucun résultat en cache. Lancez /sync d'abord." });
    return jsonRes(res, req, 200, { results: cache.results, updated_at: cache.updated_at });
  }

  // Liste ou consulte les réponses brutes sauvegardées lors du dernier échec de sync
  // (utile pour diagnostiquer un changement de structure du site sans accès shell).
  if (req.method === "GET" && pathname === "/debug") {
    let files = [];
    try {
      files = fs.readdirSync(DEBUG_DIR).map(name => {
        const stat = fs.statSync(path.join(DEBUG_DIR, name));
        return { name, size: stat.size, modified_at: stat.mtime.toISOString() };
      });
    } catch { /* pas encore de fichiers de debug */ }
    return jsonRes(res, req, 200, { files });
  }

  if (req.method === "GET" && pathname.startsWith("/debug/")) {
    const name = pathname.slice("/debug/".length);
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return jsonRes(res, req, 400, { error: "Nom de fichier invalide" });
    const file = path.join(DEBUG_DIR, name);
    if (!file.startsWith(DEBUG_DIR) || !fs.existsSync(file)) return jsonRes(res, req, 404, { error: "Fichier introuvable" });
    cors(res, req);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(fs.readFileSync(file, "utf8"));
    return;
  }

  if (req.method === "POST" && pathname === "/configure") {
    const body = await readBody(req);
    if (!body.email || !body.password)
      return jsonRes(res, req, 400, { error: "email et password requis" });
    saveJSON(CONFIG_FILE, { email: body.email, password: body.password });
    console.log(`[config] Sauvegardé pour ${body.email}`);
    return jsonRes(res, req, 200, { ok: true, message: "Configuration sauvegardée" });
  }

  if (req.method === "POST" && pathname === "/sync") {
    const cfg = loadJSON(CONFIG_FILE);
    if (!cfg?.email) return jsonRes(res, req, 400, { error: "Pas de config. Appelez POST /configure d'abord." });
    if (syncState.running) return jsonRes(res, req, 200, { ok: true, message: "Sync déjà en cours…" });
    doSync(cfg.email, cfg.password);
    return jsonRes(res, req, 202, { ok: true, message: "Sync démarrée en arrière-plan" });
  }

  jsonRes(res, req, 404, { error: "Route inconnue" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("═".repeat(50));
  console.log(`  Pilotest Sync Server  —  http://localhost:${PORT}`);
  console.log("═".repeat(50));
  const cfg = loadJSON(CONFIG_FILE);
  if (cfg?.email) {
    console.log(`[config] Compte : ${cfg.email}`);
    doSync(cfg.email, cfg.password);
  } else {
    console.log("[config] Pas encore configuré.");
  }
});

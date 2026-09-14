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
const CONFIG_FILE     = path.join(DATA_DIR, "config.json");
const CACHE_FILE      = path.join(DATA_DIR, "cache.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const DEBUG_DIR       = path.join(DATA_DIR, "debug");

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
  // `cookieHeader` : valeur brute de l'en-tête Cookie copiée depuis un navigateur
  // où l'utilisateur s'est connecté normalement (voir _loadCookieHeader). Depuis
  // que pilotest.com protège /fr/users/sign_in par un Cloudflare Turnstile, un
  // login scripté (POST email/mot de passe sans navigateur) ne peut plus aboutir
  // — seule une session obtenue via un vrai navigateur fonctionne.
  constructor(cookieHeader) {
    this.cookies = {};
    if (cookieHeader) this._loadCookieHeader(cookieHeader);
  }

  _loadCookieHeader(header) {
    for (const pair of header.split(";")) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const k = pair.slice(0, eqIdx).trim();
      const v = pair.slice(eqIdx + 1).trim();
      if (k) this.cookies[k] = v;
    }
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
      "contrôle anti-robot",
      "cf-turnstile",
    ];
    const lower = html.toLowerCase();
    return markers.find(m => lower.includes(m.toLowerCase())) ?? null;
  }

  // pilotest.com protège désormais /fr/users/sign_in par un Cloudflare Turnstile :
  // un login scripté (POST email/mot de passe sans navigateur) ne peut plus jamais
  // obtenir de jeton valide et est systématiquement rejeté. La seule session
  // utilisable est donc celle fournie manuellement (cookie copié depuis un
  // navigateur où l'utilisateur s'est connecté lui-même, en résolvant le
  // captcha comme un humain).
  ensureSession() {
    if (!Object.keys(this.cookies).length) {
      throw new Error(
        "Aucune session configurée. Le login automatique (email/mot de passe) ne fonctionne plus " +
        "depuis que pilotest.com protège la connexion par un Cloudflare Turnstile : connecte-toi " +
        "normalement sur pilotest.com dans ton navigateur, puis colle le cookie de session dans la configuration."
      );
    }
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

      // Redirigé vers login → session invalide/expirée
      if (text.includes("sign_in")) {
        throw new Error("Session expirée ou invalide — reconnecte-toi sur pilotest.com et remplace le cookie de session dans la configuration.");
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

// ── Catégories (psy0/psy1) ────────────────────────────────────────────────────
// Rangées côté serveur (comme cache.json/config.json) pour que la
// catégorisation manuelle des tests survive à un changement de support.

function loadCategories() {
  return loadJSON(CATEGORIES_FILE) ?? {};
}
function saveCategories(categories) {
  saveJSON(CATEGORIES_FILE, categories);
}

// ── Sync ──────────────────────────────────────────────────────────────────────

const syncState = { running: false, lastError: null };

async function doSync(cookieHeader) {
  if (syncState.running) return;
  syncState.running   = true;
  syncState.lastError = null;
  try {
    const client = new PilotestClient(cookieHeader);
    client.ensureSession();
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
      configured:   !!cfg.cookie,
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

  // Enregistre des résultats fournis directement par le client (import JSON manuel),
  // dans le même cache que la sync pilotest.com — pour qu'ils survivent à un
  // changement de navigateur/appareil, pas seulement au localStorage local.
  if (req.method === "POST" && pathname === "/results") {
    const body = await readBody(req);
    if (!Array.isArray(body.results))
      return jsonRes(res, req, 400, { error: "results (tableau) requis" });
    saveCache(body.results);
    console.log(`[import] ${body.results.length} résultat(s) enregistré(s) manuellement`);
    return jsonRes(res, req, 200, { ok: true, message: "Résultats enregistrés" });
  }

  if (req.method === "GET" && pathname === "/categories") {
    return jsonRes(res, req, 200, { categories: loadCategories() });
  }

  if (req.method === "POST" && pathname === "/categories") {
    const body = await readBody(req);
    if (!body.categories || typeof body.categories !== "object" || Array.isArray(body.categories))
      return jsonRes(res, req, 400, { error: "categories (objet) requis" });
    saveCategories(body.categories);
    console.log(`[categories] ${Object.keys(body.categories).length} test(s) catégorisé(s) sauvegardé(s)`);
    return jsonRes(res, req, 200, { ok: true });
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
    const body   = await readBody(req);
    const cookie = typeof body.cookie === "string" ? body.cookie.trim() : "";
    if (!cookie)
      return jsonRes(res, req, 400, { error: "cookie requis (copié depuis un navigateur connecté sur pilotest.com)" });
    saveJSON(CONFIG_FILE, { cookie });
    console.log("[config] Cookie de session sauvegardé");
    return jsonRes(res, req, 200, { ok: true, message: "Configuration sauvegardée" });
  }

  if (req.method === "POST" && pathname === "/sync") {
    const cfg = loadJSON(CONFIG_FILE);
    if (!cfg?.cookie) return jsonRes(res, req, 400, { error: "Pas de config. Appelez POST /configure d'abord." });
    if (syncState.running) return jsonRes(res, req, 200, { ok: true, message: "Sync déjà en cours…" });
    doSync(cfg.cookie);
    return jsonRes(res, req, 202, { ok: true, message: "Sync démarrée en arrière-plan" });
  }

  jsonRes(res, req, 404, { error: "Route inconnue" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("═".repeat(50));
  console.log(`  Pilotest Sync Server  —  http://localhost:${PORT}`);
  console.log("═".repeat(50));
  const cfg = loadJSON(CONFIG_FILE);
  if (cfg?.cookie) {
    console.log("[config] Session configurée");
    doSync(cfg.cookie);
  } else {
    console.log("[config] Pas encore configuré.");
  }
});

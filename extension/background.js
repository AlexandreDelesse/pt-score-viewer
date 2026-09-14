// N'accepte de relayer le cookie pilotest.com que pour un onglet ouvert sur
// l'app elle-même — sinon n'importe quelle page pourrait demander la session
// pilotest.com de l'utilisateur via cette extension.
const ALLOWED_TAB_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://piscovi.ade-dev.fr",
];

function originOf(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GET_PILOTEST_COOKIE") return;

  const senderOrigin = sender.tab ? originOf(sender.tab.url) : null;
  if (!senderOrigin || !ALLOWED_TAB_ORIGINS.includes(senderOrigin)) {
    sendResponse({ error: "Origine non autorisée" });
    return;
  }

  chrome.cookies.getAll({ domain: "pilotest.com" }, (cookies) => {
    const cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    sendResponse({ cookie });
  });
  return true; // réponse envoyée de façon asynchrone
});

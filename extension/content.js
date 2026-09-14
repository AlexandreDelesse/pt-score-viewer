// Signale la présence de l'extension à l'app, dès l'injection.
document.documentElement.setAttribute("data-pt-cookie-bridge", "1");

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== "pt-score-viewer") return;
  if (event.data?.type !== "REQUEST_PILOTEST_COOKIE") return;

  chrome.runtime.sendMessage({ type: "GET_PILOTEST_COOKIE" }, (response) => {
    if (chrome.runtime.lastError || !response) return;
    window.postMessage(
      {
        source: "pt-score-viewer-extension",
        type:   "PILOTEST_COOKIE",
        cookie: response.cookie ?? "",
      },
      window.location.origin
    );
  });
});

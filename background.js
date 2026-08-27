import { isConnectivityFailure } from "./src/navigation.js";

const recentRedirects = new Map();

function shouldRedirect(details) {
  if (!isConnectivityFailure(details)) return false;

  const previous = recentRedirects.get(details.tabId) || 0;
  const now = Date.now();
  recentRedirects.set(details.tabId, now);
  return now - previous > 1500;
}

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  if (!shouldRedirect(details)) return;

  const gameUrl = new URL(chrome.runtime.getURL("index.html"));
  gameUrl.searchParams.set("from", details.url);

  try {
    await chrome.tabs.update(details.tabId, { url: gameUrl.href });
  } catch {
    recentRedirects.delete(details.tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  recentRedirects.delete(tabId);
});

chrome.action.onClicked.addListener(async () => {
  await chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

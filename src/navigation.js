export const NETWORK_ERRORS = new Set([
  "ERR_ADDRESS_UNREACHABLE",
  "ERR_CONNECTION_FAILED",
  "ERR_CONNECTION_REFUSED",
  "ERR_CONNECTION_TIMED_OUT",
  "ERR_INTERNET_DISCONNECTED",
  "ERR_NAME_NOT_RESOLVED",
  "ERR_NETWORK_CHANGED",
  "ERR_PROXY_CONNECTION_FAILED",
  "ERR_TIMED_OUT"
]);

export function parseWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function isConnectivityFailure(details) {
  if (details.frameId !== 0 || details.tabId < 0 || !parseWebUrl(details.url)) {
    return false;
  }

  const normalizedError = String(details.error || "").replace(/^net::/, "");
  return NETWORK_ERRORS.has(normalizedError);
}


import test from "node:test";
import assert from "node:assert/strict";
import { isConnectivityFailure, parseWebUrl } from "../src/navigation.js";

const base = {
  frameId: 0,
  tabId: 4,
  url: "https://station.example/path",
  error: "net::ERR_INTERNET_DISCONNECTED"
};

test("only HTTP and HTTPS retry destinations are accepted", () => {
  assert.equal(parseWebUrl("https://example.com/path").hostname, "example.com");
  assert.equal(parseWebUrl("http://localhost:3000/").protocol, "http:");
  assert.equal(parseWebUrl("chrome://settings"), null);
  assert.equal(parseWebUrl("javascript:alert(1)"), null);
  assert.equal(parseWebUrl("not a URL"), null);
});

test("recognized top-level connectivity failures trigger the game", () => {
  for (const error of [
    "net::ERR_INTERNET_DISCONNECTED",
    "net::ERR_NAME_NOT_RESOLVED",
    "ERR_CONNECTION_TIMED_OUT",
    "net::ERR_PROXY_CONNECTION_FAILED"
  ]) {
    assert.equal(isConnectivityFailure({ ...base, error }), true, error);
  }
});

test("security, cancellation, blocked, internal, and subframe failures are ignored", () => {
  assert.equal(isConnectivityFailure({ ...base, error: "net::ERR_CERT_DATE_INVALID" }), false);
  assert.equal(isConnectivityFailure({ ...base, error: "net::ERR_ABORTED" }), false);
  assert.equal(isConnectivityFailure({ ...base, error: "net::ERR_BLOCKED_BY_CLIENT" }), false);
  assert.equal(isConnectivityFailure({ ...base, frameId: 2 }), false);
  assert.equal(isConnectivityFailure({ ...base, tabId: -1 }), false);
  assert.equal(isConnectivityFailure({ ...base, url: "chrome://dino" }), false);
});


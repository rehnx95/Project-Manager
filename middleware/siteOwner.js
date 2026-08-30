require("dotenv").config();
const crypto = require("crypto");

function authenticateOwner(req, res, next) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[authenticateOwner]");

  // Fail loudly on misconfiguration instead of silently 403-ing every
  // request forever with no way to tell "wrong key" from "no key set".
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    console.error(
      new Date().toLocaleTimeString("en-GB"),
      "[authenticateOwner] SECRET_KEY is not set in the environment",
    );
    return res.status(500).json({ success: false, error: "Server misconfigured" });
  }

  // Query param, not body — a browser navigating to a URL (address bar,
  // <a href>, window.location.href = ...) can't send a JSON body, only
  // GET/POST forms and fetch() can. A query param works with a plain
  // navigation, which is what "click → prompt → go to the page" needs.
  const key = req.query.key;
  if (!key || typeof key !== "string") {
    return res.status(401).json({ success: false, error: "No secret key provided" });
  }

  // Constant-time comparison to avoid leaking the secret one character
  // at a time via response-time differences. timingSafeEqual throws if
  // the buffers differ in length, so check that first and treat a
  // length mismatch as a normal "wrong key" rather than a crash.
  const keyBuf = Buffer.from(key);
  const secretBuf = Buffer.from(secret);
  const isMatch =
    keyBuf.length === secretBuf.length &&
    crypto.timingSafeEqual(keyBuf, secretBuf);

  if (!isMatch) {
    return res.status(403).json({ success: false, error: "Forbidden: invalid key" });
  }

  next();
}

module.exports = authenticateOwner;
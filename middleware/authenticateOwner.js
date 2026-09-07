require("dotenv").config();
const crypto = require("crypto");

function isValidSecret(key, secret) {
  if (typeof key !== "string" || !secret) return false;
  const keyBuf = Buffer.from(key);
  const secretBuf = Buffer.from(secret);
  return keyBuf.length === secretBuf.length && crypto.timingSafeEqual(keyBuf, secretBuf);
}

function createAccessToken(secret) {
  const timestamp = String(Date.now());
  const signature = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${signature}`;
}

function getCookie(header, name) {
  const item = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

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

  const accessToken = getCookie(req.headers.cookie, "testing_access");
  if (!accessToken) {
    return res.status(401).json({ success: false, error: "No owner access granted" });
  }
  const [timestamp, signature] = accessToken.split(".");
  const expected = crypto.createHmac("sha256", secret).update(timestamp || "").digest("hex");
  const validTimestamp =
    /^\d+$/.test(timestamp || "") &&
    Date.now() - Number(timestamp) >= 0 &&
    Date.now() - Number(timestamp) <= 5 * 60 * 1000;
  if (!validTimestamp || !isValidSecret(signature, expected)) {
    return res.status(403).json({ success: false, error: "Forbidden: owner access expired" });
  }

  next();
}

module.exports = authenticateOwner;
module.exports.isValidSecret = isValidSecret;
module.exports.createAccessToken = createAccessToken;
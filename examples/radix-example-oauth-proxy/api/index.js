"use strict";

const fetch = require("node-fetch");
const express = require("express");
const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || "0.0.0.0";
const app = express();
const jwt = require("jsonwebtoken");
const azureADPublicKey = [];
const resourceID = process.env.API_RESOURCE_ID;

// get public keys used for signing tokens from azure ad
const getADPublicKeys = async url => {
  try {
    const response = await fetch(url);
    const json = await response.json();
    json.keys.forEach(key => {
      azureADPublicKey[
        key.kid
      ] = `-----BEGIN CERTIFICATE-----\n${key.x5c}\n-----END CERTIFICATE-----`;
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * authorize request using Authorization header, expecting a Bearer token
 * req - request Request<Dictionary<string>>
 * [roles] - array of roles. If empty skip check. The token is authorized if it has any of the roles
 * returns - isAuthorized = true/false.
 */
const isAuthorized = (req, roles) => {
  let token = req.header("authorization").replace("Bearer ", "");
  let isAuthorized = false;

  try {
    const decodedToken = jwt.decode(token, { complete: true });
    const publicKey = azureADPublicKey[decodedToken.header.kid];

    const validatedToken = jwt.verify(token, publicKey, {
      audience: resourceID
    });
    if (roles && roles.length > 0) {
      isAuthorized =
        validatedToken.roles &&
        roles.some(role =>
          validatedToken.roles.some(userRole => userRole === role)
        );
    } else {
      isAuthorized = true;
    }
  } catch (err) {
    console.log(err);
  }
  return isAuthorized;
};

// Generic request handler
app.get("*", (req, res) => {
  console.log(`Request received by the API: ${req.method} ${req.originalUrl}`);
  // if (!isAuthorized(req, ["Radix"])){
  if (!isAuthorized(req, [])) {
    res.sendStatus(403);
    return;
  }

  let output = `
    Request received by the API: ${req.method} ${req.originalUrl}
    Headers: ${JSON.stringify(req.headers, null, 2)}
  `;

  res.send(output);
});

// get public keys used for signing tokens from azure ad
getADPublicKeys(process.env.AZURE_AD_PUBLIC_KEY_URL);

// Start server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

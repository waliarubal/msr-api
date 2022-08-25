"use strict";

const process = require("process");
const express = require("express");
const router = express.Router();
const validator = require("../helper/custom_validators");
const { Client } = require("@microsoft/microsoft-graph-client");
const {
  TokenCredentialAuthenticationProvider,
} = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { DeviceCodeCredential } = require("@azure/identity");

async function getUsers(req, res, next) {
  const credential = new DeviceCodeCredential(
    process.env.TENANT_ID,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: [
      "User.Read.All",
      "Directory.Read.All"
    ],
  });

  const client = Client.initWithMiddleware({
    debugLogging: true,
    authProvider,
  });

  const query = req.query.q;

  let users = await client
    .api("/users")
    .filter(`startswith(displayName, '${query}')`)
    .select("id,displayName,userPrincipalName")
    .get();

  return res.status(200).json({
    success: true,
    message: `List of matching AD users.`,
    data: users.value,
  });
}

router.get("/getUsers", validator.authTokenValidate, getUsers);
module.exports = router;

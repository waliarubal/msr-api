/**
 *  @Author - Vijay Sharma
 *  @AuthorEmail : sharmavijay393@gmail.com
 *  @CreatedDate : 2020-04-26
 *  @ModifiedDate :
 */

require("dotenv").config();
const process = require("process");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

async function config() {
  let dbUsername, dbPassword, dbURL, jwtOptions, jwtSecret, port;
  let env = process.env.ENV ?? "DEV"; //DEV|QA|UAT|PROD

  switch (env) {
    case "DEV":
      dbURL = "mongodb://127.0.0.1/msb";
      jwtOptions = { expiresIn: process.env.JWT_EXPIRY };
      jwtSecret = process.env.JWT_SECRET;
      port = process.env.PORT;
      break;

    case "PROD":
      jwtOptions = { expiresIn: process.env.JWT_EXPIRY };
      jwtSecret = process.env.JWT_SECRET;
      port = process.env.PORT;

      const vaultUri = "https://msrhwlabvault.vault.azure.net/";

      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUri, credential);

      const urlObj = await client.getSecret("MSR-DB-URL");
      dbURL = urlObj.value;

      const userObj = await client.getSecret("MSR-DB-USERNAME");
      dbUsername = userObj.value;

      const passObj = await client.getSecret("MSR-DB-PASSWORD");
      dbPassword = passObj.value;
      break;

    default:
      jwtOptions = { expiresIn: process.env.JWT_EXPIRY };
      jwtSecret = process.env.JWT_SECRET;
      port = process.env.PORT;
      break;
  }

  console.log(`Environment: ${env}`);
  console.log(`dbURL: ${dbURL}`);
  console.log(`dbUsername: ${dbUsername}`);
  console.log(`dbPassword: ${dbPassword}`);

  const config = {
    dbURL,
    dbUsername,
    dbPassword,
    jwtOptions,
    jwtSecret,
    port,
    version: {
      prod: 0,
      dev: 1,
    },
  };

  return Promise.resolve(config);
}

module.exports = config;

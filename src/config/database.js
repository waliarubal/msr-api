const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const configuration = require("./index");

mongoose.set("useCreateIndex", true);
autoIncrement.initialize(mongoose.connection);

async function load() {
  let config = await configuration();

  if (config.dbURL) {
    switch (process.env.ENV) {
      case "DEV":
        mongoose
          .connect(config.dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false,
          })
          .then(() => console.log("Connection to MongoDB successful."))
          .catch((err) => console.error(err));
        break;

      case "PROD":
        mongoose
          .connect(config.dbURL, {
            auth: {
              user: config.dbUsername,
              password: config.dbPassword,
            },
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false,
          })
          .then(() => console.log("Connection to CosmosDB successful."))
          .catch((err) => console.error(err));
        break;
    }
  } else console.log("Environment not supported.");
}

load();

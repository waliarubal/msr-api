"use strict";

const express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  serveIndex = require("serve-index");

const ENV = process.env.ENV;
const PORT = process.env.PORT;
const UPLOADS = "uploads";
const VIDEOS = "videos";

if (!fs.existsSync(`./${UPLOADS}`)) fs.mkdirSync(`./${UPLOADS}`);

const routes = require("./src/routes");
const app = express();

require("./src/config/database");

switch (ENV) {
  case "DEV":
    app.use(cors({ origin: `http://localhost:3001` }));
    break;

  case "PROD":
    app.use(cors());
    break;
}

app.use(
  bodyParser.json({
    limit: "500mb",
    extended: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
  })
);

app.use(morgan("short"));

console.log(path.join(__dirname, UPLOADS));

app.use(
  `/${UPLOADS}`,
  express.static(UPLOADS),
  serveIndex(UPLOADS, { icons: true })
);
app.use(
  `/${VIDEOS}`,
  express.static(VIDEOS),
  serveIndex(VIDEOS, { icons: true })
);

app.use((req, res, next) => {
  let flag;

  if (ENV === "DEV") flag = true;
  else if (ENV === "PROD") flag = false;

  if (req.headers.origin) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    flag = true;
  }
  if (req.headers["access-control-request-method"]) {
    res.header(
      "Access-Control-Allow-Methods",
      req.headers["access-control-request-method"]
    );
    flag = true;
  }
  if (req.headers["access-control-request-headers"]) {
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"]
    );
    flag = true;
  }
  if (flag) {
    res.header("Access-Control-Max-Age", 60 * 60 * 24 * 365);
  }

  // intercept OPTIONS method
  if (flag && req.method == "OPTIONS") res.sendStatus(200);
  else next();
});

app.use("/nodebackend/", routes);
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: "URL not found",
  });
});

module.exports = app;

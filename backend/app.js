var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config({
  path: path.resolve(process.cwd(), `${process.env.NODE_ENV}.env`),
});
var bodyParser = require('body-parser')
var indexRouter = require("./routes/index");
var adminServiceRouter = require("./routes/adminService");
var matchingServiceRouter = require("./routes/matchingService");
var accountServiceRouter = require("./routes/accountService");
const fileUpload = require("express-fileupload");

var app = express();
if (process.env.NODE_ENV == "development")
  app.use(
    logger(
      "Backend :method :url :status :res[content-length] - :response-time ms"
    )
  );
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(fileUpload({
  createParentPath: true
}));

app.use((req, res, next) => {
  const allowedOrigins = [
    "https://app.flatlink.ch",
    "http://localhost:3000",
    "http://192.168.80.176:3000"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);

  }
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});

app.use("/accountService", accountServiceRouter);
app.use("/matchingService", matchingServiceRouter);
app.use("/adminService", adminServiceRouter);

//leave as the last!
app.use("/", indexRouter);

module.exports = app;


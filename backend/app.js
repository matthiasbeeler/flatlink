var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config({path: path.resolve(process.cwd(), `${process.env.NODE_ENV}.env`)});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();
if(process.env.NODE_ENV == "development") app.use(logger('Backend :method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



module.exports = app;

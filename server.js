var builder = require("botbuilder");
var restify = require("restify");
var http = require("http");
var querystring = require("querystring");


var BotConnector = require('./connector');
var dotenv = require('dotenv');

dotenv.load();
BotConnector.start();
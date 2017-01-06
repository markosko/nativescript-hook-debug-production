var hook = require('nativescript-hook')(__dirname);
hook.postinstall();

var path = require("path");
var fs = require("fs");

var projectDir = hook.findProjectDir();
var appDir = path.join(projectDir, "app");


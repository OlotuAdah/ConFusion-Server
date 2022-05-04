const express = require("express");
const cors = require("cors");

const app = express();

const whiteList = ["http://localhost:3000", "https://localhost:3443"];
const corsOptionsDelegate = (req, callback) => {
  const originIdex = req.header("Origin");
  const corsOptions = {};
  if (whiteList.indexOf(originIdex) !== -1)
    corsOptions.origin = true; //attach field origin to the obj & set to true
  else corsOptions.origin = false; //attach field origin to the obj & set to true
  //
  callback(null, corsOptions);
};
exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);

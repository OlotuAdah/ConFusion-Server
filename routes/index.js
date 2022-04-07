var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.setHeader("Content-Type", "Text/html");
  res.send("<h1>Welcome to Express Generator<h1>");
});

module.exports = router;

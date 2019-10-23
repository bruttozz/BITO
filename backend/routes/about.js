var express = require('express');
var router = express.Router();

/* Sample About Page */
router.get('/', function(req, res, next) {
  res.send('This is the coding project for BITO Robotics');
});

module.exports = router;

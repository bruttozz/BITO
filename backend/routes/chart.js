var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Visualization of database using MongoDB Charts, please go to http://localhost:3000 to view the chart!');
});

module.exports = router;

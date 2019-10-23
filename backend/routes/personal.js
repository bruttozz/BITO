var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('Please visit my personal website: www.bruttozhao.com to contect me!');
});

module.exports = router;

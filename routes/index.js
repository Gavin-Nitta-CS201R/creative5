var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var HighScore = mongoose.model('HighScore');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/highscore', (req, res, next) => {
  HighScore.find((err, highscores) => {
    if (err) { return next(err); }
    res.json(highscores);
  }).sort({ 'score': -1 }).limit(10);
});

router.post('/highscore', (req, res, next) => {
  var highscore = new HighScore(req.body);
  highscore.save((err, highscore) => {
    if (err) { return next(err); }
    res.json(highscore);
  });
});

module.exports = router;

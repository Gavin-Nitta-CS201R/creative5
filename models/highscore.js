var mongoose = require('mongoose');
var HighScoreSchema = new mongoose.Schema({
  name: String,
  score: { type: Number, default: 0 },
});

mongoose.model('HighScore', HighScoreSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreboardSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Scoreboard = mongoose.model('scoreboards', ScoreboardSchema);
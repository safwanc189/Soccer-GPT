const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

// MongoDB connection string with the database name
const uri = 'mongodb://localhost:27017/chat-bot';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Define schema for the 'football' collection
  const footballSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Player_Name: String,
    Club: String,
    Goals_Scored: Number,
    Assists: Number,
    Matches_Played: Number,
    Year: Number
  }, { collection: 'football' });

  // Create a model
  const FootballPlayer = mongoose.model('FootballPlayer', footballSchema);

  app.use(bodyParser.json());
  app.use(cors());

  // Load all player names into memory
  let playerNames = [];
  try {
    const players = await FootballPlayer.find({}, { Player_Name: 1 });
    playerNames = players.map(player => player.Player_Name.toLowerCase());
    console.log('Loaded player names:', playerNames);
  } catch (err) {
    console.error('Error loading player names:', err);
  }

  // Function to handle user questions
  const handleUserQuestion = async (question) => {
    const normalizedQuestion = question.toLowerCase();

    if (normalizedQuestion.includes('who is')) {
      const playerName = normalizedQuestion.replace('who is', '').trim().toLowerCase();
      const playerStats = await FootballPlayer.findOne({ Player_Name: { $regex: new RegExp('^' + playerName, 'i') } });
      if (playerStats) {
        return `Player Stats for ${playerStats.Player_Name}:
        Club: ${playerStats.Club}
        Goals Scored: ${playerStats.Goals_Scored}
        Assists: ${playerStats.Assists}
        Matches Played: ${playerStats.Matches_Played}
        Year: ${playerStats.Year}`;
      } else {
        return `No stats found for player ${playerName}.`;
      }
    } else if (normalizedQuestion.includes('best player')) {
      const bestPlayer = await FootballPlayer.findOne().sort({ Goals_Scored: -1 });
      if (bestPlayer) {
        return `The best player is ${bestPlayer.Player_Name} with ${bestPlayer.Goals_Scored} goals scored.`;
      } else {
        return 'No player data found.';
      }
    } else if (normalizedQuestion.includes('top scorers')) {
      const topScorers = await FootballPlayer.find().sort({ Goals_Scored: -1 }).limit(5);
      if (topScorers.length > 0) {
        const topScorersList = topScorers.map(player => `${player.Player_Name} (${player.Goals_Scored} goals)`);
        return `Top Scorers:\n${topScorersList.join('\n')}`;
      } else {
        return 'No top scorers found.';
      }
    } else if (normalizedQuestion.includes('who plays for')) {
      const clubName = normalizedQuestion.replace('who plays for', '').trim();
      const players = await FootballPlayer.find({ Club: { $regex: new RegExp('^' + clubName, 'i') } });
      if (players.length > 0) {
        const playerNames = players.map(player => player.Player_Name);
        return `Players who play for ${clubName}: ${playerNames.join(', ')}`;
      } else {
        return `No players found for club ${clubName}.`;
      }
    } else if (normalizedQuestion.includes('how many goals did')) {
      const playerName = normalizedQuestion.replace('how many goals did', '').replace('score', '').trim();
      const playerStats = await FootballPlayer.findOne({ Player_Name: { $regex: new RegExp('^' + playerName, 'i') } });
      if (playerStats) {
        return `${playerStats.Player_Name} scored ${playerStats.Goals_Scored} goals.`;
      } else {
        return `No stats found for player ${playerName}.`;
      }
    } else if (normalizedQuestion.includes('what club does')) {
      const playerName = normalizedQuestion.replace('what club does', '').replace('play for', '').trim();
      const playerStats = await FootballPlayer.findOne({ Player_Name: { $regex: new RegExp('^' + playerName, 'i') } });
      if (playerStats) {
        return `${playerStats.Player_Name} plays for ${playerStats.Club}.`;
      } else {
        return `No stats found for player ${playerName}.`;
      }
    
    } else if (normalizedQuestion.includes('how many matches were played by')) {
      const playerName = normalizedQuestion.replace('how many matches were played by', '').trim();
      const playerStats = await FootballPlayer.findOne({ Player_Name: { $regex: new RegExp('^' + playerName, 'i') } });
      if (playerStats) {
        return `${playerStats.Player_Name} played ${playerStats.Matches_Played} matches.`;
      } else {
        return `No stats found for player ${playerName}.`;
      }
    } else if (normalizedQuestion.includes('who has the most assists in')) {
      const year = normalizedQuestion.replace('who has the most assists in', '').trim();
      const topAssists = await FootballPlayer.findOne({ Year: year }).sort({ Assists: -1 });
      if (topAssists) {
        return `${topAssists.Player_Name} has the most assists in ${year} with ${topAssists.Assists} assists.`;
      } else {
        return `No data found for the most assists in ${year}.`;
      }
    
    } else if (normalizedQuestion.includes('give me the details of')) {
      const playerName = normalizedQuestion.replace('give me the details of', '').trim();
      const playerStats = await FootballPlayer.findOne({ Player_Name: { $regex: new RegExp('^' + playerName, 'i') } });
      if (playerStats) {
        return `Player Stats for ${playerStats.Player_Name}:
        Club: ${playerStats.Club}
        Goals Scored: ${playerStats.Goals_Scored}
        Assists: ${playerStats.Assists}
        Matches Played: ${playerStats.Matches_Played}
        Year: ${playerStats.Year}`;
      } else {
        return `No stats found for player ${playerName}.`;
      }
      
    }
    

    return 'I am not sure how to answer that question.';
  };

  app.post('/api/chat', async (req, res) => {
    const { question } = req.body;
    let answer = '';

    console.log('Received question:', question);

    if (question.trim().toLowerCase() === 'hi') {
      answer = 'Hi, how can I help you?';
    } else {
      try {
        answer = await handleUserQuestion(question);
      } catch (err) {
        console.error('Error processing question:', err);
        answer = 'An error occurred while processing your question.';
      }
    }

    console.log('Generated answer:', answer);

    res.json({ answer });
  });

  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  });

  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
  });
});

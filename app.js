const express = require('express')
const fs = require('fs');
const cors = require('cors');
const multer  = require('multer')
const { formatWithOptions } = require('util');

// Create Express app
const app = express()
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/teamlogos')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage });

const timerData = 'timer.json'
const currentGameData = 'currentGame.json';
const currentStandingData = 'currentStanding.json';
const nextGameData = 'nextGame.json';
const allTeamsData = 'teams.json';
const scoreboardData = 'scoreboard.json';

// Initialize the countdown
setInterval(() => {
  let rawdata = fs.readFileSync(timerData);
  let timer = JSON.parse(rawdata);
  if (!timer || !timer.timer || timer.timer <= 0) return;
  timer.timer -= 1;
  fs.writeFile(timerData, JSON.stringify(timer), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
}, 1000);

// A sample route
app.get('/', (req, res) => {
  // return timer from timer file.
  let rawdata = fs.readFileSync(timerData);
  let timer = JSON.parse(rawdata);
  return res.json(timer);
});

app.post('/', (req, res) => {
  // save to timer file
  console.log(req.body);
  timer = {
    "timer": req.body.timer
  }
  fs.writeFile(timerData, JSON.stringify(timer), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('new timer saved!');
  });
  return res.sendStatus(200);
});

app.post('/logs', (req, res) => {
  // save log to file
  console.log(req.body)
  fs.appendFile('logger.txt', JSON.stringify(req.body) + ",", (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
  });
  return res.sendStatus(201);
});

app.get('/current-game', (req, res) => {
  let rawdata = fs.readFileSync(currentGameData);
  let currentGame = JSON.parse(rawdata);
  rawdata = fs.readFileSync(allTeamsData);
  let allTeams = JSON.parse(rawdata).teams;
  let team1 = allTeams.find(x => x.id === currentGame.teams[0].id);
  let team2 = allTeams.find(x => x.id === currentGame.teams[1].id);
  currentGame.teams[0].name = team1.name
  currentGame.teams[0].logo = team1.logo
  currentGame.teams[1].name = team2.name
  currentGame.teams[1].logo = team2.logo
  if (!currentGame || !currentGame.teams) return res.sendStatus(500);
  return res.json(currentGame);
});


app.put('/current-game', (req, res) => {
  console.log(req.body)
  let currentGame = req.body;
  if (!currentGame || !currentGame.bestOf || currentGame.bestOf <= 0) return res.sendStatus(501);
  if (!currentGame || !currentGame.gameNr || currentGame.gameNr <= 0) return res.sendStatus(502);
  if (!currentGame || !currentGame.teams || currentGame.teams.length <= 1) return res.sendStatus(503);
  fs.writeFile(currentGameData, JSON.stringify(currentGame), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('current game updated');
  });
  return res.sendStatus(200);
});

app.post('/swap-current-teams', (req, res) => {
  let rawdata = fs.readFileSync(currentGameData);
  let currentTeams = JSON.parse(rawdata);
  if (!currentTeams || !currentTeams.teams) return res.sendStatus(500);
  currentTeams.teams.reverse();
  fs.writeFile(currentGameData, JSON.stringify(currentTeams), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
  return res.sendStatus(200);
});

app.get('/next-game', (req, res) => {
  let rawdata = fs.readFileSync(nextGameData);
  let nextGame = JSON.parse(rawdata);
  rawdata = fs.readFileSync(allTeamsData);
  let allTeams = JSON.parse(rawdata).teams;
  let team1 = allTeams.find(x => x.id === nextGame.teams[0].id);
  let team2 = allTeams.find(x => x.id === nextGame.teams[1].id);
  nextGame.teams[0].name = team1.name
  nextGame.teams[0].logo = team1.logo
  nextGame.teams[1].name = team2.name
  nextGame.teams[1].logo = team2.logo
  if (!nextGame || !nextGame.teams) return res.sendStatus(500);
  return res.json(nextGame);
});


app.put('/next-game', (req, res) => {
  let nextGame = req.body;
  if (!nextGame || !nextGame.bestOf || nextGame.bestOf <= 0) return res.sendStatus(501);
  if (!nextGame || !nextGame.teams || nextGame.teams.length <= 1) return res.sendStatus(503);
  fs.writeFile(nextGameData, JSON.stringify(nextGame), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('current game updated');
  });
  return res.sendStatus(200);
});

app.post('/swap-next-game', (req, res) => {
  let rawdata = fs.readFileSync(nextGameData);
  let nextTeams = JSON.parse(rawdata);
  if (!nextTeams || !nextTeams.teams) return res.sendStatus(500);
  nextTeams.teams.reverse();
  fs.writeFile(nextGameData, JSON.stringify(nextTeams), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
  return res.sendStatus(200);
});

app.get('/teams', (req, res) => {
  let rawdata = fs.readFileSync(allTeamsData);
  let allTeams = JSON.parse(rawdata);
  if (!allTeams || !allTeams.teams) return res.sendStatus(500);
  return res.json(allTeams);
});

app.post('/teams', (req, res) => {
  let newTeam = req.body;
  console.log(newTeam)
  // fs.writeFile(nextGameData, JSON.stringify(nextGame), (err) => {
  //   // throws an error, you could also catch it here
  //   if (err) throw err;

  //   // success case, the file was saved
  //   console.log('current game updated');
  // });
  return res.sendStatus(200);
});

app.get('/scoreboard', (req, res) => {
  let rawdata = fs.readFileSync(scoreboardData);
  let scoreboard = JSON.parse(rawdata);
  if (!scoreboard) return res.sendStatus(500);

  let accumulatedScoreboard = [
    {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }, {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }, {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }, {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }, {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }, {
      id: '',
      name: '',
      assists: 0,
      demos: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      touches: 0,
      cartouches: 0,
      score: 0,
    }];

  if (scoreboard.scoreboard.length == 0) return res.json({ scoreboard: accumulatedScoreboard });

  for (const el of scoreboard.scoreboard) {
    for (let i = 0; i < 6; i++) {
      accumulatedScoreboard[i].id = el[i].id
      accumulatedScoreboard[i].name = el[i].name
      accumulatedScoreboard[i].assists += el[i].assists
      accumulatedScoreboard[i].demos += el[i].demos
      accumulatedScoreboard[i].goals += el[i].goals
      accumulatedScoreboard[i].saves += el[i].saves
      accumulatedScoreboard[i].shots += el[i].shots
      accumulatedScoreboard[i].touches += el[i].touches
      accumulatedScoreboard[i].cartouches += el[i].cartouches
      accumulatedScoreboard[i].score += el[i].score
    }
  }

  return res.json({ scoreboard: accumulatedScoreboard });
});

// adds a game to current scoreboard
app.put('/scoreboard', (req, res) => {
  let gameInformation = req.body;
  let rawdata = fs.readFileSync(scoreboardData);
  let scoreboard = JSON.parse(rawdata);
  if (!scoreboard) return res.sendStatus(505);
  scoreboard.scoreboard.push(gameInformation);
  fs.writeFile(scoreboardData, JSON.stringify(scoreboard), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
  return res.sendStatus(200);
});

app.post('/create-team', upload.single('file'), (req, res) => {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any 
  console.log(req.file, req.body)

  let rawdata = fs.readFileSync(allTeamsData);
  let allTeams = JSON.parse(rawdata);
  console.log(allTeams)
  let newId = allTeams.teams[allTeams.teams.length-1].id + 1
  let fileName = req.file.originalname
  let teamName = req.body.teamName
  let team = {
    id: newId, 
    name: teamName, 
    logo: fileName
  };
  allTeams.teams.push(team)

  fs.writeFile(allTeamsData, JSON.stringify(allTeams), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
  return res.sendStatus(200);
});

app.post('/reset-scoreboard', (req, res) => {
  let rawdata = fs.readFileSync(scoreboardData);
  let scoreboard = JSON.parse(rawdata);
  if (!scoreboard) return res.sendStatus(500);
  let ts = new Date();
  fs.writeFile('old_games/blabla.json', JSON.stringify(scoreboard), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });
  let filename = 'old_games/' + ts.toISOString().split('.')[0].replace(/:/g, '') + '.json';
  fs.writeFile(filename, JSON.stringify(scoreboard), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });

  scoreboard.scoreboard = []
  fs.writeFile(scoreboardData, JSON.stringify(scoreboard), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });

  return res.sendStatus(200);
});

app.get('/current-standing', (req, res) => {
  let rawdata = fs.readFileSync(currentStandingData);
  let currentStandings = JSON.parse(rawdata).currentStanding;
  rawdata = fs.readFileSync(allTeamsData);
  let allTeams = JSON.parse(rawdata).teams;

  for(i = 0; i < currentStandings.length; i++){
    let team = allTeams.find(x => x.id === currentStandings[i].id)
    currentStandings[i].name = team.name
    currentStandings[i].logo = team.logo
  }

  if (!currentStandings || currentStandings.length != 8) return res.sendStatus(500);
  return res.json(currentStandings);
});

app.put('/current-standing', (req, res) => {
  console.log(req.body)
  let currentstandings = req.body;
  if (!currentstandings ) return res.sendStatus(401);
  fs.writeFile(currentStandingData, JSON.stringify(currentstandings), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('current standings updated');
  });
  return res.sendStatus(200);
});


// Start the Express server
app.listen(3002, () => console.log('Server running on port 3002!'))
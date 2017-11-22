var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var resultData = {sentiment: [], dominance: []};
var chartData = [];
var dominanceData = [];

// Constants
const PORT = 8080;

app.use( bodyParser.json() );
app.use(express.static(__dirname + "/static"))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  io.emit('event', resultData);
});

app.post('/req', function(req, res){
  if(typeof req.body.valence === 'number' && isFinite(req.body.valence)) {
    chartData.push(req.body.valence);
  }

  if(typeof req.body.dominance === 'number' && isFinite(req.body.dominance)) {
    dominanceData.push(req.body.dominance);
  }
  res.send();
});

setInterval(function() {
  var count = 0.0;
  var i = 0;
  for(i = 0; i < chartData.length; i++) {
    count += chartData[i];
  }
  var result = count / chartData.length;

  var dominanceCount = 0.0;
  for(i = 0; i < dominanceData.length; i++) {
    dominanceCount += dominanceData[i];
  }
  var dominanceResult = dominanceCount / dominanceData.length;

  if(typeof result === 'number' && isFinite(result) && typeof dominanceResult === 'number' && isFinite(dominanceResult)) {
    var obj = {t: new Date(),y: result }
    resultData.sentiment.push(obj);

    obj = {t: new Date(), y: dominanceResult};
    resultData.dominance.push(obj);

    io.emit('event', resultData);
    if(resultData.sentiment.length > 20)
    {
      resultData.sentiment.shift();
    }

    if(resultData.dominance.length > 20)
    {
      resultData.dominance.shift();
    }
  }

  chartData = [];
  dominanceData = [];
}, 10000);



http.listen(PORT, function () {
  console.log('Sentiment chart prototype listening on port ${PORT}');
});

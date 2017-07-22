/* this is a single implementation of a webchat backend using websockets */
/* http connection upgrade and serving client.html interface not finished as of yet*/
/* readFile writeFile close file on every call (innefective), rewrite to readStream and writeStream */
const crypto = require('crypto');
const fs = require('fs');
const server = require('ws').Server; // create a new server of websocket(ws) instance - only dependency "ws"
const server1 = new server({port:5001});
const colorArray = ["blue", "red", "yellow", "green", "brown", "black"];
const activeUsers = []; // store active users information !! check if const is ok
var logData = []; // store temporary log data

//if the server crashes, load the last log data from temp, do this on every start, asynchronously
//this load is async, might get loaded after new messages (high imporabable though)
loadTempAsync();

server1.on('connection', function(ws) {

  initNewSocketClient(ws, activeUsers); //create websocket client's ID, name, color;
  sendLog(ws, logData); //send the new websocket client old log data about chat history upon connection
  sendActiveUsers(ws, activeUsers); //send ctiveUsers information aswell

  ws.on('message', function(message) {
    console.log(message);
    message = message + ws.color; // add unique color information based on socket id - update message
    checkNameSetName(ws, message, activeUsers); // check if the name hasn't changed, if yes, push to all clients
    pushToLogAndTemp(logData, message); //store data to session (and in temp aswell)
    fs.appendFile('final.txt', message+"\n", function(error) { //store session data in persisent storage - "final.txt"
       if (error) {return console.error(error);}});
    sendAll(message); //resend the new message to every connection
    });

  ws.on('close', function() {
    console.log('client lost', ws.idx, ws.name);
    removeFromActiveUsers(ws, activeUsers);
    });
});

// --- end of code --- //

// functions defined below

function pushToLogAndTemp(log, message) {
  //remove the eldest element (which is on the first position)
  if (log.length > 30) {log.shift();}
  log.push(message);
  // on every new message, push into session, clear temp, copy session to temp, repeat
  fs.truncate('temp.txt', 0, function(){console.log('temp file cleared')});
  //write the current session into temp again to keep data up-to-date
  // rewrite to createReadStream instead
  for (var i = 0; i<log.length; i++) {
    fs.appendFile('temp.txt', logData[i]+"\n", function(error) {
       if (error) {return console.error(err);}});
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function initNewSocketClient(wsClient, storage) {
  wsClient.idx = crypto.randomBytes(6).toString('hex'); // unique ID
  wsClient.color = colorArray[getRandomInt(0, colorArray.length)];
  wsClient.name = ""; //wait for client to pick his name
  storage.push([wsClient.idx, wsClient.name, wsClient.color]);
  console.log(storage);
}

function sendLog(wsClient,source) {
  for (var i=0;i<source.length;i++) {
      wsClient.send(source[i]);}
}

function sendActiveUsers(wsClient, source) {
  for (var i=0;i<source.length;i++) {
    wsClient.send(getActiveUsers(source));}
}

function removeFromActiveUsers(ws, source) {
  for (var x = 0; x<source.length;x++) {
      if (source[x][0] == ws.idx) {
        source.splice(x,1);
        console.log(source);
        sendAll(getActiveUsers(source));
      }
    }
}

function checkNameSetName(ws, message, nameSource) {
  var newMessage = parser(message, ":");
  if (newMessage[0] == "msg" && ws.name != newMessage[1]) { // check if the message contains a different!! name!
    console.log(nameSource);
    ws.name = newMessage[1]; // set the new name
    for (var x = 0; x<activeUsers.length;x++) {
        if (nameSource[x][0] == ws.idx && nameSource[x][1] != ws.name) {
            nameSource[x][1] = ws.name; // update name
            sendAll(getActiveUsers(nameSource)); // broadcast the new modified AciveUsers
          }
        }
  }
}

function getActiveUsers(nameSource) {
	var dataString = "name";
  for (var z = 0; z<nameSource.length; z++) {
    dataString = dataString + ":" + nameSource[z][1] + ":" + nameSource[z][2]; // "name:color"...
  }
  return dataString; // returns a string in a specified message format for the frontend
}

function sendAll(message) {
  server1.clients.forEach(function (socket) {socket.send(message);});
}

function loadTempAsync() {
  fs.readFile('temp.txt', function(error, buffer) {
      if (error) {console.error(error)};
      buffer = buffer.toString().split("\n");
      logData = buffer;
  });
}
// because why would I use .join()?:) (parser is not intended for production code)
function parser(string, delimiter) {
  var final = [];
  var memory = 0;
  var current = 0;
  for (current; current<=string.length; current++) {
    if (string[current] == delimiter || current == string.length) {
      final.push(string.slice(memory,current));
      memory = current+1;
    }
  }
  return final;
}

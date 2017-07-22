// make the connection using native browser API
const sock = new WebSocket('ws://127.0.0.1:5001');
const log = document.getElementById('log');
const users = document.getElementById('users');
console.log("success");

//receive message event - bind event listener
sock.onmessage = function(event) {
  console.log(event.data);
  var data = parser(event.data, ":");
  //if data == message, do below
  var ForeignIDColor = data[3];
  if (data[0] == "msg") { // msg:username:text:color
    console.log(ForeignIDColor);
    log.innerHTML += "<span style='color:" + ForeignIDColor + "'>" + event.data + "</span>" + "<br />"; //event object
  }
  //if data == drawing, do below
  if (data[0] == "drw") { // drw:x:y:color
    content.strokeStyle = data[3]; //get the foreignID color to Identify
    paint(data[1], data[2]); // data[2] == x, data[3] == y
  }
  //if data == name, do below
  if (data[0] == "name") { // name:color:name:color:name:color......
    users.innerHTML = ""; // reload the whole innerHTML on every call
    for (var z = 1; z<data.length-1; z++) { //omit the first data as its metadata "name"
      if (z % 2 != 0) { // update only when z == even, since odd data contain color information, even contain name data
      users.innerHTML += "<span style='color:" + data[z+1] + "'>" + data[z] + "</span>" + "<br />"; // you know that z is data, z+1 is even and even == color
      }
    }
  }
  log.scrollTop = log.scrollHeight;
}

//send message event - bind event listener
document.querySelector('button').onclick = function () {
  //collect data
  var text=document.getElementById('text').value;
  var name=document.getElementById('name').value;
  //the data contains the user color, the user name, and the user text
  var fullMessage = "msg" + ":" + name + ":" + text + ":";
  //remove old data
  document.getElementById('text').value = "";
  // send the message to the server by this method
  sock.send(fullMessage);
  // scroll the log down
  log.scrollTop = log.scrollHeight;
}

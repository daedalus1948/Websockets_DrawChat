const canvas = document.querySelector('canvas');
canvas.mousedown = false;
const content = canvas.getContext('2d');

function initCanvas() {
  canvas.height = 400;
  canvas.width = 400;
  content.lineWidth = 10;
  content.lineCap = 'round';
  console.log("canvas initalized");
}

function paint(x,y) {
  content.beginPath();
  content.moveTo(x,y);
  content.lineTo(x,y);
  content.stroke();
  content.closePath();
}

// define event handlers
function onmousemove(event) {
  if (canvas.mousedown == true) {
    var x = event.clientX;
    var y = event.clientY;
    //find the relative position of canvas on the screen
    //since clientX/Y coordinates are taken form the whole window
    var offsetX=canvas.offsetLeft;
    var offsetY=canvas.offsetTop;
    //send data only if other client starts drawing - that is why it is this function
    var currentX = x-offsetX;
    var currentY = y-offsetY;
    //send your paint data to all other clients
    sock.send("drw"+":"+currentX+":"+currentY +":"); // drw:x:y:
    //paint at mouse coordinates minus canvas offset to get the true canvas x,y
    console.log("painting");
  }
}

function onmousedown(event) {
  canvas.mousedown = true;
}

function onmouseup(event) {
  canvas.mousedown = false;
}

//initialize canvas
initCanvas();
// append event handlers
canvas.addEventListener('mousemove', onmousemove, false);
canvas.addEventListener('mousedown', onmousedown, false);
canvas.addEventListener('mouseup', onmouseup, false);

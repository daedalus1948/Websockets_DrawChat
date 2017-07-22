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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

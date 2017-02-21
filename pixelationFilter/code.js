var PIXSIZE = 8;
var NUMPIX = 16;
var BUFFER = 1;
var hexMode = false;

var canvasSize = PIXSIZE * NUMPIX + (BUFFER + NUMPIX) * PIXSIZE;
createCanvas("inputCanvas", canvasSize, canvasSize);
setPosition("inputCanvas", 10,15);
setActiveCanvas("inputCanvas");
setStrokeColor("rgba(0,0,0,0.0)");

createCanvas("outputCanvas", canvasSize, canvasSize);
setPosition("outputCanvas", 165, 15);
setActiveCanvas("outputCanvas");
setStrokeColor("rgba(0,0,0,0.0)");

var startingBits = "001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001010010010010010010010010010010001001001001001010010010010010010010100010010010010001001001001010010010010010010010010010010010010001001001001010100010010010010010010010010010010001001001001010010010010010010010010010010010010001001001001010010010010010010010010010010010010001001001001010010010010010010010010010100010010001001001001001010010010010010010010010010010001001001001001001001001001001110110001001001001001001001001001001001001001001110110001001001001001001001001001001001001001001110110001001001001001001001001001001001001001001110110001001001001001001001010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010010";

setText("inputBits", startingBits);
drawBits("inputBits", "inputCanvas");
filterBits();
drawBits("outputBits","outputCanvas");

function drawBits(source, canvasName){
  setActiveCanvas(canvasName);
  clearCanvas();
  var bits = getText(source);
  var x = 0;
  var y = 0;
  var xLoc = BUFFER;
  var yLoc = BUFFER;
  bits = bits.replace(/\s/g,'');
  for(var i = 0; i < bits.length; i = i + 3){
    var pixBits = bits.slice(i,i+3);
    bitsColorPicker(pixBits);
    rect(xLoc, yLoc, PIXSIZE, PIXSIZE);
    x += 1;
    xLoc = xLoc + BUFFER + PIXSIZE;
    if(x >= NUMPIX){
      x = 0;
      xLoc = BUFFER;
      y += 1;
      yLoc = yLoc + BUFFER + PIXSIZE;
    }
  }
}

function filterBits(){
  var bits = getText("inputBits");
  var outputBits = ""
  bits = bits.replace(/\s/g,'');
  var base = 2;
  if (hexMode){
    base = 16;
  }
  for(var i = 0; i < bits.length; i = i + 3){
    var pixBits = bits.slice(i,i+3);
    var red = parseInt(pixBits[0],base);
    var green = parseInt(pixBits[1],base);
    var blue = parseInt(pixBits[2],base)
    var newRed = eval(getText("redCode"));
    var newGreen = eval(getText("greenCode"));
    var newBlue = eval(getText("blueCode"));
    newRed = ((newRed * 1)%base);
    while(newRed < 0){
      newRed += base;
    }
    newGreen = ((newGreen * 1)%base);
    while(newGreen < 0){
      newGreen += base;
    }
    newBlue = ((newBlue * 1)%base);
    while(newBlue < 0){
      newBlue += base;
    }
    newRed = newRed.toString(base)
    newGreen = newGreen.toString(base);
    newBlue = newBlue.toString(base);
    outputBits = outputBits + newRed + newGreen + newBlue;
  }
  setText("outputBits",outputBits);
}

onEvent("filterButton", "click", function(){
  filterBits();
  drawBits("outputBits","outputCanvas");
});

onEvent("inputBits","input", function(){
  drawBits("inputBits","inputCanvas");
});

function bitsColorPicker(bits){
  bits += "000";
  if(hexMode){
    var r = parseInt(bits[0],16)*16;
    var g = parseInt(bits[1],16)*16;
    var b = parseInt(bits[2],16)*16;
    setFillColor("rgb("+r+","+g+","+b+")");
  } else {
    setFillColor("rgb("+(bits[0]*255)+","+(bits[1]*255)+","+(bits[2]*255)+")");
  }
}

onEvent("cleanInputButton", "click", function() {
  cleanBits("inputBits");
});

onEvent("cleanOutputButton", "click", function() {
  cleanBits("outputBits");
});

onEvent("rawInputButton", "click", function() {
  rawBits("inputBits");
});

onEvent("rawOutputButton", "click", function() {
  rawBits("outputBits");
});

function rawBits(source){
  var bits = getText(source);
  var rawedBits = bits.replace(/\s/g,'');
  setText(source, rawedBits);
}

function cleanBits(source){
  var bits = getText(source);
  var cleanedBits = "";
  bits = bits.replace(/\s/g,'');
  var rowCount = 0;
  for(var i = 0; i < bits.length; i = i + 3){
    var pixBits = bits.slice(i,i+3);
    cleanedBits = cleanedBits + pixBits + " ";
    rowCount++;
    if(rowCount > NUMPIX){
      rowCount = 0;
      cleanedBits += "\n";
    }
  }
  setText(source, cleanedBits);
}

onEvent("howItWorks", "click", function() {
  showElement("instructions");
  showElement("closeInstructionsButton");
});

onEvent("closeInstructionsButton", "click", function() {
  hideElement("instructions");
  hideElement("closeInstructionsButton");
});

onEvent("hexBinary", "click", function(){
  hexMode = !hexMode;
  if(hexMode){
    setText("hexBinary", "Switch to Bin");
  } else {
    setText("hexBinary", "Switch to Hex");
  }
})

var difficulty = 15;
var correctSquare;
var p1Score = 0;
var p2Score = 0;
var currentPlayer = 1;

setBoard();
function setBoard() {
  
  //setup all 9 buttons with same background
  var r = randomNumber(5,250);
  var g = randomNumber(5,250);
  var b = randomNumber(5,250);
  var colorString = "rgb(" + r + "," + g + "," + b + ")";
  setProperty("button1", "background-color", colorString);
  setProperty("button2", "background-color", colorString);
  setProperty("button3", "background-color", colorString);
  setProperty("button4", "background-color", colorString);
  setProperty("button5", "background-color", colorString);
  setProperty("button6", "background-color", colorString);
  setProperty("button7", "background-color", colorString);
  setProperty("button8", "background-color", colorString);
  setProperty("button9", "background-color", colorString);
  
  //pick random square to modify color and update background
  correctSquare = randomNumber(1,9);
  if(randomNumber(0,100)<25){
    correctSquare = "0";
    console.log("no diff");
  }
  else{
    r += difficulty;
    b += difficulty;
    g += difficulty;
    var colorString = "rgb(" + r + "," + g + "," + b + ")";
    setProperty("button" +correctSquare, "background-color", colorString);
  }
}

function checkCorrect(squareNumber){
  if(squareNumber == correctSquare){
    updateScore(1);
  }
  else{
    updateScore(-1)
  }
  
  endTurn();

}

function updateScore(scoreChange){
  if(currentPlayer == 1){
    p1Score += scoreChange;
    setText("score1", p1Score);
  }
  else{
    p2Score += scoreChange;
    setText("score2", p2Score);
  }
}

function endTurn(){
  hideElement("player1lbl");
  hideElement("player2lbl");
  if(currentPlayer == 1){
    currentPlayer = 2;
    showElement("player2lbl");
  }
  else{
    currentPlayer = 1;
    showElement("player1lbl");
  }
  setBoard();
}

//Setup button even handlers to check if the correct color was picked
onEvent("button1", "click", function(event) {
  checkCorrect(1);
});
onEvent("button2", "click", function(event) {
  checkCorrect(2);
});

onEvent("button3", "click", function(event) {
  checkCorrect(3);
});

onEvent("button4", "click", function(event) {
  checkCorrect(4);
});

onEvent("button5", "click", function(event) {
  checkCorrect(5);
});

onEvent("button6", "click", function(event) {
  checkCorrect(6);
});

onEvent("button7", "click", function(event) {
  checkCorrect(7);
});

onEvent("button8", "click", function(event) {
  checkCorrect(8);
});

onEvent("button9", "click", function(event) {
  checkCorrect(9);
});

onEvent("button10", "click", function(event) {
  checkCorrect(0);
});

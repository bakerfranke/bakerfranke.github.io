// This examplar shows the game-over condition
// suggested in the lesson - first to 10.
// NOTE: it gives an unfair advantage to player1. If the score
// is 9-9 and player 1 guesses correctly, the game ends immedidately
// without player 2 getting a chance.

// Global variables
var p1Score=0;
var p2Score=0;
var currentPlayer = 1;
var randButtonId = 1;

setBoard();   

function setBoard() {
  var R = randomNumber(0,235);
  var G = randomNumber(0,235);
  var B = randomNumber(0,235);
  var color = "rgb("+R+", "+G+", "+B+")";
  setProperty("button1", "background-color", color);
  setProperty("button2", "background-color", color);
  setProperty("button3", "background-color", color);
  setProperty("button4", "background-color", color);

  R = R+20; 
  G = G+20;
  B = B+20;
  var diffColor = "rgb("+R+", "+G+", "+B+")";
  randButtonId = "button"+randomNumber(1,4);
  setProperty(randButtonId, "background-color", diffColor);
  console.log("correct button is: "+randButtonId);
}

function checkCorrect(buttonId) {
  console.log("checking: "+buttonId);
  if( buttonId == randButtonId ) {
      console.log("You got it right!");
      updateScoreBy(1);
  } else {
      console.log("WRONG");
      updateScoreBy(-3);
  }
  checkGameOver();
  setBoard();
  switchPlayer();
}

// implements simple "first to 10" game over rule

function checkGameOver(){
   
  if(p1Score >= 10 || p2Score >= 10){            // if anyone is over 10 points the game is over
      setScreen("gameOver_screen");
      if(p1Score > p2Score){                    // figure out who won and show the label
          showElement("player1Win_label");
      } else {
          showElement("player2Win_label");
      }
  }
    
}

function updateScoreBy(amt){
  if(currentPlayer==1){
    p1Score += amt;
  }
  else{
    p2Score += amt;
  }
  console.log("P1 Score: "+p1Score);
  console.log("P2 Score: "+p2Score);
  setText("score1_label", p1Score);
  setText("score2_label", p2Score);
}

function switchPlayer(){
  if(currentPlayer==1){
    currentPlayer=2;
    showElement("player2_highlight");
    hideElement("player1_highlight");
  } else {
    currentPlayer=1;
    showElement("player1_highlight");
    hideElement("player2_highlight");
  }
  console.log("current player: "+currentPlayer);
}

onEvent("button1", "click", function() {
  checkCorrect("button1");
});
onEvent("button2", "click", function() {
  checkCorrect("button2");
});
onEvent("button3", "click", function() {
  checkCorrect("button3");
});
onEvent("button4", "click", function() {
  checkCorrect("button4");
});

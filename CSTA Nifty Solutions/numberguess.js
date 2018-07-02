var moves = {};
var prev4 = "0000";
setupMoves();
var score = 0;
var numTrials = 0;
var DEBUG = false;
function resetSimulation(){
   moves = {};
 prev4 = "0000";
setupMoves();
 score = 0;
 numTrials = 0;
}

function userChoice(bin){
  numTrials++;
  log("prev4: "+prev4);
  log("moves: "+JSON.stringify(moves[prev4]));
  var old_prev4 = prev4;
  
  var pred = getPrediction();
  logChoice(bin);
  log("prediction: "+pred);
  log("userChoice: "+bin);
  
  log("[after]prev4: "+prev4);
  log("old_moves: "+JSON.stringify(moves[old_prev4]));
  
  if(pred == bin){
    score--;
  }
  else{
    score++;
  }
  //console.log("score: "+score);
  
}

function log(str){
  if(DEBUG==false) return;
  else console.log(str);
}

function setupMoves(){
  for(var i=0; i<16; i++){
    var nextBin = i.toString(2);
    nextBin = "0000".substring(nextBin.length)+nextBin;
    moves[nextBin]={0:0, 1:0};
  }
}

function logChoice(bin){
  moves[prev4][bin]++;
  prev4 = (prev4+""+bin).substring(1);
}

function getPrediction(){
  if(moves[prev4][0] > moves[prev4][1]){
    return 0;
  }
  else if(moves[prev4][0] < moves[prev4][1]){
    return 1;
  }
  else{
    return Math.round(Math.random());
  }
}

function runTrials(nTrials){
  resetSimulation();
  for(var i=0; i<nTrials; i++){
      userChoice(Math.round(Math.random()));

      if(i%(nTrials/10) == 0){
        console.log("num_trials: "+numTrials);
        console.log("score: "+score);
        console.debug(moves);
      }
  }
}


// function updatePredictionText(){
//   var str = "prev4: "+prev4;
//   str += "\n moves[prev4]: "+JSON.stringify(moves[prev4]);
//   str += "\n PREDICTION: "+getPrediction();
//   str += "\n numTrials: "+numTrials;
  
//   setText("prediction_txt",str);
// }

// function updateScore(){
//   setText("score_lbl", score);
// }




// onEvent("screen1", "keydown", function(event) {
//   console.log("Key: " + event.key);
//   if(event.key==0){
//     userChoice(0);
//   }
//   else if(event.key==1){
//     userChoice(1);
//   }
// });

// onEvent("zero_btn", "click", function(event) {
//   userChoice(0);
// });
// onEvent("one_btn", "click", function(event) {
//   userChoice(1);
// });



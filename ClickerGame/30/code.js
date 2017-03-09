/*
  GRADE SUMMARY:

  - USING THE APP / PLAYING THE GAME -
  Welcome screen with rules & start btn:                3/3
  1+ value on screen that changes during gameplay:      3/3
  Possible to win, & app switches to "win" screen:      3/3
  Possible to lose, & app switches to "lose" screen:    3/3
  Can start game over without restarting app:           3/3
  Data & displays reset when game starts over:          3/3
  App is visually appealing, with intuitive UI:         3/3
  
  - THE CODE -
  Contains at least one global variable:                3/3
  Contains an event handler that updates a global var:  3/3
  UI element IDs are descriptive & meaningful:          3/3
  
  Overall score:                                      30/30
*/


/* 1+ value on screen that changes during gameplay (Score: 3)
    There are two values on the screen that change as the
    game is played: 'score' and 'lives.'
*/

/* Contains at least one global variable (Score: 3)
    score and lives are both global variables, since they are
    declared outside of a function.
*/
var score;
var lives;

onEvent("start_button", "click", function() {
  /* Data & displays reset when game starts over (Score: 3)
    The following four lines of code set up the score and lives variables
    as well as the text labels that get displayed on the game screen.
    
    Note: by putting these four lines in the event handler for the "start"
    button, we ensure that score and lives will be set up correctly both
    when the game runs the first time and when the game starts over from
    within the app (since after the user wins or loses he/she is
    redirected to the "welcome" screen, where he/she will need to press
    the "start" button to play again.
  */
  score = 0;
  lives = 3;
  setText("total_score", score);
  setText("number_lives", lives);
  
  setScreen("game_screen");
});
onEvent("burglar", "click", function() {
  score = (score + 1);
  setText("total_score", score);
  setPosition("burglar", randomNumber(50,280), randomNumber(50, 350));

  /* Possible to win, & app switches to "win" screen: (Score: 3)
    When the user hits a score of 25 (i.e. user "captures" 25 burglars),
    the app switches to the "win" screen and the user wins the game.
  */
  if (score == 25) {
    setScreen("win_screen");
  }
});
onEvent("background", "click", function() {
  lives = (lives - 1);
  setText("number_lives", lives);

  /* Possible to lose, & app switches to "lose" screen: (Score: 3)
    When the user runs out of lives, the app switches to the "lose" screen
    and the user loses the game.
  */
  if (lives == 0) {
    setScreen("lose_screen");
  }
});

/* Can start game over without restarting app (Score: 3)
    The playAgain_button and the tryAgain_button both let users
    restart the game without restarting the app (i.e. without
    hitting "Reset" and hitting "Run" again). The playAgain_button
    lets users restart from the "win" screen, and the tryAgain_button
    lets users restart from the "lose" screen.
*/
onEvent("playAgain_button", "click", function() {
  setScreen("welcome_screen");
});
onEvent("tryAgain_button", "click", function() {
  setScreen("welcome_screen");
});

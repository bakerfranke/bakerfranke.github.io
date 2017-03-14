
setStyle("text_area1","border: none");
//var points = [{x:162, y:82}, {x:131, y:177}, {x:31, y:177}, {x:112, y:236}, {x:81, y:331}, {x:162, y:272}, {x:243, y:331}, {x:212, y:236}, {x:293, y:177}, {x:193, y:177}, {x:162, y:82}];
//var points = [{x:162, y:120}, {x:131, y:215}, {x:31, y:215}, {x:112, y:274}, {x:81, y:369}, {x:162, y:310}, {x:243, y:369}, {x:212, y:274}, {x:293, y:215}, {x:193, y:215}, {x:162, y:120}];
var points = [{"x":160,"y":160},{"x":135,"y":236},{"x":55,"y":236},{"x":120,"y":283},{"x":95,"y":359},{"x":160,"y":312},{"x":225,"y":359},{"x":200,"y":283},{"x":265,"y":236},{"x":185,"y":236},{"x":160,"y":160}];
var startX = points[1].x;
var startY = points[1].y;

var TOLERANCE = 2; 
var isDragging = false;

var SHOW_TOLERANCE_LINES = false;


/////////// INSTRUCTION SCREEN STUFF /////////////

setActiveCanvas("canvas2"); //instructions screen

setFillColor("#FF0000");
setStrokeColor(rgb(0,0,0,0));
moveDot(0,0);

onEvent("canvas2", "mousedown", function(e) {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
  clearCanvas();
  moveDot(0,0);
  
});

onEvent("canvas2", "mouseup", function(){
  isDragging = false;
});

onEvent("canvas2", "mousemove", function(e) {
  if(isDragging){
    clearCanvas();
    moveDot(startX-e.x, startY-e.y);
  }
});


onEvent("button1", "click", function(event) {
  setScreen("screen1");
  setActiveCanvas("canvas1");
  reset();
  isDragging = false;
  setFillColor("#FF0000");
  setStrokeColor(rgb(0,0,0,0));
  
  drawScreen();
  moveDot(0,0);
  
}); 


//////////// FRUSTRATION TASK STUFF /////////


// return the difference (abs val) between the distance between p1 and p2
//  and the sum of the distances between p1,dot and dot,p2.
// If the dot is on the line the distances should be close to the same
function calcDist(p1, dot, p2){
  
  //BAKER NOTE: should improve this to use pythagoras to compute
  // the length of the perpendicular to p1,p2 using dot as the top
  // point of a triangle. i.o.w. this should return the perpendicular
  // distance away from the line p1,p2 which would make tolerance a 
  // constant value.  (as is, you have a lot more leeway at the points)
  
  var d1 = distance(p1,dot);
  var d2 = distance(dot,p2);
  var optimalDist = distance(p1,p2);
  
  return Math.abs((d1+d2)-optimalDist);
  
}

function calcDist2(p1, dot, p2){
 
  //line 1
  var slope1 = (p1.y-p2.y) / (p1.x-p2.x);
  var b1 = (slope1 * p1.x) - p1.y;
  
  //perpendicular line that intersects dot
  var slope2 = -1/slope1;
  var b2 = (slope2 * dot.x)-dot.y
  
  // where perpendicular interects line p1,p2
  var lineX = (b2-b1)/(slope1-slope2)
  
}


// clear the canvas and redraw the star
function drawScreen(){
  clearCanvas();
  setStrokeColor("black");
  setStrokeWidth(2);

  drawStar();
  setStrokeColor(rgb(0,0,0,0));
  setStrokeWidth(1);

}

// draw line segments between every pair of points in a list
function drawStar(){
   var p = points; 
   for(var i=0; i<p.length-1; i++){
     line(p[i].x, p[i].y, p[i+1].x, p[i+1].y);
   }
}

function distance(p1,p2){
  
  var xDiff = Math.abs(p1.x - p2.x);
  var yDiff = Math.abs(p1.y - p2.y);
  return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
  
}

// Check to see if the dot is close (within the tolerance) to at least 
// one of the line segments that makes up the star.  
// If the dot is not close to any line segment, return false.
function isCloseToLine(dotloc){

  var isClose = false;
  for(var i=0; i<points.length-1; i++){ //check every line segment
    
    var d = calcDist(points[i], dotloc, points[i+1]);  //calculate the line segment distance between these points

    if(d < TOLERANCE){
      //console.log("\tClose to "+i+" and "+(i+1)+": "+d);
      isClose = true;
      if(SHOW_TOLERANCE_LINES){
        setStrokeWidth(0.5);

        drawLine(points[i],dotloc);
        drawLine(points[i+1],dotloc);
        setStrokeWidth(3);

        drawLine(points[i],points[i+1]);
      }
      
      
      //return true;        
    }
    
  }
  if(isClose){   //could move this into loop to short-circuit but more fun for SHOW_TOLERANCE_LINES
      return true;
  }
  if(isClose == false){
    //console.log("\tNOT close. ");
    
    //reset();
  }
  return false;
}

function drawLine(p1,p2){
  setStrokeColor("red");
  line(p1.x, p1.y, p2.x, p2.y);
}

onEvent("canvas1", "mousedown", function(e) {
  isDragging = true;
  startX = e.x;
  startY = e.y;
});
onEvent("canvas1", "mouseup", function(){
  isDragging = false;
  reset();
  
});


// Main algorithm is here.
onEvent("canvas1", "mousemove", function(e) {
  
  if(isDragging){           
    drawScreen();           // redraw the screen
    var xAmt = startX-e.x;  // calculate dist from starting point
    var yAmt = startY-e.y;  //    but in opposite directions for x, y
    moveDot(xAmt, yAmt );   // move the dot by that amt
    
    var dotX = startX + xAmt;       // check if new dot location is close
    var dotY = startY + yAmt;       // to one of the line segments
    var result = isCloseToLine({x:dotX,y:dotY});    
    
    if(result == false){            // if not close to any line segments
      reset();                      // wha wha. reset.
    }
  }
});


function moveDot(xAmt, yAmt){  //move dot relative to current location
  var dotX = startX + xAmt;
  var dotY = startY + yAmt;
  circle(dotX, dotY, 5);
  

}

function reset(){
  drawScreen();
  startX = points[1].x;
  startY = points[1].y;
  moveDot(0,0);
  //isDragging = false;
}

////////////////////////  TURTLE TESTS BELOW ////////////////////

function drawFromList(){
  penUp();
  moveTo(points[0].x, points[0].y);
  penWidth(5);
  penColor("#00ADBC");
  
  penDown();
  for(var i=0; i<points.length; i++){
    moveTo(points[i].x, points[i].y);
  }
  
}

// draw a star with the turtle and output
// copy/pastable JS that defines array of {x,y} points
// that make up the star
// return array of JSON objs {x:x, y:y}
function drawStarWithTurtle(startX, startY, sideLen){
  var str = "var points = [";
  var data = [];
  
  penUp();
  turnTo(0);
  
  moveTo(startX,startY);
  penWidth(5);
  penColor("#00ADBC");
  
  penDown();
  turnLeft(180-18);
  
 for (var i = 0; i < 5; i++) {
  
  //str += pointJSON(getX(), getY())+", "
  data.push(pointJSON(getX(), getY()))
  
  moveForward(sideLen);
  turnRight(72);
  console.log(Math.round(getX())+", "+Math.round(getY()));
    //str += pointJSON(getX(), getY())+", "
    data.push(pointJSON(getX(), getY()))

  moveForward(sideLen);
  turnLeft(180-36);
 }
   
  //str += pointJSON(getX(), getY())+"];"
  data.push(pointJSON(getX(), getY()))

  //console.log(str);
  console.log(JSON.stringify(data))

  //moveForward(100);
  return data;

}

function pointJSON(x,y){
  return {x:Math.round(x), y:Math.round(y)};
}
onEvent("toleranceSlider", "input", function(event) {
  //console.log("toleranceSlider value: " + getNumber("toleranceSlider"));
  TOLERANCE = getNumber("toleranceSlider");
  setText("toleranceLabel",TOLERANCE);
});

function config(){
  
  SHOW_TOLERANCE_LINES = !SHOW_TOLERANCE_LINES;
  
  if(SHOW_TOLERANCE_LINES){
    showElement("toleranceSlider");
    showElement("toleranceLabel");
    showElement("toleranceInstructions");
  }
  else{
    hideElement("toleranceSlider");

    hideElement("toleranceLabel");
    hideElement("toleranceInstructions");

  }
  
}
onEvent("configButton", "click", config);

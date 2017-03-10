setActiveCanvas("canvasMain");

setStrokeColor("rgba(0,0,0,0)");
setFillColor("rgba(0,0,0,0.2)");

var eventList = [];

onEvent("canvasMain", "mousemove", function(event) {
  if (event.shiftKey) {
    appendItem(eventList, event);
    circle(event.offsetX, event.offsetY, dotRadius(event.movementX, event.movementY));
  }
});

onEvent("deleteButton", "click", function(event) {
  clearCanvas();
  eventList = [];
});

onEvent("randomButton", "click", function(event) {
  clearCanvas();
  for (var i = 0; i < eventList.length; i++) {
    var radius = randomNumber(1,10);
    circle(eventList[i].offsetX, eventList[i].offsetY, radius);
  }
});

onEvent("originalButton", "click", function(event) {
  clearCanvas();
  for (var i = 0; i < eventList.length; i++) {
    circle(eventList[i].offsetX, eventList[i].offsetY, dotRadius(eventList[i].movementX, eventList[i].movementY));
  }
});

onEvent("sprayPaintButton", "click", function(event) {
  clearCanvas();
  for (var i = 0; i < eventList.length; i++) {
    for (var j = 0; j < 5; j++) { // Make sure this variable has a different name than the outer loop variable!
      circle((eventList[i]).offsetX + randomNumber(-3,3), eventList[i].offsetY + randomNumber(-3,3), 1);
    }
  }
});

// Begin student code
onEvent("etchButton", "click", function(event) {
  // clearCanvas();
  // Make stroke color visible, so lines will display
  setStrokeColor("black");
  for(var i = 0; i < eventList.length - 10; i++) {
    line(eventList[i].offsetX, eventList[i].offsetY, eventList[i+10].offsetX, eventList[i+10].offsetY);
  }
  // Set stroke color back to transparent
  //  (so it won't affect the other drawing effects).
  setStrokeColor("rgba(0,0,0,0)");
});
// End student code

function dotRadius(changeX, changeY) {
  var speed = Math.abs(changeX) + Math.abs(changeY);
  var output = 1 + (5 / speed);
  return output;
}

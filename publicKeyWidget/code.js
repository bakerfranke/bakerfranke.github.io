setScreen("welcomeScreen");


/////////// ALICE STUFF ///////////////////

onEvent("alice_button", "click", function() {
  setScreen('alice_screen2');
  setStyle("alice_screenCover","background-color: rgba(255,255,255,0.66)");
  fakeClockSetup("aliceCanvas2");
});

onEvent("alice_tryIt_button", "click", function() {
  hideElement("alice_screenCover");
  console.log("alice_tryIt_button clicked!");
});

function alice_recompute(){
  
  
}

onEvent("alice_mod_dropdown2", "change", function() {
  
  //Hide computed public key after mod change
  setText("alice_publicKey_txt2","");
  hideElement("alice_publicKey_txt2");
  hideElement("alice_computedKey_label2");
  hideElement("alice_share_label2");
  
  // reset computed values
  setText("alice_privateKey_txt2", "????");
  setText("alice_multResult_txt2", "????")
  
  showElement("alice_privateKey_label2");
  showElement("alice_privateKey_dropdown2");
  
  
  
  var privateList = buildPrivateList(getText("alice_mod_dropdown2"));
  setOptions("alice_privateKey_dropdown2",["filling list..."])
  setOptions("alice_privateKey_dropdown2",privateList);
  setStyle("alice_privateKey_dropdown2","background-color: #ffa400");
  
  setText("alice_mod_txt2", getText("alice_mod_dropdown2"));
  
  setText("alice_privateKey_label2","Choose private key");
  setStyle("alice_privateKey_label2", "color: #30c2a5");
  
 
  
  console.log("Done populating list");
});

onEvent("alice_privateKey_dropdown2", "change", function() {
  var modulus = parseInt(getText("alice_mod_dropdown2"));
  var privateKey = parseInt(getText("alice_privateKey_dropdown2"));
  
  setText("alice_publicKey_txt2", calculateInverse(privateKey,modulus));
  setText("alice_privateKey_txt2",getText("alice_privateKey_dropdown2"));
  
  showElement("alice_publicKey_txt2");
  showElement("alice_share_label2");
  showElement("alice_computedKey_label2")
  
});

onEvent("alice_publicNumber_txt2","change",function(){
   var pub = getText("alice_publicNumber_txt2");
  var pvt = getText("alice_privateKey_txt2");
  var result = pub*pvt;
  setText("alice_multResult_txt2", result);
});

onEvent("alice_multiply_button2", "click", function(){
  
  var pub = getText("alice_publicNumber_txt2");
  var pvt = getText("alice_privateKey_txt2");
  var result = pub*pvt;
  setText("alice_multResult_txt2", result);
});

onEvent("alice_go_button2", "click", function(){
  setText("alice_bobsSecret_label2","Calculating Modulo...");
  showElement("alice_bobsSecret_label2");
  var mod = getText("alice_mod_txt2");
  var bigNum = getText("alice_multResult_txt2");
  
  doClock("aliceCanvas2", mod, bigNum, 4000);
  setTimeout(function(){
    setText("alice_bobsSecret_label2", "Bob's secret number is: "+(bigNum%mod)+"!");
  },4000);
});

onEvent("alice_back_button2","click",function(){
  setScreen("welcomeScreen");
});



// onEvent("eve_backButton", "click", function(event) {
//   console.log("eve back btn clicked");
//     setScreen("welcomeScreen");
// });

/////////////////// BOB STUFF ////////////
onEvent("bob_button", "click", function() {
  setScreen('bob_screen2');
  setStyle("bob_screenCover","background-color: rgba(255,255,255,0.66)");
  fakeClockSetup("bobCanvas2");

});

onEvent("bob_tryIt_button", "click", function() {
  hideElement("bob_screenCover");
  console.log("bob_tryIt_button clicked!");
});

onEvent("bob_back_button2", "click", function(event) {
    setScreen("welcomeScreen");
});

onEvent("bob_publicKey_txt2","click",function(){
  //TO DO: set placeholder attribut to go away on click.
  //NEED TO KNOW: how setAttribute works
  console.log("entered bob public key");
});
onEvent("bob_goButton", "click", function(event) {
  bobDoClock();
});

function bobDoClock(){
   var secret = getText("bob_secretNumber_txt2");
  var clockSize = getText("bob_mod_dropdown2");
  var bigNum = getText("bob_multResult_txt2");
  showElement("bob_sendAlice_label");
  setText("bob_sendAlice_label", "Computing modulo...")
    doClock("bobCanvas2", clockSize, bigNum, 4000);
    
    setTimeout(function(){
      
      setText("bob_sendAlice_label", "3. Send "+(bigNum%clockSize)+" to Alice.")
    },4000);
 
}
onEvent("bob_mod_dropdown2", "change", function(event) {
  //need to check that secret Number < mod
  bobDoClock();
});

onEvent("bob_multiply_button2", "click", function(event) {
  
  var secret = getText("bob_secretNumber_txt2");
  var pub = getText("bob_publicKey_txt2");
  setText("bob_multResult_txt2", secret*pub);
  setStyle("bob_multResult_txt2","text-align: right");
  console.log("bob_go_button clicked!");
});

//////////////// EVE STUFF ///////////////

onEvent("eve_button", "click", function() {
  setScreen('eve_screen');
  setStyle("eve_screenCover","background-color: rgba(255,255,255,0.66)");
  setStyle("eve_bobCrackCover","background-color: rgba(255,255,255,0.66)");
  setStyle("eve_aliceCrackCover","background-color: rgba(255,255,255,0.66)");

  fakeClockSetup("eveCanvas");

});

onEvent("eve_tryIt_button", "click", function(event) {
  hideElement("eve_screenCover");
});

onEvent("eve_mod_dropdown", "change", function(event) {
  var mod = getText("eve_mod_dropdown");
  setText("eve_modmod_txt1", ") MOD "+mod+" = 1?");
  
  hideElement("eve_tryAgainAlice_label");
  hideElement("eve_tryAgainBob_label");
  //make list 1->N
  var list = [];
  for(var i=0; i< mod; i++){
    list.push(i);
  }
  
  setOptions("eve_keyList_dropdown1",list);
  setOptions("eve_keyList_dropdown2",list);

  console.log("Selected option: " + getText("eve_mod_dropdown"));
});

onEvent("eve_keyList_dropdown1", "change", function(event) {
  var bigNum = getText("eve_alicePub_txt")*getText("eve_keyList_dropdown1");
  var result = bigNum % getText("eve_mod_dropdown");
  
  setStyle("eve_tryAgainAlice_label","text-align: right");
  setText("eve_aliceResult_label", "????");

  doClock("eveCanvas", getText("eve_mod_dropdown"), bigNum, 1000);
  hideElement("eve_tryAgainAlice_label");
  showElement("eve_calc_label");

  setTimeout(function(){
    showElement("eve_tryAgainAlice_label");
    setText("eve_aliceResult_label", result);

    if(result != 1){
      setStyle("eve_aliceResult_label","background-color: #CC0000");
      setStyle("eve_tryAgainAlice_label","color: #CC0000");
      setText("eve_tryAgainAlice_label","Try Again.");
      showElement("eve_tryAgainAlice_label");
    }
    else{
      setStyle("eve_aliceResult_label","background-color: #00CC00");
      setStyle("eve_tryAgainAlice_label","color: #00CC00");
      setText("eve_tryAgainAlice_label","Woo hoo!");
    }
    hideElement("eve_calc_label");

  }, 2000);
  
  
  console.log("Selected option: " + getText("eve_keyList_dropdown1"));
});

onEvent("eve_keyList_dropdown2", "change", function(event) {
  if(getText("eve_bobNumber_txt")==""){
    setStyle("eve_bobResult_label","background-color: #CC0000");
    //setText("eve_tryAgainBob_label","Need to enter Bob's number");
    return;
  }
  var bob = parseInt(getText("eve_bobNumber_txt"));
  var bigNum = getText("eve_alicePub_txt")*getText("eve_keyList_dropdown2") 
  var result = bigNum % getText("eve_mod_dropdown");
  
  doClock("eveCanvas", getText("eve_mod_dropdown"), bigNum, 1000);
  setText("eve_bobResult_label", "????");
  showElement("eve_calc_label");
  hideElement("eve_tryAgainBob_label");

  setTimeout(function(){
    setText("eve_bobResult_label", result);
    showElement("eve_tryAgainBob_label");
    setStyle("eve_tryAgainBob_label","text-align: right");
    if(result != bob){
     setStyle("eve_bobResult_label","background-color: #CC0000");
     setText("eve_tryAgainBob_label", "Try Again.")
     setStyle("eve_tryAgainBob_label","color: #CC0000");

     showElement("eve_tryAgainBob_label");
   
    }
    else{
      setStyle("eve_bobResult_label","background-color: #00CC00; color: #FFFFFF");
      setStyle("eve_tryAgainBob_label","color: #00CC00");
      setText("eve_tryAgainBob_label","Woo hoo!");
    }
    hideElement("eve_calc_label");

  }, 2000)
  
  
  console.log("Selected option: " + getText("eve_keyList_dropdown1"));
});

onEvent("eve_bobNumber_txt", "input", function(event) {
  hideElement("eve_bobCrackCover");
  var bob = getText("eve_bobNumber_txt");
  var mod = getText("eve_mod_dropdown");
  setText("eve_bobCrackInstructions_label","Pick the number that makes the calculation below = "+bob)
  setText("eve_modmod_txt2", ") MOD "+mod+" = "+bob+"?");


  //setText("eve_tryAgainBob_label", "Try again.:);
});

onEvent("eve_alicePub_txt", "input", function(event) {
  hideElement("eve_aliceCrackCover");
  setStyle("eve_pubKey_txt1","text-align: right");
  setStyle("eve_pubKey_txt2","text-align: right");

  var pub = getText("eve_alicePub_txt");
  setText("eve_pubKey_txt1","("+pub+" x ");
  setText("eve_pubKey_txt2","("+pub+" x ");
  


});

// onEvent("eve_backButton", "click", function() {
//   console.log("eve Back 2 clicked")
//   setScreen("welcomeScreen");
// });

//////////// MODULO CLOCK USER SCREEN STUFF //////////////
onEvent("clock_clockSize_dropdown", "change", function(event) {
  var size = getText("clock_clockSize_dropdown");
  hideElement("clock_shortcutWarning_label");

  if(getText("clock_bigNumber") != ""){
    var num = parseInt(getText("clock_bigNumber"));
    var speed = (11-getText("clock_speed_dropdown"))*1000;
    var wholeTimes = parseInt(num/size);
    if(num/size >= 7){
      setText("clock_shortcutWarning_label", "Whoa. That's a big number. We'll fast forward through "+wholeTimes+" loops and just show you the end.")
      showElement("clock_shortcutWarning_label");
    }
    doClock("clockCanvas", size, num, speed);
  }
});

onEvent("clock_bigNumber", "input", function(event) {
 
  hideElement("clock_shortcutWarning_label")
});

onEvent("clock_go_button", "click", function(event) {
   var num = parseInt(getText("clock_bigNumber"));
  setText("clock_bigNumber", num);
  
  var size = getText("clock_clockSize_dropdown");
  var num = parseInt(getText("clock_bigNumber"));
      var wholeTimes = parseInt(num/size);

  if(num/size > 7){
    showElement("clock_shortcutWarning_label");
    setText("clock_shortcutWarning_label", "Whoa. That's a big number. We'll just fast forward through "+wholeTimes+" loops and show you the end.")

  }
  else{
    hideElement("clock_shortcutWarning_label")
  }
  var speed = getText("clock_speed_dropdown");
  speed = (11-speed)*1000;
  doClock("clockCanvas",size,num,speed);
  
  //doAddUp(num, 0, speed);
  
});

onEvent("clock_back_button", "click", function(event) {
  setScreen("welcomeScreen");
});

onEvent("modClock_button", "click", function(event) {
  setScreen("justTheClock");
  setText("clock_speed_dropdown","4");
  setText("clock_clockSize_dropdown", "37");
  setText("clock_bigNumber", "247");
  doClock("clockCanvas", 37, 247, 4000);
  //doAddUp(243, 0, 4000);

  setStyle("clockCanvas_clockLabel","text-align: center")
  setStyle("clock_addUpNumber", "text-align: center");
  setText("clock_addUpNumber", 0);
});


/////////// Animated Modulo Clock Code /////////////////

//NOTE: must have label with id: canvasId+"_clockLabel"
//on screen with design mode (no way to position properly with code right now)

var colors=['rgb(0,173,188)','rgb(118,101,160)'];
var colorIndex=0;

// doClock makes sure animate clock is setup right, sometimes does
// two calls to animateClock as shortcut for big numbers
function doClock(canvasId, clockSize, bigNumber, totalTime){
  setActiveCanvas(canvasId);
  
  setStrokeColor(colors[colorIndex%colors.length]);
  setFillColor(colors[colorIndex%colors.length]);
  
  setFillColor("white");
  rect(-1,-1,400,400);
  var wholeTimes = parseInt(bigNumber/clockSize);
  var partial = parseFloat(bigNumber%clockSize)/clockSize;
  wholeTimes = Math.min(7, wholeTimes);
  //setText("clock_addUpNumber",0);

  if(clockSize > 300 && wholeTimes>1){
    animateClock(canvasId, wholeTimes, 300, 500, bigNumber);
    console.log("go1")
    setTimeout(function(){
      console.log("go2");
      //setText("clock_addUpNumber",bigNumber-partial*clockSize);
      animateClock(canvasId, partial, clockSize, 1000+(totalTime/10), bigNumber);
    },1001);
  }
  else if(wholeTimes == 7){
    animateClock(canvasId, wholeTimes, clockSize, 750, bigNumber-(bigNumber%clockSize));
    console.log("go1")
    setTimeout(function(){
      console.log("go2");
      //setText("clock_addUpNumber",bigNumber-partial*clockSize);
      animateClock(canvasId, partial, clockSize, 1000+(totalTime/10), bigNumber);
    },1001);
    
  }
  else{
    animateClock(canvasId, wholeTimes+partial, clockSize, totalTime, bigNumber);
  }
}

// uses interval timer to achieve animated effects
function animateClock(canvasId, pct, clockSize, totalTime, bigNumber){

  setFillColor("rgba(255,255,255,0.5)");
  rect(-1,-1,400,400);
  var finalAnswer = bigNumber%clockSize;
  var tick = (2*Math.PI)/clockSize;
  var angle = 0;

  var centerX = getAttribute(canvasId, "width")/2;
  var centerY = getAttribute(canvasId, "height")/2;
  var radius = Math.min(centerX,centerY)-30;
  var x; //= centerX+100*Math.cos(angle);
  var y;// = centerY+100*Math.sin(angle);
  
  
  var totalTicks = pct*clockSize;
  var msPerTick = totalTime/totalTicks;
  var ms = msPerTick;
  var numLinesPerTick = 1;
  var tickIncrement = 1;
  setStrokeWidth(2);

 
  if(msPerTick < 40){
    numLinesPerTick = 40/msPerTick;
    ms=40;
  }
  
  
  
  console.log("numLinesPerTick: "+numLinesPerTick)
  

  var tickCounter = 0;
  console.log(msPerTick);
  console.log(numLinesPerTick);

  setFillColor(colors[colorIndex%colors.length]);
  var myTime = setInterval(function(){
   

    for(var i=0; i<numLinesPerTick && tickCounter <= totalTicks; i++){
      x = centerX+radius*Math.cos(angle-(Math.PI/2));
      y = centerY+radius*Math.sin(angle-(Math.PI/2));
      var x2 = centerX+(radius+20)*Math.cos(angle-(Math.PI/2));
      var y2 = centerY+(radius+20)*Math.sin(angle-(Math.PI/2));
      var x3 = centerX+(radius-5)*Math.cos(angle-(Math.PI/2));
      var y3 = centerY+(radius-5)*Math.sin(angle-(Math.PI/2));
      
     
      line(x2,y2, x3, y3);
        
      if(clockSize<230){
        circle(x,y,8);
      }
      var oldAngle = angle;
      angle = (angle+tick)%(2*Math.PI);
      
      if(angle<oldAngle){
        setFillColor("rgba(255,255,255,0.5)");
        rect(-1,-1,400,400);
        
        setStrokeColor(colors[colorIndex%colors.length]);
        setFillColor(colors[colorIndex%colors.length]);
      }
      
      tickCounter++;
      setText(canvasId+"_clockLabel", (tickCounter%clockSize));
     // setText("clock_addUpNumber",  parseInt(getText("clock_addUpNumber"))+1);
    }
   
    setText(canvasId+"_clockLabel", (tickCounter%clockSize))

    if(tickCounter >= totalTicks){
      clearInterval(myTime);
      // WARNING: this section keeps running for a bit even after the timer is cleared
      // when ms is very small...just takes a while for all the function calls to clear out.
      
      //fake it just to be sure.  ticks get off by 1 for rounding errors
      setText(canvasId+"_clockLabel", finalAnswer);//(getText("bigNumberInput")%clockSize))
      //setText("clock_addUpNumber", bigNumber);
      
    }
  }, ms);
}

function fakeClockSetup(canvasId){
  setActiveCanvas(canvasId);
  //two circles and a semi-transparent rect over it.
  var centerX = getAttribute(canvasId, "width")/2;
  var centerY = getAttribute(canvasId, "height")/2;
  var radius = Math.min(centerX,centerY)-30;
  
  setStrokeColor("rgba(0,0,0,0)");
  setFillColor(colors[0]);
  circle(centerX, centerY, radius+20);
  setFillColor("white");
  circle(centerX, centerY, radius-5);
  setFillColor("rgba(255,255,255,0.5)")
  rect(-1,-1,400,400);
  setText(canvasId+"_clockLabel","0");
  
}

//Not used right now.
function doAddUp(totalNumber, current, totalSecs){
  //41ms
  
  setTimeout(function(){
    var diff = totalNumber - current;
    current+=parseInt(diff*.1)+1;
    setText("clock_addUpNumber", current);
    if(current < 0.99*totalNumber){
      doAddUp(totalNumber, current, totalSecs);
    }
    else{
      setText("clock_addUpNumber", totalNumber);
    }
  }, 41);
}


////////// Multiplicative Inverse Code ////////////


function setOptions(id, arr){
  var str="";
  for(var i=0; i<arr.length; i++){
    str += "<option value='"+arr[i]+"'>"+arr[i]+"</option>\n";
  }
  innerHTML(id, str);
}

// for a given modulus mod calculate the modular multiplicative
// inverse for values < mod.  Set val and inverse of val in lists
// as public/private key pairs
function buildPrivateList(mod){
  var potentialVals = [];
  var privateList = [];
  setText("alice_privateKey_label2","Generating keys...");
  setStyle("alice_privateKey_label2", "color: red");
  for(var i = 0; i < mod - 2; i++){
    potentialVals.push(i);
  }
  potentialVals[1] = 0;
  setStyle("alice_privateKey_dropdown2","background-color: red");
  for (var j = 0; j < mod - 2; j++) {
    var pct = parseInt(mod*0.05);
    if(j%pct==0){
      setOptions("alice_privateKey_dropdown2",[parseInt((j / (mod -2))*j)]);
    }
    if(potentialVals[j] !== 0){
      privateList.push(j);
      var inverse = calculateInverse(j,mod);
      potentialVals[inverse] = 0;
      //console.log("The inverse of " + j + " is " + inverse);
    }
  }
  return privateList;
}

// finds value u for which (a * u) mod m == 1
function calculateInverse(a,m) {
    var v = 1;
    var d = a;
    var u = (a == 1);
    var t = 1-u;
    if (t == 1) {
        var c = m % a;
        u = Math.floor(m/a);
        while (c != 1 && t == 1) {
               var q = Math.floor(d/c);
               d = d % c;
               v = v + q*u;
               t = (d != 1);
               if (t == 1) {
                   q = Math.floor(c/d);
                   c = c % d;
                   u = u + q*v;
               }
        }
        u = v*(1 - t) + t*(m - u);
    }
    return u;
}
onEvent("eve_backButton", "click", function(event) {
  console.log("eve_backButton clicked!");
});
onEvent("eve_backButton2", "click", function(event) {
  console.log("eve_backButton2 clicked!");
  setScreen("welcomeScreen");
});

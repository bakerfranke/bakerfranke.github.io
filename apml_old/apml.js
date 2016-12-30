var samples = {};
samples.if = '[a <- [RANDOM |0,100|]]\n[b <- [INPUT]]\n[ IF ( a ≤ b)\n   [ a <- b ]\nELSE\n  [[IF ( b ≥ 100)\n   [ a <- b / a ]]]\n]\n[DISPLAY |a|]';
samples.robot = '[MOVE_FORWARD]\n[REPEAT 4 TIMES\n   [[TURN_LEFT]\n[MOVE_FORWARD]]]';
samples.foreach = '[FOR EACH item IN list\n  [[DISPLAY |item|]\n[IF (item = \"needle\")\n  [[DISPLAY |\"Found!\"|]]\n]\n]]';
samples.procedure = '[PROCEDURE min |a, b, c|\n  [[min <- a]\n[IF (b < min)\n  [[min <- b]]\n]\n[IF (c < min)\n  [[min <- c]]]\n[RETURN |min|]\n'
/*
Conversions:  Find all occurances of a in text replace with b
NOTE: order matters here
*/
var convs = []
convs.push({a:"[|](?=.*[|])", b:"<val>"}); //look ahead for val delimiters
convs.push({a:"[|]", b:"</val>"});
convs.push({a:"[\[] *(?=IF|REPEAT|PROCEDURE|FOR)", b:"<bl class='dark'>"});
convs.push({ a:"[\[]", b:"<bl>"});
convs.push({a: "[\\]]", b: "</bl>"});
convs.push({ a:"[\(]", b:"<cond>"});
convs.push({a: "[\)]", b: "</cond>"});
convs.push({a: "[\\n]", b:"<br>\n"});
convs.push({a: "[ ]{2}", b: "&nbsp;&nbsp;"});
convs.push({a: "[\|]", b: "&nbsp;&nbsp;"});
convs.push({a: "<-", b: "&larr;"});


/////// HELPER FUNCTIONS //////
/* 
* Process array of conversions. Set text and html output boxes
*/
function convert(){

  var input = $("#code").val();
  
  for(var i=0; i<convs.length; i++){
    var reg = new RegExp(convs[i].a, "g");
    console.log("replace "+reg.toString()+" with "+convs[i].b);

    input = input.replace(reg, convs[i].b);
  }
  $("#htmlOut").text("<div id='APblocks'>\n"+input+"\n</div>");
  $("#APblocks").html(input);
  console.log("input\n "+JSON.stringify($("#code").val()));
}

/*
* Sets font size based on range slider #fSize
*/
function fontSize(){
   $("#APblocks").css("font-size", $("#fSize").val()+'px');
   $("#fSizeout").html($("#fSize").val())
}

/*
* Load sample from hard-coded global var
*/
function loadSample(key){
  $("#code").val(samples[key]);
  convert();
}


/*
* Save the "Saved Code" text area to local storage.
*/
function updateStorage(){
  
  var toSave = $("#savedCode").val();

  if(toSave === ""){
    alert("saving empty string")
  }

  localStorage.savedCode = toSave;


};

////// EVENT HANDLERS //////
$( document ).ready(function() {

    console.log( "ready! adding event listeners" );
    document.getElementById("code").addEventListener("input", convert);
    document.getElementById("fSize").addEventListener("input", fontSize);

    //load saved code
    if(localStorage.hasOwnProperty("savedCode")){
      $("#savedCode").val(localStorage.savedCode.toString());
    }

});


// click and oninput for convert
$("#code").change(convert);

$("#fSize").change(fontSize);


$("#updateSavedCode_btn").click(updateStorage);


$("#saveInput").click(function(){

  var newCode = $("#code").val();
  var oldCode = $("#savedCode").val();
  var d = new Date();
  var dateStr = d.getMonth()+"."+d.getDay()+"."+d.getFullYear()+" @"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

  $("#savedCode").val("--- "+dateStr+" ---\n\n"+newCode+"\n\n"+oldCode);

  updateStorage();

});

$("#loadSample").change(function(e){
  console.debug("menu change "+e);
  loadSample($("#loadSample").val());
})






//// AT START ///

loadSample("if");
convert();



var samples = {};
samples.if = '[a <- [RANDOM |0,100|]]\n[b <- [INPUT]]\n[ IF ( a ≤ b)\n   [ a <- b ]\nELSE\n  [[IF ( b ≥ 100)\n   [ a <- b / a ]]]\n]\n[DISPLAY |a|]';
samples.robot = '[MOVE_FORWARD]\n[REPEAT 4 TIMES\n   [[TURN_LEFT]\n[MOVE_FORWARD]]]';
samples.foreach = '[FOR EACH item IN list\n  [[DISPLAY |item|]\n[IF (item = \"needle\")\n  [[DISPLAY |\"Found!\"|]]\n]\n]]';
samples.procedure = '[PROCEDURE min |a, b, c|\n  [[min <- a]\n[IF (b < min)\n  [[min <- b]]\n]\n[IF (c < min)\n  [[min <- c]]]\n[RETURN |min|]\n'

var multilineBlocks = ["IF","ELSE", "REPEAT","FOR EACH","PROCEDURE"];


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


  var input = parse($("#code").val());
  
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

function isBlockStatement(line){

  for(var i=0; i<multilineBlocks.length; i++){
    if(line.indexOf(multilineBlocks[i]) >= 0){
      console.log("found block statement "+line);
      return true;
    }
  }
  return false;
}

// Takes AP-style code and parses it into Baker's apml
function parse(){

  var lines = $("#code").val().split("\n");

  var out = "";

  for(var i=0; i<lines.length; i++){

    var line = lines[i];
    console.log(lines[i]);



    // figure out what to do with line contents    


    //1. if it's not an IF or a REPEAT UNTIL then parentheses
    // need to be turned into pipes
    if(line.indexOf("IF") < 0 && line.indexOf("UNTIL") < 0){
        line = line.replace(/[\(\)]/g,"|");
    }


    //2. preserve indentation?
    var firstCharPos = line.search("[^ ]");
    var indent = line.substring(0, firstCharPos ); //anything from 0 up to first non-space is indent
    line = line.substring(firstCharPos);

    
    // 3. figure out tokens

    var beginToken = "[";  //defaults
    var endToken = "]\n";

    // if it's a block statement it cannot end with a bracket
    if( isBlockStatement(line)){
      endToken = "\n";
    }

    //line = line.replace(/[\}]/g,"]");
    //line = line.replace(/[\{}]/g,"[");

    if(line.indexOf("}") >= 0){   //if this is the closing curly for an if-statement
      if(i<lines.length-1 && lines[i+1].indexOf("ELSE")>=0){  // if next thing is an ELSE then only single-close 
        out +="]\n";                      
      }
      else{
        out+="]]\n";
      }
    }
    else if(line.indexOf("{") >= 0){
      out+=""
    }
    else if(line.search("[^ \\n]")<0){
      out += "\n";
    }
    else if(line.indexOf("ELSE")>=0){
      out += "ELSE\n";
    }
    else{
      if(i>0 && lines[i-1].indexOf("{")>=0){
        beginToken = "[[";
      }
      out+=indent+ beginToken + line + endToken;
    }

  }

  //$("#dump").val(out);
  //console.debug(out);
  return out;
}

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








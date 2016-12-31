var samples = {};
samples.if = '[a <- [RANDOM |0,100|]]\n[b <- [INPUT]]\n[ IF ( a ≤ b)\n   [ a <- b ]\nELSE\n  [[IF ( b ≥ 100)\n   [ a <- b / a ]]]\n]\n[DISPLAY |a|]';
samples.robot = '[MOVE_FORWARD]\n[REPEAT 4 TIMES\n   [[TURN_LEFT]\n[MOVE_FORWARD]]]';
samples.foreach = '[FOR EACH item IN list\n  [[DISPLAY |item|]\n[IF (item = \"needle\")\n  [[DISPLAY |\"Found!\"|]]\n]\n]]';
samples.procedure = '[PROCEDURE min |a, b, c|\n  [[min <- a]\n[IF (b < min)\n  [[min <- b]]\n]\n[IF (c < min)\n  [[min <- c]]]\n[RETURN |min|]\n'

var multilineBlocks = ["IF","ELSE", "REPEAT","FOR EACH","PROCEDURE"];

var codeType = "ap";  //this can be "ap" or "apml"

/*
Conversions:  Find all occurances of a in text replace with b
NOTE: order matters here
*/
var convs = [];
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
* Process apml and replace special chars with appropriate html blocks
* Worth nothing: css says that styles here are <pre> style so spaces have an effect!
*/
function convert(){  //make this be apml2html(input)


  var input = $("#code").val();

  if(codeType==="ap"){
    input = AP2apml(input);
  }
  
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

function apml2AP(code){

  var lines = code.split("\n");

  var out = "";
  var indent = 0; //keep track of indent depth

  for(var i=0; i<lines.length; i++){

    var line = lines[i];

    console.log(i+".) "+line)

    // first remove double brackets. Those are curly braces
    line = line.replace(/\[ *\[/g,"{\n");
    line = line.replace(/\] *\]/g, "}");

    line = line.replace("ELSE","}\nELSE");


    
    

    // now get rid of single brackets
    line = line.replace(/[\[\]]/g,"");

    //strip any amount of leading whitespace
    line = line.replace(/^[ ]*/,"");

    // if there is a closing curly brace de-dent immediatly
    if(line.indexOf("}")>=0) indent-=2;

    // replace with proper amount.
    if(line.indexOf("{\n")>=0){ //if I inserted a \n it's because of open curly or else indent needs to happen to remainder of line after \n
      console.log("found line break replacing with \\n + pad >>  "+pad(indent)+"<<");
      line = line.replace(/[\n]/,"\n  "+pad(indent));  //force add 2 spaces since indent hasn't increased yet.
    }
    else if(line.indexOf("}\nELSE")>=0){  //I created this above --

      console.log("found ELSE  >>"+line+"<<");
      
      line = line.replace("}\nELSE", "}\n"+pad(indent)+"ELSE")
    }
    
    
    
    line = pad(indent)+line;
    
    

    console.log("\t"+ i+".) >>"+line+"<<")

    // if the line only contains characters with no spaces then it's a no-param procedure call
    if(line.search(/^[A-Za-z0-9_]{1}[ ]*$/g)>=0){

      line = line.replace(/[ ]*$/g, "");
      line = line+" ()";
      console.log("\tFOUND procedure call line? "+line);
    }

    //figure out how to replace pipes || with proper parenstr.search(/^[ ]*$/g)s ()
    line = pipe2parens(line);

    if(line.search(/^[ ]*$/g) == -1){ //if the line is NOT just all spaces
      
      out += line+"\n";
    } 
    else{
      console.log("\tONLY SPACES!!!");
    }
    // if there is an opening curly brace increase indent here to affect future lines
    if(line.indexOf("{")>=0) indent+=2;

  }
  return out;

}


function pipe2parens(str){

  //alternate first occurance to (  then last occurance to )
  // should deal with embeded pipes...which shouldn't happen but still.
  var out = str;
  while ( out.search(/[|]/g) >= 0){

    var left = out.indexOf("|");
    var right = out.lastIndexOf("|");

    out = out.slice(0, left)+"("+out.slice(left+1, right)+")"+out.slice(right+1)


  }
  return out;

}

function pad(amt){

  return Array(amt+1).toString().replace(/,/g," ")
}


// Takes AP-style code and parses it into Baker's apml
// TODO:  need to parse right-side expressions on assignment...or any invocation of known commands with params
function AP2apml(code){

  //var lines = $("#code").val().split("\n");
  var lines = code.split("\n");

  var out = "";

  var nestLevel = 0; //count nesting of blocks, use to determine whether to use indent at the end.

  for(var i=0; i<lines.length; i++){

    var line = lines[i];
    console.log(lines[i]);



    // figure out what to do with line contents    

    //0. Find empty parens (e.g. "()") and replace with nothing
    line = line.replace(/[ ]*\([ ]*\)/g,"");


    //1. if it's NOT an IF or a REPEAT UNTIL then parentheses
    // need to be turned into pipes
    if(line.indexOf("IF") < 0 && line.indexOf("UNTIL") < 0){
        line = line.replace(/[\(\)]/g,"|");
    }

    // TODO: if line contains pattern PROCEDURE_NAME (...)  then it needs to be surrounded with []


    //2. preserve indentation?
    var firstCharPos = line.search("[^ ]");
    var indent = line.substring(0, firstCharPos ); //anything from 0 up to first non-space is indent

    // TODO: 

    line = line.substring(firstCharPos);

    
    // 3. figure out tokens

    var beginToken = "[";  //defaults
    var endToken = "]\n";

    // if it's a block statement it cannot end with a bracket
    if( isBlockStatement(line)){
      endToken = "\n   ";  //NOTE: extra spaces are for proper indent of block statements on next line.
      nestLevel++;         //   this fixes the indent problem for blocks where the first line after IF/REPEAT etc.
                          // needs to be indented.
    }

    //line = line.replace(/[\}]/g,"]");
    //line = line.replace(/[\{}]/g,"[");

    if(line.indexOf("}") >= 0){   //if this is the closing curly for a block statement
      if(i<lines.length-1 && lines[i+1].indexOf("ELSE")>=0){  // if next thing is an ELSE then only single-close 
        out +="]\n";                      
      }
      else{
        out+="]]\n";
      }
      nestLevel--;
    }
    else if(line.indexOf("{") >= 0){
      out+=""
    }
    else if(line.search("[^ \\n]")<0){
      out += "\n";
    }
    else if(line.indexOf("ELSE")>=0){
      out += "ELSE\n   ";  //NOTE: adding indent here as part of ELSE token
    }
    else{
      if(i>0 && lines[i-1].indexOf("{")>=0){
        beginToken = "[[";
      }

      //Don't use indent if code is already nested.
      // Initial tab is taken car of endToken from IF/REPEAT/PROCEDURE, etc.
      if(nestLevel>0){
        indent ="";
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

$("input[name='codeType']").change(function(){

    console.log("changed and val is: ")
    codeType = $("input[name='codeType']:checked").val();

    toggleCodeType(codeType);

});

function toggleCodeType(codeType){

    if(codeType==="apml"){ //assumes that code in input is ap now and needs to be switched. 

      var apml = AP2apml($("#code").val()); // convert to apml
      $("#code").val(apml); // put it in input box

      $("#apHelp").hide();
      $("#apmlHelp").show();
    }
    else{  // assumes it's apml and needs to be switched to ap

      console.log("converting apml-to-AP...");
      var ap = apml2AP($("#code").val());

      $("#code").val(ap);

      $("#apHelp").show();
      $("#apmlHelp").hide()

    }

    convert(); //shouldn't need to do this but...

}


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

  // toogle radio button to apml
 // $("input[name='codeType'][value='apml']").prop("checked", true);
  //toggleCodeType('apml');

  // then load the sample
  loadSample($("#loadSample").val());
})






//// AT START ///

//loadSample("if");
convert();








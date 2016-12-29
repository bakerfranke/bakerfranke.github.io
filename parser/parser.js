
//document.getElementById("code").addEventListener("input", parse);



var multilineBlocks = ["IF","ELSE", "REPEAT","FOR EACH","PROCEDURE"];


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

    if(line.indexOf("}") >= 0){
      out+="]]\n";
    }
    else if(line.indexOf("{") >= 0){
      out+=""
    }
    else if(line.search("[^ \\n]")<0){
      out += "\n";
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

function isBlockStatement(line){

  for(var i=0; i<multilineBlocks.length; i++){
    if(line.indexOf(multilineBlocks[i]) >= 0){
      console.log("found block statement "+line);
      return true;
    }
  }
  return false;

}
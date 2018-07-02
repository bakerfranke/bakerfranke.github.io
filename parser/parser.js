
document.getElementById("code").addEventListener("input", function(){
  ap2apml();
  apml2ap();

});

document.getElementById("dump").addEventListener("input", function(){
  apml2ap();
});



function debug(msg){
  console.log(msg)
}

function apml2ap(code){

  //var lines = code.split("\n");
  var lines = $("#dump").val().split("\n");

  var out = "";
  var indent = 0; //keep track of indent depth

  for(var i=0; i<lines.length; i++){

    var line = lines[i];

    console.log(i+".) "+line);


      //figure out how to replace pipes || with proper parenstr.search(/^[ ]*$/g)s ()
    line = pipe2parens(line);

    line = findNoParamProcedures(line);


    

    // after processing procedures then double brackets are curly braces
    // ..unless they are the closing ]] as part of assignment statement?  so check that first

    if(line.search(/(<-)/g) < 0){ 
      line = line.replace(/\] *\]/g, "}");
    }

    line = line.replace(/\[ *\[/g,"{\n");
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

  

    if(line.search(/^[ ]*$/g) == -1){ //if the line is NOT just all spaces
      
      out += line+"\n";
    } 
    else{
      console.log("\tONLY SPACES!!!");
    }
    // if there is an opening curly brace increase indent here to affect future lines
    if(line.indexOf("{")>=0) indent+=2;

  }

  $("#apDump").val(out)
  //return out;

}

function findNoParamProcedures(line){

  // find pattern: [Procedure] -- these are no-args function calls
  var loc = line.search(/[\[][A-Za-z_]{1,}[\]]/);

  while(loc >= 0){
  //   console.log("FOUND PROCEDURE WITH NO PARAMS "+line+ " at loc "+loc);

    var firstChunk = line.slice(0,loc);
    var secondChunk = line.slice(loc+1);

  //   //loc is where word starts, find word end;
    var end = secondChunk.search(/[\]]/g); // force to regex search from starting point (indexOf(exp, start) doesn't take regex)


  //   // slice in "()"

    line = firstChunk+secondChunk.slice(0,end)+"()"+secondChunk.slice(end+1);

     console.log("\tchanged to: "+line);

  //   // find next
     loc = line.search(/[\[][A-Za-z_]{1,}[\]]/);

   }

  return line;


}

function pipe2parens(line){

  // find the starting point of every procedure call with pipes.  e.g. Pattern: "PROCEDURE |""
  var loc = line.search(/[A-Za-z_]{1,}[0-9]*[ ]*[|]/);

  while(loc>=0){

    //find the pipe
    var pi = line.indexOf("|",loc);

    //change it to open paren
    line = line.slice(0,pi)+"("+line.slice(pi+1);
    //find next loc
    loc = line.search(/A-Za-z_]{1,}[0-9]*[ ]*[|]/);

  }

  console.log("AFTER open paren procedure: "+line);

  // now, remaining pipes are all closing parens
  line = line.replace(/[\|]/g,")");

  console.log("AFTER close paren procedure: "+line);



  //alternate first occurance to (  then last occurance to )
  // should deal with embeded pipes...which shouldn't happen but still.
  // var out = str;
  // while ( out.search(/[|]/g) >= 0){

  //   var left = out.indexOf("|");
  //   var right = out.lastIndexOf("|");

  //   out = out.slice(0, left)+"("+out.slice(left+1, right)+")"+out.slice(right+1)


  // }
  // return out;

  return line;

}


function ap2apml(code){

  var lines = $("#code").val().split("\n");
  //var lines = code.split("\n");

  var out = "";

  var nestLevel = 0; //count nesting of blocks, use to determine whether to use indent at the end.

  for(var i=0; i<lines.length; i++){

    var line = lines[i];

    // figure out what to do with line contents    
    line = processProcedureCalls(line,"");

    //0. Find empty parens (e.g. "()") and replace with nothing
    line = line.replace(/[ ]*\([ ]*\)/g,"");


    //1. if it's NOT an IF or a REPEAT UNTIL or a FOR then parentheses
    // need to be turned into pipes
    if(line.indexOf("IF") < 0 && line.indexOf("UNTIL") < 0 && line.indexOf("FOR")){
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

  $("#dump").val(out);
  //console.debug(out);
  //return out;
}

function processProcedureCalls(line, tabs){

  var innerMost = line.search(/[A-z_]*[ ]*[\(][A-z 0-9_\"\|,]*[\)]/);  //find innermost pattern of PROCEDURE ()

  console.log(tabs+"for >>"+line+"<< innermost starts at: "+innerMost);

  // innerMost will be the index where the code actually starts
  // if it's indented then it's possible it's already handled with surrounding [ ], just indented.
  // So, see if everything from 0 to innerMost is blank space.
  var leading = line.slice(0,innerMost);
  if(leading.search(/[^ ]/) == -1){ //means the whole line is a procedure call.  Do nothing.
    return line;

  }

  var open = line.indexOf("(",innerMost);

 

  if(innerMost>=0){
    var close = line.indexOf(")",open);

    line = line.slice(0, innerMost)+"[" + line.slice(innerMost, open)+"|"+line.slice(open+1,close)+"|]"+line.slice(close+1);

    // RECURSE
    line = processProcedureCalls(line, tabs+"\t");
  }
  else{
    console.log(tabs+" Nothing to replace");
  }

  line = line.replace(/\|[ ]*\|/g, "");

  return line;

}


function ap2apml_old(){

  var lines = $("#code").val().split("\n");
  var out = "";
  for(var i =0; i<lines.length; i++){


    var line = processLine(lines[i],"");
    var beginToken = "";
    var endToken = "";

   



    // if(line.search(/^[ ]*[^\[].*[^\]]/)>=0){ //line doesn't start with "[" aready && and it's not just closing then fix it!
    //   beginToken = "[";
    //   endToken = "]\n";
    // }
    // else if(line.search(/^[ ]*[\[]*[ ]*$/) >= 0){ //if line contains only open brakets, then no line break
    //   endToken = "";
    // }

    // if(i>0 && lines[i-1].indexOf("{")>=0){
    //   leadingWhiteSpace = "";
    // }

    out += beginToken + line+ endToken;

  }


  $("#dump").val(out);

} 

function pad(amt){
  //debug("pad amt: "+amt);
  if(amt < 0) return "";
  return Array(amt+1).toString().replace(/,/g," ")
}

// Patterns: PRODCEDURE (foo)   PROCEDURE (), PROCEDURE (PROCEDURE(foo), PROCEDURE())
// BECOMES: [ PROCEDURE |foo|]  [PROCEDURE],  [PROCEDURE | [PROCEDURE |foo|], [PROCEDURE]]
// ONLY NEED TO HANDLE first 2 cases and recurse
var indent = 0;

function processLine(line, tabs){
  console.log(tabs+"PROCESSING line: >>"+line+"<<");
  var out = "";
  var endToken = "\n";

  // preserve leading whitespace
  var firstCharPos = line.search("[^ ]");
  var leadingWhiteSpace = line.substring(0, firstCharPos ); //anything from 0 up to first non-space is indent
  line = line.slice(firstCharPos);


  if(line.search(/IF|REPEAT|FOR|PROCEDURE/g)>=0){
    line = "["+line;
  }
  else if(line.indexOf("{")>=0){
    //indent += 2;
    line = "  [";
    endToken = "";
  }
  else if(line.indexOf("}")>=0){
    //indent -= 2;
    line = "\n]]";
  }
  else {
    // PROCESS POTENTIAL FUNCTION CALL
    var innerMost = line.search(/[A-z_]*[ ]*[\(][A-z 0-9_\"\|,]*[\)]/);  //find innermost pattern of PROCEDURE ()

    console.log(tabs+" innermost starts at: "+innerMost);

    var open = line.indexOf("(",innerMost);

   

    if(innerMost>=0){
      var close = line.indexOf(")",open);

      line = line.slice(0, innerMost)+"[" + line.slice(innerMost, open)+"|"+line.slice(open+1,close)+"|]"+line.slice(close+1);

      // RECURSE
      line = processLine(line, tabs+"\t");
    }
    else{
      console.log(tabs+" Nothing to replace");
    }

    line = line.replace(/\|[ ]*\|/g, "");
  }

  //if(line.search(/^[ ]*[^\[]{1,}[A-z0-9 \(\)_<-\[\]\|,]{1,}$/) >= 0){
  if(line.search(/^[ ]*[\[]{1,}/) >= 0){ //if it starts with [

  }
  else if(line.search(/^[ ]*[\[][A-z0-9 \]\[\(\),_\|\"\'<-]{1,}$/) <0 ){
    console.log("FOUND LINE that doesn't start with a [ --> "+line);
    line = "["+line+"]<<<";
  }

  return leadingWhiteSpace + line + endToken;
}


var multilineBlocks = ["IF","ELSE", "REPEAT","FOR EACH","PROCEDURE", "FOR"];


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
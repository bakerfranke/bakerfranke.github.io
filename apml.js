var sampleCode = '[a <- 7]\n[b <- 5]\n[DISPLAY | a |]\n[ IF ( a ≤ 7)\n   [ a <- 6 ]\nELSE\n  [[IF ( a ≥ 10)\n   [ a <- 10 ]]]\n]\n\n[REPEAT 5 TIMES\n  [[DISPLAY |\"foo\"|]]\n]\n[REPEAT UNTIL (a ≤ 10)\n  [[DISPLAY |\"foo\"|]]\n]\n[FOR EACH item IN list\n  [[DISPLAY |item|]\n[IF (foo=blah)\n  [[DISPLAY |\"oy\"|]]\n]\n]]\n[PROCEDURE |a, b, c|\n  [[a <- 5]\n[IF (a = 5)\n  [[b <- a+b]]\n]]]\n[display]';

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
  $("#output").text(input);
  $("#liveout").html(input);
  console.log("input\n "+JSON.stringify($("#code").val()));
}

/*
* Sets font size based on range slider #fSize
*/
function fontSize(){
   $("#liveout").css("font-size", $("#fSize").val()+'px');
   $("#fSizeout").html($("#fSize").val())
}

/*
* Load sample from hard-coded global var
*/
function loadSample(){
  $("#code").val(sampleCode);
  convert();
}


////// EVENT HANDLERS //////

// click and oninput for convert
$("#go").click(convert);
document.getElementById("code").addEventListener("input", convert);

$("#fSize").change(fontSize);
document.getElementById("fSize").addEventListener("input", fontSize);

$("#loadSample").click(loadSample);


//// AT START ///

loadSample();
convert();



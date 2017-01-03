
document.getElementById("code").addEventListener("input", function(){
  ap2apml();
  apml2ap();

});

document.getElementById("dump").addEventListener("input", function(){
  apml2ap();
});

//SPACE FOR TESTING OUT array of a->b conversions
// where a: regex b: replaceVal  to use with line.replace(a, b)

var convs = {}
var convs.ap2apml = {};
var c = []; // temp object for building
c.push( {a:"[\{]", b:"[["});
c.push( {a: "[\}]", b: "]]"});
c.push( {a: "(?=IF|FOR|REPEAT|PROCEDURE)", "["});
c.push( {a: "(?=[A-Za-z0-9]*[ ]*(\(\)))", "["}); // DON'T DO GLOBAL.  DO UNTIL pattern fails lookahed for "PROCEDURE (" --> [PROCEDURE 
c.push( {a: "(?=[A-Za-z0-9]*[ ]*)[\(]", "|"}); //looks ahead for "PROCEDURE (", but places cursor on the "(" to replace with |

function ap2apml(){

}

function apml2ap(){

}
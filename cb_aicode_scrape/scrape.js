
// Load this code locally in dev console on this college board website
// https://collegereadiness.collegeboard.org/k-12-school-code-search

// run > dump_all_state_aicodes()
// watch the console output.
// The code should: load the list of schools for each state, and append them to a growing list (megalist)
// Copy/paste the list (given as plain tab-separated text with \n newlines) into spreadsheet.

//global vars (lazy)
var megalist = "";
var statelist = [];

function dump_all_state_aicodes(){
	statelist = make_state_list();

	//kicks off recursion. function appends to megalist
	wait_till_loaded(0);
	console.log(megalist);
}


function make_state_list(){

	$("#edit-state option").each(function() {
		var statename = $(this).val();
		if(statename !== ""){
	   		statelist.push($(this).val());
	   	}
	});

	return statelist
}

// poll the html element <div class='schools'></div> until it has contents.
//   When the load button is clicked on the webpage it does an ajax-y load of the schools list in which
//   it empties out this div, waits a sec, then populates it.  This simply waits until the div has contents.
var tick = 0;
function wait_till_loaded(i){

	setTimeout(function(){
		//console.log("t="+tick);
		if(tick==0){ // first run
			$("#edit-state").val(statelist[i]);
			$("#edit-submit").click(); // this takes a second to do an ajax-y load
			console.log("loading codes for state["+i+"] "+statelist[i]);
			tick++;
			wait_till_loaded(i);
		}
		else if(tick >= 50){
			console.log("error move on");
			tick = 0; // reset tick counter
				wait_till_loaded(i+1);
		}
		else if($(".schools").html()=="") {
			console.log("loading...");
			tick++;
			wait_till_loaded(i);
		}
		else{ // schools have loaded onto page, dump it.
			dump_codes_for_current_state();
			console.log("\t...done.");

			//if there are more states in list, go to next one/recurse
			if( i<statelist.length-1){
				tick = 0; // reset tick counter
				wait_till_loaded(i+1);
			}
		}
	}, 100);
}


// dump codes into global list 'megalist'
function dump_codes_for_current_state(){
	for(var i=0; i<$(".school-name").length; i++){
		megalist += $("#edit-state").val()+"\t"+$(".school-name")[i].innerHTML +"\t"+$(".school-code")[i].innerHTML+"\n";
	}
	console.log("megalist length: "+megalist.split("\n").length); //lazy way to count records. It's just a big tsv string

}


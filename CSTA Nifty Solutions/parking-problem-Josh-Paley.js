var tally;

function placeCars(start, end){
    if( end - 1.0 - start < 0) return 0;
    var carStart = randBetween(start, end-1.0);
  	var leftNum = placeCars(start, carStart);
  	var rightNum = placeCars(carStart + 1.0, end);

  return 1+leftNum+rightNum;
}

// return random float between [lo,hi)
function randBetween(lo, hi){

	return (Math.random()* (hi-lo)) +lo;

}

function makeTally(n){
	tally = new Array(n);
	for(var i=0; i<n; i++){
		tally[i]=0;
	}
}

function doTest(nTimes, parkingSize){

	makeTally(parkingSize);
	for(var i=0; i<nTimes; i++){
		tally[placeCars(0, parkingSize)]++;
	}
	console.log(tally);

}
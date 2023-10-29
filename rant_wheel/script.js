let spinning = false;
var tickSound;
var bellSound;
let tickIntervalId;

const segments = [];
segments[0] = 'Trick-or-Teaching with AI'; //4 //8
segments[1] = 'Parent AI teacher conferences';
segments[2] = 'Stop making your products better!'; //3 //7
segments[3] = 'How \'bout Actual Intelligence!';
segments[4] = 'My AI dog did my homework'; //2 //6
segments[5] = 'Who needs CS anyway!?!?';
segments[6] = 'Apolgies. Thought you might learn!';  //1 //5 //9
segments[7] = 'Let us show you it works!';

var desiredSegments = [3,6,8]; //these are array index+1.  wheel will always land on one of these.
var desiredSegmenti = 0;

const colors = ['#E57373', '#81C784', '#64B5F6', '#FFD54F']; // Red, Green, Blue, Yellow


window.onload = function () {

    //load sounds
    tickSound = document.getElementById('tickSound');
    bellSound = document.getElementById('bellSound');
};

// Function to play the tick sound with variable speed
function playTickWithVariableSpeed() {
   //const tickSound = document.getElementById('tickSound');
   tickSound.currentTime = 0;

    let tickInterval = 15; // Initial tick interval in milliseconds
    const maxInterval = 500; // Maximum tick interval in milliseconds, this doesn't matter.  will get killed by intervalId anyway

    let tickIncretment = 15;

    // Define a function for playing the tick sound
    function playTick() {
        tickSound.play();

        // Gradually increase the tick interval
        tickInterval += tickIncretment; // Increase the interval by 100ms each time
        tickSound.currentTime = 0;

        // Continue playing ticks if the interval is within the desired range
        if (tickInterval <= maxInterval) {
            tickIntervalId = setTimeout(playTick, tickInterval);
        
        }
    }

    // Start playing the ticks
    playTick();
}

function spinWheel() {
    const wheel = document.getElementById('wheel');
    const segments = 8;

    var duration = Math.floor((Math.random()*3000)+10000); //duration random between 10-13 secs
    console.log(duration);

    // Disable the button while the wheel is spinning
    document.querySelector('button').disabled = true;

    // Set up the spin transition
    wheel.style.transition = `transform ${duration / 1000}s cubic-bezier(0, 0.5, 0.3, 1)`;

    // choose the current desired segement, and increment the index for next time
    var desiredSegment = desiredSegments[desiredSegmenti];
    desiredSegmenti = (desiredSegmenti + 1) % desiredSegments.length; //wrap the desired segements indexes.

    // Calculate the rotation needed to land on the desired segment
    const segmentDegrees = 360 / segments;
    const offset = segmentDegrees / 2;
    const desiredRotation = 360 - (segmentDegrees * desiredSegment) + offset;

    // Calculate the number of spins needed to land on the desired segment
    const minTurns = 8;  // Minimum number of full wheel turns
    const randomTurns = Math.floor(Math.random() * segments);  // Additional random turns
    const totalTurns = minTurns + randomTurns;  // Total number of turns

    // Calculate the total degrees to rotate
    const totalDegrees = totalTurns * 360 + desiredRotation;

    // Apply the spin
    wheel.style.transform = `rotate(${totalDegrees}deg)`;

    playTickWithVariableSpeed();

    // Wait for the spin to finish
    setTimeout(() => {
        // Normalize the rotation
        const normalizedRotation = desiredRotation % 360;
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${normalizedRotation}deg)`;

        // Re-enable the button
        document.querySelector('button').disabled = false;
        clearTimeout(tickIntervalId);
        bellSound.play();
        bellSound.currentTime = 0;

    }, duration);  // Use the duration parameter
}


function createSegments() {
    const wheel = document.getElementById('wheel');

    //segment names and colors in global vars up above

    const numSegments = segments.length;
    const anglePerSegment = 360 / numSegments;

    for (let i = 0; i < numSegments; i++) {
        const angle = anglePerSegment * i - 90;
        const nextAngle = angle + anglePerSegment;
        const textAngle = angle + anglePerSegment / 2;

        const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

        const startX = 250 + 250 * Math.cos(Math.PI * angle / 180);
        const startY = 250 + 250 * Math.sin(Math.PI * angle / 180);
        const endX = 250 + 250 * Math.cos(Math.PI * nextAngle / 180);
        const endY = 250 + 250 * Math.sin(Math.PI * nextAngle / 180);
        
        const midAngle = (angle + nextAngle) / 2;
        const textX = 250 + 130 * Math.cos(Math.PI * midAngle / 180);
        const textY = 250 + 130 * Math.sin(Math.PI * midAngle / 180);

        const pathData = [
            `M 250 250`,
            `L ${startX} ${startY}`,
            `A 250 250 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'Z'
        ].join(' ');

        const segment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        segment.setAttribute('d', pathData);
        segment.setAttribute('fill', colors[i % colors.length]);
        segment.setAttribute('stroke', '#ffffff');
        segment.setAttribute('stroke-width', '2');
        wheel.appendChild(segment);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('dy', '5');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('transform', `rotate(${textAngle} ${textX} ${textY})`);
        text.textContent = segments[i];
        text.style.fill = '#ffffff';

        text.style.fontSize = '14px';
        text.style.fontWeight = 'bold';
        text.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';

        wheel.appendChild(text);
    }
}


createSegments();


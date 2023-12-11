document.getElementById('decryptButton').addEventListener('click', function() {
    const text = document.getElementById('inputText').value.toUpperCase();
    const output = document.getElementById('output');
    output.innerHTML = '';

    for (let shift = 1; shift <= 26; shift++) {
        output.innerHTML += shift + ': ' + caesarShift(text, -shift) + '<br>';
    }

    document.getElementById('outputLabel').textContent = 'Scan the list and see if something looks like real words!';
});

function caesarShift(str, amount) {
    return str.replace(/[A-Z]/g, function(char) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + amount + 26) % 26) + 65);
    });
}

document.getElementById('toggleInstructions').addEventListener('click', function() {
    var instructions = document.getElementById('instructions');
    if (instructions.style.display === 'none' || instructions.style.display === '') {
        instructions.style.display = 'block';
        this.textContent = 'Hide Instructions';
    } else {
        instructions.style.display = 'none';
        this.textContent = 'Show Instructions';
    }
});

document.getElementById('modeDecrypt').addEventListener('click', function() {
    toggleMode(false);
    document.getElementById('inputText').placeholder = "Enter cipher text here...";
});

document.getElementById('modeEncrypt').addEventListener('click', function() {
    toggleMode(true);
    document.getElementById('inputText').placeholder = "Enter plain text here...";
});

document.getElementById('encryptButton').addEventListener('click', function() {
    const text = document.getElementById('inputText').value.toUpperCase();
    const shift = parseInt(document.getElementById('shiftAmount').value);
    const output = document.getElementById('output');
    document.getElementById('outputLabel').textContent = 'Encrypted Text (shift: ' + shift + ')';
    output.innerHTML = caesarShift(text, shift);
});

// function toggleMode(isEncryptMode) {
//     document.getElementById('decryptButton').style.display = isEncryptMode ? 'none' : 'block';
//     document.getElementById('encryptOptions').style.display = isEncryptMode ? 'block' : 'none';
//     document.getElementById('output').innerHTML = ''; // Clear output

//     // Corrected the ID references here
//     document.getElementById('outputLabel').textContent = isEncryptMode ? 'Encrypted Text (shift: 1)' : 'Scan the list and see if something looks like real words!';
//     document.getElementById('modeDecrypt').classList.toggle('active', !isEncryptMode);
//     document.getElementById('modeEncrypt').classList.toggle('active', isEncryptMode);
//     document.getElementById('inputSection').classList.toggle('encrypt-mode', isEncryptMode);
//     document.getElementById('inputSection').classList.toggle('decrypt-mode', !isEncryptMode);
// }

function toggleMode(isEncryptMode) {
    // Logic for showing and hiding buttons
    document.getElementById('decryptButton').style.display = isEncryptMode ? 'none' : 'block';
    document.getElementById('encryptOptions').style.display = isEncryptMode ? 'block' : 'none';
    document.getElementById('output').innerHTML = ''; // Clear output

    // Update the button colors based on the active mode
    var decryptButton = document.getElementById('modeDecrypt');
    var encryptButton = document.getElementById('modeEncrypt');

    if (isEncryptMode) {
        decryptButton.classList.remove('decrypt-active');
        decryptButton.classList.add('inactive');
        encryptButton.classList.remove('inactive');
        encryptButton.classList.add('encrypt-active');
    } else {
        decryptButton.classList.remove('inactive');
        decryptButton.classList.add('decrypt-active');
        encryptButton.classList.remove('encrypt-active');
        encryptButton.classList.add('inactive');
    }
    document.getElementById('decryptButton').style.display = isEncryptMode ? 'none' : 'block';
    document.getElementById('encryptOptions').style.display = isEncryptMode ? 'block' : 'none';
    document.getElementById('output').innerHTML = ''; // Clear output

    // Corrected the ID references here
    document.getElementById('outputLabel').textContent = isEncryptMode ? 'Encrypted Text (shift: 1)' : 'Scan the list and see if something looks like real words!';
    document.getElementById('modeDecrypt').classList.toggle('active', !isEncryptMode);
    document.getElementById('modeEncrypt').classList.toggle('active', isEncryptMode);
    document.getElementById('inputSection').classList.toggle('encrypt-mode', isEncryptMode);
    document.getElementById('inputSection').classList.toggle('decrypt-mode', !isEncryptMode);
}

// Initialize to decrypt mode
toggleMode(false);




toggleMode(false); // Initialize to decrypt mode






/*
document.getElementById('decryptButton').addEventListener('click', function() {
    const text = document.getElementById('inputText').value.toUpperCase();
    const output = document.getElementById('output');
    output.innerHTML = '';

    for (let shift = 1; shift <= 26; shift++) {
        // Here we modify the shift to the opposite direction
        output.innerHTML += shift + ': ' + caesarShift(text, -shift) + '<br>';
    }

    document.getElementById('outputLabel').textContent = 'Scan the list and see if something looks like real words!';

});

function caesarShift(str, amount) {
    return str.replace(/[A-Z]/g, function(char) {
        // Adjust the formula here for the shift
        return String.fromCharCode(((char.charCodeAt(0) - 65 + amount + 26) % 26) + 65);
    });
}

document.getElementById('toggleInstructions').addEventListener('click', function() {
    var instructions = document.getElementById('instructions');
    if (instructions.style.display === 'none' || instructions.style.display === '') {
        instructions.style.display = 'block';
        this.textContent = 'Hide Instructions';
    } else {
        instructions.style.display = 'none';
        this.textContent = 'Show Instructions';
    }
});


document.getElementById('modeDecrypt').addEventListener('click', function() {
    toggleMode(false);
    document.getElementById('inputText').placeholder = "Enter cipher text here..."
});

document.getElementById('modeEncrypt').addEventListener('click', function() {
    toggleMode(true);
    document.getElementById('inputText').placeholder = "Enter plain text here..."
});


document.getElementById('encryptButton').addEventListener('click', function() {
    const text = document.getElementById('inputText').value.toUpperCase();
    const shift = parseInt(document.getElementById('shiftAmount').value);
    const output = document.getElementById('output');
    document.getElementById('outputLabel').textContent = 'Encrypted Text (shift: ' + shift + ')';
    output.innerHTML = caesarShift(text, shift);
});

function toggleMode(isEncryptMode) {
    document.getElementById('decryptButton').style.display = isEncryptMode ? 'none' : 'block';
    document.getElementById('encryptOptions').style.display = isEncryptMode ? 'block' : 'none';
    document.getElementById('output').innerHTML = ''; // Clear output

    // Reset output label
    document.getElementById('outputLabel').textContent = isEncryptMode ? 'Encrypted Text (shift: 1)' : 'Scan the list and see if something looks like real words!';

    document.getElementById('modeDecrypt').classList.toggle('active', !isEncryptMode);
    document.getElementById('modeEncrypt').classList.toggle('active', isEncryptMode);
    document.getElementById('input-section').classList.toggle('encrypt-mode', isEncryptMode);
    document.getElementById('input-section').classList.toggle('decrypt-mode', !isEncryptMode);
}

// ... existing toggleMode function ...



toggleMode(false);
*/

let currentMapping = {};

document.getElementById('generateMapping').addEventListener('click', generateRandomMapping);
document.getElementById('encryptButton').addEventListener('click', () => transformText(true));
document.getElementById('decryptButton').addEventListener('click', () => transformText(false));

function generateRandomMapping() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    currentMapping = {};
    alphabet.forEach((letter, i) => {
        currentMapping[letter] = shuffled[i];
    });
    displayMapping();
}

function displayMapping() {
    const mappingDiv = document.getElementById('cipherMapping');
    mappingDiv.innerHTML = '<table id="mappingTable"><tr id="topRow"></tr><tr id="bottomRow"></tr></table>';
    const topRow = document.getElementById('topRow');
    const bottomRow = document.getElementById('bottomRow');

    Object.keys(currentMapping).forEach(key => {
        const topCell = document.createElement('td');
        topCell.textContent = key;
        topRow.appendChild(topCell);

        const bottomCell = document.createElement('td');
        const input = document.createElement('input');
        input.value = currentMapping[key];
        input.maxLength = 1;
        input.style.width = '20px';
        input.style.textAlign = 'center';
        input.addEventListener('input', () => handleMappingChange(key, input.value));
        bottomCell.appendChild(input);
        bottomRow.appendChild(bottomCell);
    });
}

function handleMappingChange(originalLetter, newLetter) {
    if (newLetter.match(/[A-Z]/)) {
        const oldLetter = currentMapping[originalLetter];
        for (let key in currentMapping) {
            if (currentMapping[key] === newLetter) {
                currentMapping[key] = oldLetter;
                break;
            }
        }
        currentMapping[originalLetter] = newLetter;
    }
    displayMapping();
}







function transformText(isEncrypting) {
    const inputText = document.getElementById('inputText').value.toUpperCase();
    const outputText = inputText.split('').map(char => {
        if (currentMapping[char]) {
            return isEncrypting ? currentMapping[char] : getKeyByValue(currentMapping, char);
        }
        return char;
    }).join('');
    document.getElementById('outputText').value = outputText;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// Generate initial random mapping
generateRandomMapping();

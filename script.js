const setupSection = document.getElementById('setup');
const gameSection = document.getElementById('game');
const scoreSection = document.getElementById('score');
const playButton = document.getElementById('play-button');
const remainingWordsElement = document.getElementById('remaining-words');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const romanianWordElement = document.getElementById('romanian-word');
const optionsElement = document.getElementById('options');
const finalScoreElement = document.getElementById('final-score');

let words = [];
let gameWords = [];
let currentWordIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;

playButton.addEventListener('click', startGame);

async function startGame() {
    const wordCount = 10;

    await fetchAndParseCSV();

    gameWords = getRandomWords(words, wordCount);
    if (gameWords.length < wordCount) {
        alert(`Sözlükte isteğiniz için yeterli kelime yok. ${gameWords.length} kelime ile oynanıyor.`);
    }
    if (gameWords.length === 0) {
        alert('Oynayacak kelime yok. Lütfen sözlük dosyasını kontrol edin.');
        return;
    }


    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    updateStats();
    showNextWord();
}

async function fetchAndParseCSV() {
    const response = await fetch('Short_Dictionary_RO.csv');
    const data = await response.text();
    words = Papa.parse(data, { header: true }).data;
}

function getRandomWords(sourceArray, count) {
    const shuffled = sourceArray.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function showNextWord() {
    if (currentWordIndex >= gameWords.length) {
        endGame();
        return;
    }

    updateStats();
    const word = gameWords[currentWordIndex];
    romanianWordElement.textContent = word['Romence Kelime'];

    const correctAnswer = word['Türkçe Anlamı'];
    const wordType = word['Kelime Türü'];

    const options = getOptions(correctAnswer, wordType);
    displayOptions(options, correctAnswer);
}

function getOptions(correctAnswer, wordType) {
    const sameTypeWords = words.filter(w => w['Kelime Türü'] === wordType && w['Türkçe Anlamı'] !== correctAnswer);
    const shuffled = sameTypeWords.sort(() => 0.5 - Math.random());
    const wrongOptions = shuffled.slice(0, 3).map(w => w['Türkçe Anlamı']);

    const options = [correctAnswer, ...wrongOptions];
    return options.sort(() => 0.5 - Math.random());
}

function displayOptions(options, correctAnswer) {
    while (optionsElement.firstChild) {
        optionsElement.removeChild(optionsElement.firstChild);
    }
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.dataset.option = option;
        button.addEventListener('click', () => checkAnswer(option, correctAnswer));
        optionsElement.appendChild(button);
    });
}

function checkAnswer(selectedOption, correctAnswer) {
    const allButtons = optionsElement.querySelectorAll('button');
    allButtons.forEach(button => {
        button.disabled = true; // Disable all buttons
    });

    const selectedButton = optionsElement.querySelector(`[data-option="${selectedOption}"]`);
    const correctButton = optionsElement.querySelector(`[data-option="${correctAnswer}"]`);

    if (selectedOption === correctAnswer) {
        correctAnswers++;
        selectedButton.classList.add('correct');
    } else {
        incorrectAnswers++;
        selectedButton.classList.add('incorrect');
        correctButton.classList.add('correct');
    }

    currentWordIndex++;
    updateStats();
    setTimeout(showNextWord, 1000); // Wait 1 second before next word
}

function updateStats() {
    remainingWordsElement.textContent = gameWords.length - currentWordIndex;
    correctCountElement.textContent = correctAnswers;
    incorrectCountElement.textContent = incorrectAnswers;
}

function endGame() {
    gameSection.classList.add('hidden');
    scoreSection.classList.remove('hidden');

    const score = (correctAnswers / gameWords.length) * 100;
    finalScoreElement.textContent = score.toFixed(2);

    const wordListElement = document.getElementById('word-list');
    let wordListHTML = '<h2>Oyundaki Kelimeler</h2><table>';
    wordListHTML += '<tr><th>Romence Kelime</th><th>Türkçe Anlamı</th><th>Örnek Cümle</th></tr>';
    gameWords.forEach(word => {
        wordListHTML += `<tr><td>${word['Romence Kelime']}</td><td>${word['Türkçe Anlamı']}</td><td>${word['Örnek Cümle']}</td></tr>`;
    });
    wordListHTML += '</table>';
    wordListElement.innerHTML = wordListHTML;
}

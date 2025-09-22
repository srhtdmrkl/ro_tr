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
const gameSubtitleElement = document.getElementById('game-subtitle');
const swapIcon = document.getElementById('swap-icon');
const lang1Span = document.getElementById('lang1');
const lang2Span = document.getElementById('lang2');

let isRoToTrMode = true;

let words = [];
let gameWords = [];
let currentWordIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;

playButton.addEventListener('click', startGame);
swapIcon.addEventListener('click', toggleGameMode);

function getCleanWord(word) {
    let cleanWord = word.split(',')[0];
    cleanWord = cleanWord.split('(')[0];
    return cleanWord.trim();
}

function toggleGameMode() {
    isRoToTrMode = !isRoToTrMode;

    lang1Span.classList.add('fade-out');
    lang2Span.classList.add('fade-out');

    setTimeout(() => {
        if (isRoToTrMode) {
            lang1Span.textContent = 'Romence🇷🇴';
            lang2Span.textContent = 'Türkçe🇹🇷';
        } else {
            lang1Span.textContent = 'Türkçe🇹🇷';
            lang2Span.textContent = 'Romence🇷🇴';
        }
        lang1Span.classList.remove('fade-out');
        lang2Span.classList.remove('fade-out');
    }, 300); // Match this duration with the CSS transition duration
}


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

    let questionWord, correctAnswer;

    if (isRoToTrMode) {
        questionWord = word['Romence Kelime'];
        correctAnswer = word['Türkçe Anlamı'];
    } else {
        questionWord = word['Türkçe Anlamı'];
        correctAnswer = word['Romence Kelime'];
    }
    const wordType = word['Kelime Türü'];

    romanianWordElement.textContent = questionWord;

    const options = getOptions(correctAnswer, wordType);
    displayOptions(options, correctAnswer);
}

function getOptions(correctAnswer, wordType) {
    let correctAnswerKey, wrongOptionKey;
    if (isRoToTrMode) {
        correctAnswerKey = 'Türkçe Anlamı';
        wrongOptionKey = 'Türkçe Anlamı';
    } else {
        correctAnswerKey = 'Romence Kelime';
        wrongOptionKey = 'Romence Kelime';
    }

    const sameTypeWords = words.filter(w => w['Kelime Türü'] === wordType && w[wrongOptionKey] !== correctAnswer);
    const shuffled = sameTypeWords.sort(() => 0.5 - Math.random());
    const wrongOptions = shuffled.slice(0, 3).map(w => w[wrongOptionKey]);

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
        button.disabled = true;
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
    if (isRoToTrMode) {
        wordListHTML += '<tr><th>Romence Kelime</th><th>Türkçe Anlamı</th><th>Örnek Cümle</th></tr>';
        gameWords.forEach(word => {
            const romanianWord = word['Romence Kelime'];
            const cleanRomanianWord = getCleanWord(romanianWord);
            const dexonlineLink = `https://dexonline.ro/definitie/${cleanRomanianWord}/paradigma`;
            wordListHTML += `<tr><td>${romanianWord} <a href="${dexonlineLink}" target="_blank" class="dexonline-link">🔗</a></td><td>${word['Türkçe Anlamı']}</td><td>${word['Örnek Cümle']}</td></tr>`;
        });
    } else {
        wordListHTML += '<tr><th>Türkçe Kelime</th><th>Romence Anlamı</th><th>Örnek Cümle</th></tr>';
        gameWords.forEach(word => {
            const romanianWord = word['Romence Kelime'];
            const cleanRomanianWord = getCleanWord(romanianWord);
            const dexonlineLink = `https://dexonline.ro/definitie/${cleanRomanianWord}/paradigma`;
            wordListHTML += `<tr><td>${word['Türkçe Anlamı']}</td><td>${romanianWord} <a href="${dexonlineLink}" target="_blank" class="dexonline-link">🔗</a></td><td>${word['Örnek Cümle']}</td></tr>`;
        });
    }
    wordListHTML += '</table>';
    wordListElement.innerHTML = wordListHTML;
}

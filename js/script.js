// js/script.js

// --- BIBELBUCHREIHENFOLGE (gemäß Neuer-Welt-Übersetzung) ---
const bibleBookOrderNWT = [
    "1. Mose", "2. Mose", "3. Mose", "4. Mose", "5. Mose", "Josua", "Richter", "Ruth",
    "1. Samuel", "2. Samuel", "1. Könige", "2. Könige", "1. Chronika", "2. Chronika",
    "Esra", "Nehemia", "Esther", "Hiob", "Psalm", "Sprüche", "Prediger", "Hoheslied",
    "Jesaja", "Jeremia", "Klagelieder", "Hesekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadja", "Jona", "Micha", "Nahum", "Habakuk", "Zephanja", "Haggai", "Sacharja", "Maleachi",
    "Matthäus", "Markus", "Lukas", "Johannes", "Apostelgeschichte", "Römer",
    "1. Korinther", "2. Korinther", "Galater", "Epheser", "Philipper", "Kolosser",
    "1. Thessalonicher", "2. Thessalonicher", "1. Timotheus", "2. Timotheus", "Titus", "Philemon",
    "Hebräer", "Jakobus", "1. Petrus", "2. Petrus", "1. Johannes", "2. Johannes", "3. Johannes",
    "Judas", "Offenbarung"
];

// --- DOM-Elemente ---
const appContainer = document.getElementById('app-container');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');

const languageSelect = document.getElementById('language-select');
const bookCheckboxesContainer = document.getElementById('book-checkboxes-container');
const selectAllBooksBtn = document.getElementById('select-all-books-btn');
const deselectAllBooksBtn = document.getElementById('deselect-all-books-btn');
const difficultySelect = document.getElementById('difficulty-select');
const startQuizBtn = document.getElementById('start-quiz-btn');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

const questionText = document.getElementById('question-text');
const answerButtonsContainer = document.getElementById('answer-buttons');
const answerButtons = Array.from(answerButtonsContainer.getElementsByClassName('answer-btn'));
const feedbackSection = document.getElementById('feedback-section');
const explanationText = document.getElementById('explanation-text');
const verseReference = document.getElementById('verse-reference');
const verseContentDirect = document.getElementById('verse-content-direct');

const nextQuestionBtn = document.getElementById('next-question-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');

// DOM-Elemente für Info-Panel
const infoSelectedLanguage = document.getElementById('info-selected-language');
const infoSelectedBooks = document.getElementById('info-selected-books');
const infoSelectedDifficulty = document.getElementById('info-selected-difficulty');
const infoCurrentBook = document.getElementById('info-current-book');
const infoCurrentDifficulty = document.getElementById('info-current-difficulty');
const infoQuestionCounter = document.getElementById('info-question-counter');
const infoScoreCounter = document.getElementById('info-score-counter');
const infoAccuracyQuote = document.getElementById('info-accuracy-quote');

const currentQBook = document.getElementById('current-q-book');
const currentQDifficulty = document.getElementById('current-q-difficulty');
const currentQuestionMeta = document.getElementById('current-question-meta');

// Globale Variablen
let allQuestions = [];
let currentQuestionIndex = 0;
let filteredQuestions = [];
let correctAnswers = 0;

// --- Laden und Initialisierung ---
async function loadQuestions() {
    showLoading(true);
    showError(null);
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}.`);
        }
        allQuestions = await response.json();
        if (allQuestions && allQuestions.length > 0) {
            initializeApp();
        } else {
            throw new Error("Fragen-Datei ist leer oder nicht im korrekten Format.");
        }
    } catch (error) {
        console.error("Fehler beim Laden der Fragen:", error);
        showError(`Konnte Fragen nicht laden: ${error.message}.`);
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading) { loadingMessage.classList.toggle('hidden', !isLoading); }
function showError(message) { errorMessage.textContent = message || ''; errorMessage.classList.toggle('hidden', !message); }

function initializeApp() {
    populateBookCheckboxes();
    selectAllBooksBtn.disabled = false;
    deselectAllBooksBtn.disabled = false;
    difficultySelect.disabled = false;
    startQuizBtn.disabled = false;
    updateSelectionInfoPanel();
    updateAccuracyQuote(0, 0);
}

function populateBookCheckboxes() {
    bookCheckboxesContainer.innerHTML = ''; // Leeren
    const uniqueBooksFromQuestions = [...new Set(allQuestions.map(q => q.book))];
    let sortedBooksToShow = [];

    bibleBookOrderNWT.forEach(bookInOrder => {
        if (uniqueBooksFromQuestions.includes(bookInOrder)) {
            sortedBooksToShow.push(bookInOrder);
        }
    });
    uniqueBooksFromQuestions.forEach(bookInQuestions => {
        if (!sortedBooksToShow.includes(bookInQuestions)) {
            sortedBooksToShow.push(bookInQuestions);
        }
    });

    if (sortedBooksToShow.length === 0) {
        bookCheckboxesContainer.innerHTML = '<p>Keine Bücher in den Fragen gefunden.</p>';
        selectAllBooksBtn.disabled = true;
        deselectAllBooksBtn.disabled = true;
        return;
    }

    sortedBooksToShow.forEach(bookName => {
        const boxDiv = document.createElement('div');
        boxDiv.classList.add('checkbox-item-box'); // Klasse für die Box

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const safeIdName = `book-${bookName.replace(/[.\s]+/g, '-').toLowerCase()}`;
        checkbox.id = safeIdName;
        checkbox.value = bookName;
        checkbox.name = 'selectedBook';
        checkbox.checked = true;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = bookName;
        
        boxDiv.appendChild(checkbox);
        boxDiv.appendChild(label);

        // Event Listener für die Box, um Checkbox zu togglen
        boxDiv.addEventListener('click', (event) => {
            if (event.target !== checkbox) { // Verhindere doppeltes Auslösen, wenn direkt auf Checkbox geklickt wird
                checkbox.checked = !checkbox.checked;
                // Manuelles Auslösen des 'change'-Events auf der Checkbox, damit der Container-Listener reagiert
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            }
        });
        bookCheckboxesContainer.appendChild(boxDiv);
    });
}

function toggleAllBookCheckboxes(select) {
    const checkboxes = bookCheckboxesContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = select;
    });
    updateSelectionInfoPanel();
}

function getSelectedBooks() {
    const selectedBooks = [];
    const checkboxes = bookCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        selectedBooks.push(checkbox.value);
    });
    return selectedBooks;
}

function updateSelectionInfoPanel() {
    const langValue = languageSelect.value;
    const selectedBooksArray = getSelectedBooks();
    const difficultyValue = difficultySelect.value;

    if (langValue) {
        const selectedLangOption = Array.from(languageSelect.options).find(opt => opt.value === langValue);
        infoSelectedLanguage.textContent = selectedLangOption ? selectedLangOption.text : "Fehler";
    } else { infoSelectedLanguage.textContent = "Keine Sprache"; }

    if (selectedBooksArray && selectedBooksArray.length > 0) {
        const totalSelectableBooksInQuestions = new Set(allQuestions.map(q => q.book)).size;
        if (selectedBooksArray.length === totalSelectableBooksInQuestions) {
            infoSelectedBooks.textContent = "Alle verfügbaren Bücher";
        } else if (selectedBooksArray.length > 2) {
            infoSelectedBooks.textContent = `${selectedBooksArray.slice(0, 2).join(', ')} und ${selectedBooksArray.length - 2} weitere`;
        } else {
            infoSelectedBooks.textContent = selectedBooksArray.join(', ');
        }
    } else {
        infoSelectedBooks.textContent = "Keine Bücher ausgewählt";
    }

    if (difficultyValue) {
        const selectedDifficultyOption = Array.from(difficultySelect.options).find(opt => opt.value === difficultyValue);
        infoSelectedDifficulty.textContent = selectedDifficultyOption ? selectedDifficultyOption.text : "Fehler";
    } else { infoSelectedDifficulty.textContent = "Alle Schwierigkeiten"; }
}

function updateQuestionAndScoreInfoPanel(question, currentIndex, totalQuestions, score) {
    if (question) {
        infoCurrentBook.textContent = question.book;
        infoCurrentDifficulty.textContent = question.difficulty;
        currentQBook.textContent = question.book;
        currentQDifficulty.textContent = question.difficulty;
        currentQuestionMeta.classList.remove('hidden');
    } else {
        infoCurrentBook.textContent = "-"; infoCurrentDifficulty.textContent = "-";
        currentQuestionMeta.classList.add('hidden');
    }
    infoQuestionCounter.textContent = `${currentIndex + 1} / ${totalQuestions}`;
    infoScoreCounter.textContent = score;
    // Die Quote wird nun in selectAnswer() aktualisiert
}

function updateAccuracyQuote(correct, answered) {
    if (answered > 0) {
        const percentage = Math.round((correct / answered) * 100);
        infoAccuracyQuote.textContent = `${percentage} %`;
    } else {
        infoAccuracyQuote.textContent = `0 %`;
    }
}

function startQuiz() {
    updateSelectionInfoPanel();

    const selectedLanguageValue = languageSelect.value;
    const selectedBooksValues = getSelectedBooks();
    const selectedDifficultyValue = difficultySelect.value;

    if (selectedBooksValues.length === 0) {
        showError("Bitte wähle mindestens ein Bibelbuch aus.");
        infoCurrentBook.textContent = "-"; infoCurrentDifficulty.textContent = "-";
        currentQuestionMeta.classList.add('hidden');
        infoQuestionCounter.textContent = "0 / 0"; infoScoreCounter.textContent = "0";
        updateAccuracyQuote(0, 0);
        return;
    }
    showError(null);

    let tempFilteredQuestions = allQuestions;
    if (selectedLanguageValue) {
        tempFilteredQuestions = tempFilteredQuestions.filter(q => q.language === selectedLanguageValue);
    }
    if (selectedBooksValues.length > 0) {
        tempFilteredQuestions = tempFilteredQuestions.filter(q => selectedBooksValues.includes(q.book));
    }
    if (selectedDifficultyValue) {
        tempFilteredQuestions = tempFilteredQuestions.filter(q => q.difficulty === selectedDifficultyValue);
    }
    filteredQuestions = tempFilteredQuestions;

    if (filteredQuestions.length === 0) {
        showError("Keine Fragen für diese Auswahl gefunden...");
        infoCurrentBook.textContent = "-"; infoCurrentDifficulty.textContent = "-";
        currentQuestionMeta.classList.add('hidden');
        infoQuestionCounter.textContent = "0 / 0"; infoScoreCounter.textContent = "0";
        updateAccuracyQuote(0, 0);
        return;
    }
    
    filteredQuestions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    updateAccuracyQuote(0,0);

    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    nextQuestionBtn.classList.add('hidden');
    backToStartBtn.classList.remove('hidden');
    feedbackSection.classList.add('hidden');
    
    displayQuestion();
}

function displayQuestion() {
    resetState();
    if (currentQuestionIndex < filteredQuestions.length) {
        const question = filteredQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        updateQuestionAndScoreInfoPanel(question, currentQuestionIndex, filteredQuestions.length, correctAnswers); // Quote wird hier noch nicht aktualisiert
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        answerButtons.forEach((button, index) => {
            if (shuffledOptions[index]) {
                button.textContent = shuffledOptions[index].text;
                button.dataset.isCorrect = shuffledOptions[index].isCorrect;
                button.disabled = false; button.classList.remove('hidden');
            } else { button.classList.add('hidden'); }
        });
    } else {
        const finalQuote = filteredQuestions.length > 0 ? Math.round((correctAnswers / filteredQuestions.length) * 100) : 0;
        questionText.textContent = `Quiz beendet! Deine Quote: ${finalQuote}% (${correctAnswers} von ${filteredQuestions.length} richtig).`;
        answerButtonsContainer.classList.add('hidden');
        feedbackSection.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        currentQuestionMeta.classList.add('hidden');
    }
}

function resetState() {
    answerButtons.forEach(button => {
        button.classList.remove('correct', 'wrong'); button.disabled = false;
    });
    feedbackSection.classList.add('hidden');
    nextQuestionBtn.classList.add('hidden');
    answerButtonsContainer.classList.remove('hidden');
    verseReference.textContent = "-";
    verseContentDirect.textContent = "";
    currentQuestionMeta.classList.add('hidden');
}

function selectAnswer(e) {
    const selectedButton = e.target;
    if (!selectedButton.classList.contains('answer-btn') || selectedButton.disabled) return;

    const isCorrect = selectedButton.dataset.isCorrect === 'true';
    if (isCorrect) correctAnswers++;
    
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    updateQuestionAndScoreInfoPanel(currentQuestion, currentQuestionIndex, filteredQuestions.length, correctAnswers);
    updateAccuracyQuote(correctAnswers, currentQuestionIndex + 1); // Quote HIER aktualisieren

    answerButtons.forEach(button => {
        button.disabled = true;
        if (button.dataset.isCorrect === 'true') button.classList.add('correct');
    });
    if (isCorrect) selectedButton.classList.add('correct');
    else selectedButton.classList.add('wrong');

    explanationText.textContent = "Erklärung: " + currentQuestion.explanation;
    verseReference.textContent = currentQuestion.verse;
    verseContentDirect.textContent = currentQuestion.verseTextContent || "Kein Bibeltext verfügbar.";
    feedbackSection.classList.remove('hidden');

    if (currentQuestionIndex < filteredQuestions.length - 1) {
        nextQuestionBtn.classList.remove('hidden');
    } else {
        nextQuestionBtn.classList.add('hidden');
    }
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
        displayQuestion();
    }
}

function goBackToStart() {
    quizScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    showError(null);

    languageSelect.value = "de";
    toggleAllBookCheckboxes(true);
    difficultySelect.value = "";   
    
    updateSelectionInfoPanel(); 
    
    infoCurrentBook.textContent = "-"; 
    infoCurrentDifficulty.textContent = "-";
    infoQuestionCounter.textContent = "- / -"; 
    infoScoreCounter.textContent = "0";
    updateAccuracyQuote(0, 0);
    currentQuestionMeta.classList.add('hidden');
}

// --- Event Listeners ---
startQuizBtn.addEventListener('click', startQuiz);
nextQuestionBtn.addEventListener('click', handleNextButton);
backToStartBtn.addEventListener('click', goBackToStart);
answerButtonsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('answer-btn') && !event.target.disabled) {
        selectAnswer(event);
    }
});

selectAllBooksBtn.addEventListener('click', () => toggleAllBookCheckboxes(true));
deselectAllBooksBtn.addEventListener('click', () => toggleAllBookCheckboxes(false));

bookCheckboxesContainer.addEventListener('change', updateSelectionInfoPanel); // Event Listener auf den Container
difficultySelect.addEventListener('change', updateSelectionInfoPanel);
languageSelect.addEventListener('change', () => {
    updateSelectionInfoPanel();
});

// --- Start ---
loadQuestions();

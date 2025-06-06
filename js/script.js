// js/script.js

// --- BIBELBUCHREIHENFOLGE (bleibt gleich) ---
const bibleBookOrderNWT = [ /* ... */
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
const OLD_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(0, 39);
const NEW_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(39);

// --- DOM-Elemente (bleiben gleich) ---
// ... (alle DOM-Elemente wie in der vorherigen vollständigen JS-Datei) ...
const appContainer = document.getElementById('app-container');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');

const languageSelect = document.getElementById('language-select');
const openBookSelectModalBtn = document.getElementById('open-book-select-modal-btn');
const difficultySelect = document.getElementById('difficulty-select');
const startQuizBtn = document.getElementById('start-quiz-btn');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

// Modal DOM-Elemente
const bookSelectModal = document.getElementById('book-select-modal');
const closeModalBtn = bookSelectModal.querySelector('.close-modal-btn');
const modalBookButtonsContainer = document.getElementById('modal-book-buttons-container');
const selectAllOtBtn = document.getElementById('select-all-ot-btn');
const selectAllNtBtn = document.getElementById('select-all-nt-btn');
const selectAllAvailableBtn = document.getElementById('select-all-available-btn');
const deselectAllModalBtn = document.getElementById('deselect-all-modal-btn');
const confirmBookSelectionBtn = document.getElementById('confirm-book-selection-btn');


const questionText = document.getElementById('question-text');
const answerButtonsContainer = document.getElementById('answer-buttons');
const answerButtons = Array.from(answerButtonsContainer.getElementsByClassName('answer-btn'));
const feedbackSection = document.getElementById('feedback-section');
const explanationText = document.getElementById('explanation-text');
const verseReference = document.getElementById('verse-reference');
const verseContentDirect = document.getElementById('verse-content-direct');

const nextQuestionBtn = document.getElementById('next-question-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');

// Info-Panel DOM-Elemente
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

// Globale Variablen (bleiben gleich)
let allQuestions = [];
let currentQuestionIndex = 0;
let filteredQuestions = [];
let correctAnswers = 0;
let globallySelectedBooks = [];
let tempSelectedBooksInModal = [];

// --- Laden und Initialisierung (bleibt gleich) ---
async function loadQuestions() { /* ... (wie vorher) ... */
    showLoading(true);
    showError(null);
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allQuestions = await response.json();
        if (!allQuestions || allQuestions.length === 0) throw new Error("Fragen-Datei ist leer oder fehlerhaft.");
        
        const availableBooks = [...new Set(allQuestions.map(q => q.book))];
        globallySelectedBooks = [...availableBooks];
        
        initializeApp();
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
    openBookSelectModalBtn.disabled = false;
    difficultySelect.disabled = false;
    startQuizBtn.disabled = false;
    updateSelectionInfoPanel();
    updateAccuracyQuote(0, 0);
}


// --- Modal-Funktionen ---
function openBookSelectModal() { /* ... (wie vorher) ... */
    tempSelectedBooksInModal = [...globallySelectedBooks];
    populateModalBookButtons();
    updateTestamentButtonStates(); // NEU
    bookSelectModal.classList.remove('hidden');
    bookSelectModal.classList.add('modal-open');
}
function closeBookSelectModal() { /* ... (wie vorher) ... */
    bookSelectModal.classList.add('hidden');
    bookSelectModal.classList.remove('modal-open');
}

// ANGEPASST: populateModalBookButtons mit Trennlinien und Titeln
function populateModalBookButtons() {
    modalBookButtonsContainer.innerHTML = ''; // Leeren
    const uniqueBooksFromQuestions = [...new Set(allQuestions.map(q => q.book))];
    
    const createButton = (bookName) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('book-select-btn');
        button.textContent = bookName;
        button.dataset.bookname = bookName;
        if (tempSelectedBooksInModal.includes(bookName)) {
            button.classList.add('selected');
        }
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            if (button.classList.contains('selected')) {
                if (!tempSelectedBooksInModal.includes(bookName)) {
                    tempSelectedBooksInModal.push(bookName);
                }
            } else {
                tempSelectedBooksInModal = tempSelectedBooksInModal.filter(b => b !== bookName);
            }
            updateTestamentButtonStates(); // Status der AT/NT Buttons aktualisieren
        });
        modalBookButtonsContainer.appendChild(button);
    };

    const createSeparator = () => {
        const separator = document.createElement('div');
        separator.classList.add('book-group-separator');
        modalBookButtonsContainer.appendChild(separator);
    };

    const createTitle = (titleText) => {
        const title = document.createElement('div');
        title.classList.add('book-group-title');
        title.textContent = titleText;
        modalBookButtonsContainer.appendChild(title);
    };

    // "Allgemein" zuerst, falls vorhanden
    if (uniqueBooksFromQuestions.includes("Allgemein")) {
        createTitle("Allgemeine Fragen");
        createButton("Allgemein");
        createSeparator();
    }

    // Altes Testament
    createTitle("Hebräische Schriften (Altes Testament)");
    OLD_TESTAMENT_NWT_BOOKS.forEach(bookName => {
        if (uniqueBooksFromQuestions.includes(bookName)) {
            createButton(bookName);
        }
    });
    createSeparator();

    // Neues Testament
    createTitle("Christliche Griechische Schriften (Neues Testament)");
    NEW_TESTAMENT_NWT_BOOKS.forEach(bookName => {
        if (uniqueBooksFromQuestions.includes(bookName)) {
            createButton(bookName);
        }
    });

    // Übrige Bücher (falls welche in questions.json aber nicht in NWT-Listen sind)
    let remainingBooks = uniqueBooksFromQuestions.filter(
        b => b !== "Allgemein" && !OLD_TESTAMENT_NWT_BOOKS.includes(b) && !NEW_TESTAMENT_NWT_BOOKS.includes(b)
    );
    if (remainingBooks.length > 0) {
        createSeparator();
        createTitle("Weitere Bücher");
        remainingBooks.forEach(bookName => createButton(bookName));
    }

    if (modalBookButtonsContainer.children.length === 0 || 
        (modalBookButtonsContainer.children.length === 2 && uniqueBooksFromQuestions.includes("Allgemein")) ) { // Nur Titel+Separator für Allgemein
        modalBookButtonsContainer.innerHTML = '<p>Keine spezifischen Bibelbücher in den Fragen gefunden.</p>';
    }
}


function handleConfirmBookSelection() { /* ... (wie vorher) ... */
    globallySelectedBooks = [...tempSelectedBooksInModal];
    updateSelectionInfoPanel();
    closeBookSelectModal();
}

// ANGEPASST: selectBooksByTestament als Umschalter (Toggle)
function toggleBooksByTestament(testamentType) {
    const booksInTestament = testamentType === 'OT' ? OLD_TESTAMENT_NWT_BOOKS : NEW_TESTAMENT_NWT_BOOKS;
    const availableBooksInQuestions = [...new Set(allQuestions.map(q => q.book))];
    const relevantBooks = booksInTestament.filter(b => availableBooksInQuestions.includes(b));

    // Prüfen, ob alle relevanten Bücher dieses Testaments bereits ausgewählt sind
    const allSelected = relevantBooks.every(b => tempSelectedBooksInModal.includes(b));

    if (allSelected) { // Wenn alle ausgewählt sind, alle abwählen
        tempSelectedBooksInModal = tempSelectedBooksInModal.filter(b => !relevantBooks.includes(b));
    } else { // Sonst alle (noch nicht ausgewählten) hinzufügen
        relevantBooks.forEach(b => {
            if (!tempSelectedBooksInModal.includes(b)) {
                tempSelectedBooksInModal.push(b);
            }
        });
    }
    populateModalBookButtons();
    updateTestamentButtonStates();
}

// NEU: Status der AT/NT Buttons aktualisieren
function updateTestamentButtonStates() {
    const availableBooksInQuestions = [...new Set(allQuestions.map(q => q.book))];
    
    const relevantOTBooks = OLD_TESTAMENT_NWT_BOOKS.filter(b => availableBooksInQuestions.includes(b));
    const allOTSelected = relevantOTBooks.length > 0 && relevantOTBooks.every(b => tempSelectedBooksInModal.includes(b));
    selectAllOtBtn.classList.toggle('active-selection', allOTSelected);

    const relevantNTBooks = NEW_TESTAMENT_NWT_BOOKS.filter(b => availableBooksInQuestions.includes(b));
    const allNTSelected = relevantNTBooks.length > 0 && relevantNTBooks.every(b => tempSelectedBooksInModal.includes(b));
    selectAllNtBtn.classList.toggle('active-selection', allNTSelected);
}


function selectAllAvailableBooksInModal() { /* ... (wie vorher, ruft populate und updateTestamentButtonStates) ... */
    const availableBooks = [...new Set(allQuestions.map(q => q.book))];
    tempSelectedBooksInModal = [...availableBooks];
    populateModalBookButtons();
    updateTestamentButtonStates();
}

function deselectAllBooksInModal() { /* ... (wie vorher, ruft populate und updateTestamentButtonStates) ... */
    tempSelectedBooksInModal = [];
    populateModalBookButtons();
    updateTestamentButtonStates();
}

// --- Hilfsfunktion getSelectedBooks (bleibt gleich) ---
function getSelectedBooks() { return globallySelectedBooks; }

// --- Update Info-Panel Funktionen (bleiben gleich) ---
function updateSelectionInfoPanel() { /* ... (wie vorher) ... */
    const langValue = languageSelect.value;
    const selectedBooksArray = getSelectedBooks();
    const difficultyValue = difficultySelect.value;

    if (langValue) {
        const selectedLangOption = Array.from(languageSelect.options).find(opt => opt.value === langValue);
        infoSelectedLanguage.textContent = selectedLangOption ? selectedLangOption.text : "Fehler";
    } else { infoSelectedLanguage.textContent = "Keine Sprache"; }

    const totalAvailableBooksInQuestions = new Set(allQuestions.map(q => q.book)).size;
    if (selectedBooksArray && selectedBooksArray.length > 0) {
        if (selectedBooksArray.length === totalAvailableBooksInQuestions && totalAvailableBooksInQuestions > 0) {
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
function updateQuestionAndScoreInfoPanel(question, currentIndex, totalQuestions, score) { /* ... (wie vorher) ... */
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
}
function updateAccuracyQuote(correct, answered) { /* ... (wie vorher) ... */
    if (answered > 0) {
        const percentage = Math.round((correct / answered) * 100);
        infoAccuracyQuote.textContent = `${percentage} %`;
    } else {
        infoAccuracyQuote.textContent = `0 %`;
    }
}

// --- Quiz Logik (bleibt im Kern gleich) ---
function startQuiz() { /* ... (wie vorher) ... */
    updateSelectionInfoPanel();

    const selectedLanguageValue = languageSelect.value;
    const selectedBooksValues = getSelectedBooks();
    const selectedDifficultyValue = difficultySelect.value;

    if (selectedBooksValues.length === 0) {
        showError("Bitte wähle mindestens ein Bibelbuch aus (über 'Bücher wählen...').");
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
function displayQuestion() { /* ... (wie vorher) ... */
    resetState();
    if (currentQuestionIndex < filteredQuestions.length) {
        const question = filteredQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        updateQuestionAndScoreInfoPanel(question, currentQuestionIndex, filteredQuestions.length, correctAnswers);
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
function resetState() { /* ... (wie vorher) ... */
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
function selectAnswer(e) { /* ... (wie vorher, ruft updateAccuracyQuote) ... */
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
function handleNextButton() { /* ... (wie vorher) ... */
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
        displayQuestion();
    }
}
function goBackToStart() { /* ... (wie vorher) ... */
    quizScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    showError(null);

    languageSelect.value = "de";
    const availableBooks = [...new Set(allQuestions.map(q => q.book))];
    globallySelectedBooks = [...availableBooks]; // Alle verfügbaren Bücher wieder auswählen
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

// Modal Event Listeners
openBookSelectModalBtn.addEventListener('click', openBookSelectModal);
closeModalBtn.addEventListener('click', closeBookSelectModal);
confirmBookSelectionBtn.addEventListener('click', handleConfirmBookSelection);
bookSelectModal.addEventListener('click', (event) => {
    if (event.target === bookSelectModal) {
        closeBookSelectModal();
    }
});
selectAllOtBtn.addEventListener('click', () => toggleBooksByTestament('OT'));
selectAllNtBtn.addEventListener('click', () => toggleBooksByTestament('NT'));
selectAllAvailableBtn.addEventListener('click', selectAllAvailableBooksInModal);
deselectAllModalBtn.addEventListener('click', deselectAllBooksInModal);

// Live update für Schwierigkeit und Sprache im Info-Panel
difficultySelect.addEventListener('change', updateSelectionInfoPanel);
languageSelect.addEventListener('change', updateSelectionInfoPanel);

// --- Start ---
loadQuestions();
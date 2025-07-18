// js/script.js

const STATS_STORAGE_KEY = 'bibleQuizDetailedStats_v3'; // Version erhöht für Strukturänderungen
let currentTexts = {};
let bibleBookOrderNWT = [];
let OLD_TESTAMENT_NWT_BOOKS = [];
let NEW_TESTAMENT_NWT_BOOKS = [];
let currentLanguage = 'de';
// --- Sprachsteuerung ---
const DEFAULT_LANGUAGE = 'de';
const supportedLanguages = ['de', 'eng', 'ron'];



function getInitialLanguage() {
    const savedLang = localStorage.getItem('quizLang');
    if (savedLang && supportedLanguages.includes(savedLang)) return savedLang;

    const browserLang = navigator.language.slice(0, 2);
    if (supportedLanguages.includes(browserLang)) return browserLang;

    return DEFAULT_LANGUAGE;
}

async function loadLanguage(lang) {
    const response = await fetch(`lang/lang_${lang}.json`);
    const texts = await response.json();
	currentTexts = texts;
	
	 // Bible book order aus der JSON übernehmen:
    if (texts.bibleBookOrder && Array.isArray(texts.bibleBookOrder)) {
        bibleBookOrderNWT = texts.bibleBookOrder;
    } else {
        // Fallback, falls die Reihenfolge nicht vorhanden ist
        bibleBookOrderNWT = [];
    }
	OLD_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(0, 39);
	NEW_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(39, bibleBookOrderNWT.indexOf(texts.book_common));
    applyTexts(texts);
    localStorage.setItem('quizLang', lang);
    languageSelect.value = lang;
	currentLanguage = lang;
}

function applyTexts(texts) {
    const textMap = {
        'app-title': 'app_title',
        'language-select-label': 'select_language',
        'start-quiz-btn': 'start_quiz',
		'book-select-label': 'book_select_label',
        'open-book-select-modal-btn': 'book_select_button',
		'difficulty-select-label': 'difficulty',
        'difficulty-select': {
			'':'difficulty_default',
            'einfach': 'difficulty_easy',
            'mittel': 'difficulty_medium',
            'schwer': 'difficulty_hard'
        },
        'show-stats-page-btn': 'stats_button',
        'back-to-start-btn': 'back_to_menu',
        'next-question-btn': 'next_question',

        // Neue IDs für info-panel (falls sie als Text-Knoten ersetzt werden sollen)
        'info-panel-title': 'info_title',
        'info-selected-language-label': 'info_selected_language',
        'info-selected-books-label': 'info_selected_books',
        'info-selected-difficulty-label': 'info_selected_difficulty',
        'info-current-question-title': 'info_current_question_title',
        'info-current-book-label': 'info_current_book',
        'info-current-difficulty-label': 'info_current_difficulty',
        'info-progress-title': 'info_progress_title',
        'info-question-label': 'info_question',
        'info-score-label': 'info_score',
        'info-accuracy-label': 'info_accuracy_quote',
		 'verse-label-text': 'verse_label',
		 
		 'select-all-available-btn':'select_all_books',
		 'deselect-all-modal-btn':'delect_all_books',
		 'select-all-nt-btn':'new_testamony',
		 'select-all-ot-btn':'old_testamony',
		 
		 'confirm-book-selection-btn':'confirm_selection',
		 
		 
		"installation-info-title": "installation_info_title",
        "installation-info-p1": "installation_info_p1",
        "installation-info-android-label": "installation_info_android_label",
        "installation-info-android-text": "installation_info_android_text",
        "installation-info-ios-label": "installation_info_ios_label",
        "installation-info-ios-text": "installation_info_ios_text",
        "installation-info-note": "installation_info_note",
		
		//"share-btn":"share_app",
		
		 // 🔽 Neue Einträge für Statistikseite:
		'stats-back-btn-text': 'stats_back_btn_text',
		'stats-title': 'stats_title',
		'stats-overview-title': 'stats_overview_title',
		'stats-total-answered-label': 'stats_total_answered_label',
		'stats-total-correct-label': 'stats_total_correct_label',
		'stats-total-accuracy-label': 'stats_total_accuracy_label',
		'stats-per-book-title': 'stats_per_book_title',
		'stats-no-book-stats': 'stats_no_book_stats',
		'stats-reset-btn-text': 'stats_reset_btn_text',
		
		'info-score-label':'info_score_label',
		'info-question-label':'info_question_label',
		
		  'info-title': 'info_title',

		  'info-general-title': 'info_general_title',
		  'info-general-text': 'info_general_text',

		  'info-technical-title': 'info_technical_title',
		  'info-technical-text': 'info_technical_text',

		  'info-usage-title': 'info_usage_title',
		  'info-usage-text': 'info_usage_text',

		  'info-disclaimer-title': 'info_disclaimer_title',
		  'info-disclaimer-text': 'info_disclaimer_text',

		  'info-greeting-title': 'info_greeting_title',
		  'info-greeting-text': 'info_greeting_text'
		
		
    };

    // Zunächst übersetzen wie gehabt
    for (const [id, key] of Object.entries(textMap)) {
        const el = document.getElementById(id);
        if (!el) continue;

        if (typeof key === 'string') {
            el.textContent = texts[key] || el.textContent;
        } else {
            // Für Select-Optionen wie difficulty-select
            [...el.options].forEach(opt => {
                const val = opt.value;
                if (key[val] && texts[key[val]]) {
                    opt.textContent = texts[key[val]];
                }
            });
        }
    }
}

// Listener für Sprachauswahl
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getInitialLanguage();
    loadLanguage(initialLang);

    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        if (supportedLanguages.includes(lang)) {
            loadLanguage(lang);
        }
    });
});



 /*
// --- BIBELBUCHREIHENFOLGE (gemäß Neuer-Welt-Übersetzung) ---
//const bibleBookOrderNWT = [
////    "1. Mose", "2. Mose", "3. Mose", "4. Mose", "5. Mose", "Josua", "Richter", "Ruth",
  ////  "1. Samuel", "2. Samuel", "1. Könige", "2. Könige", "1. Chronika", "2. Chronika",
    "Esra", "Nehemia", "Esther", "Hiob", "Psalm", "Sprüche", "Prediger", "Hoheslied",
//    "Jesaja", "Jeremia", "Klagelieder", "Hesekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadja", "Jona", "Micha", "Nahum", "Habakuk", "Zephanja", "Haggai", "Sacharja", "Maleachi",
    "Matthäus", "Markus", "Lukas", "Johannes", "Apostelgeschichte", "Römer",
    "1. Korinther", "2. Korinther", "Galater", "Epheser", "Philipper", "Kolosser",
    "1. Thessalonicher", "2. Thessalonicher", "1. Timotheus", "2. Timotheus", "Titus", "Philemon",
    "Hebräer", "Jakobus", "1. Petrus", "2. Petrus", "1. Johannes", "2. Johannes", "3. Johannes",
    "Judas", "Offenbarung", "Allgemein" // "Allgemein" für Sortierung und spezielle Behandlung
]; */


//const OLD_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(0, 39);
//const NEW_TESTAMENT_NWT_BOOKS = bibleBookOrderNWT.slice(39, bibleBookOrderNWT.indexOf("Allgemein"));


// --- DOM-Elemente ---
const appContainer = document.getElementById('app-container');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const infoPanel = document.getElementById('info-panel'); // Info-Panel erfasst

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

// Quiz Screen DOM-Elemente
const questionText = document.getElementById('question-text');
const answerButtonsContainer = document.getElementById('answer-buttons');
const answerButtons = Array.from(answerButtonsContainer.getElementsByClassName('answer-btn'));
const feedbackSection = document.getElementById('feedback-section');
const explanationText = document.getElementById('explanation-text');
const verseReference = document.getElementById('verse-reference');
const verseContentDirect = document.getElementById('verse-content-direct');
const nextQuestionBtn = document.getElementById('next-question-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');

// Info-Panel (Rundenstatistik) DOM-Elemente
const infoSelectedLanguage = document.getElementById('info-selected-language');
const infoSelectedBooks = document.getElementById('info-selected-books');
const infoSelectedDifficulty = document.getElementById('info-selected-difficulty');
const infoCurrentBook = document.getElementById('info-current-book');
const infoCurrentDifficulty = document.getElementById('info-current-difficulty');
const infoQuestionCounter = document.getElementById('info-question-counter');
const infoScoreCounter = document.getElementById('info-score-counter');
const infoAccuracyQuote = document.getElementById('info-accuracy-quote');

// Meta-Info über Frage
const currentQBook = document.getElementById('current-q-book');
const currentQDifficulty = document.getElementById('current-q-difficulty');
const currentQuestionMeta = document.getElementById('current-question-meta');

// Statistikseite DOM-Elemente
const showStatsPageBtn = document.getElementById('show-stats-page-btn');
const statsPage = document.getElementById('stats-page');
const backToStartFromStatsBtn = document.getElementById('back-to-start-from-stats-btn');
const statsPageTotalAnswered = document.getElementById('stats-page-total-answered');
const statsPageTotalCorrect = document.getElementById('stats-page-total-correct');
const statsPageTotalAccuracy = document.getElementById('stats-page-total-accuracy');
const statsByBookContainer = document.getElementById('stats-by-book-container');
const resetAllStatsBtn = document.getElementById('reset-all-stats-btn');


// Globale Variablen
let allQuestions = [];
let currentQestions = [];
let currentQuestionIndex = 0;
let filteredQuestions = [];
let correctAnswers = 0; // Für die aktuelle Runde
let globallySelectedBooks = [];
let tempSelectedBooksInModal = [];
let overallStats = {
    totalAnswered: 0,
    totalCorrect: 0,
    books: {}
};

// --- Laden und Initialisierung ---
async function loadQuestions() {
    showLoading(true);
    showError(null);
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allQuestions = await response.json();
        if (!allQuestions || allQuestions.length === 0) throw new Error("Fragen-Datei ist leer oder fehlerhaft.");
        
        loadOverallStats();
        const availableBooks = [...new Set(allQuestions.map(q => q.book))];
        globallySelectedBooks = [...availableBooks]; // Alle verfügbaren initial auswählen
        
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
    showStatsPageBtn.disabled = !(overallStats.totalAnswered > 0);
    updateSelectionInfoPanel();
    updateAccuracyQuote(0, 0); // Rundenstatistik
}

// --- Statistik-Funktionen ---
function loadOverallStats() {
    const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        // Stellt sicher, dass die Struktur aktuell ist, besonders 'books'
        overallStats.totalAnswered = parsedStats.totalAnswered || 0;
        overallStats.totalCorrect = parsedStats.totalCorrect || 0;
        overallStats.books = parsedStats.books || {};
    }
    showStatsPageBtn.disabled = !(overallStats.totalAnswered > 0);
}

function saveOverallStats() {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(overallStats));
    showStatsPageBtn.disabled = !(overallStats.totalAnswered > 0);
}

function populateStatsPage() {
    statsPageTotalAnswered.textContent = overallStats.totalAnswered;
    statsPageTotalCorrect.textContent = overallStats.totalCorrect;
    const overallAccuracyValue = overallStats.totalAnswered > 0 ? Math.round((overallStats.totalCorrect / overallStats.totalAnswered) * 100) : 0;
    updateAccuracyBar(statsPageTotalAccuracy, overallAccuracyValue);

    statsByBookContainer.innerHTML = '';
    let booksForStatsDisplay = [];
    const booksWithStats = Object.keys(overallStats.books);

    bibleBookOrderNWT.forEach(bookInOrder => {
        if (booksWithStats.includes(bookInOrder) && overallStats.books[bookInOrder].totalAnswered > 0) {
            booksForStatsDisplay.push(bookInOrder);
        }
    });
    booksWithStats.forEach(bookName => {
        if (!booksForStatsDisplay.includes(bookName) && overallStats.books[bookName].totalAnswered > 0) {
            booksForStatsDisplay.push(bookName); // Fügt z.B. "Allgemein" am Ende hinzu, falls es nicht in bibleBookOrderNWT war
        }
    });

   
    if (booksForStatsDisplay.length === 0) {
        statsByBookContainer.innerHTML = '<p>Noch keine Statistiken für einzelne Bücher vorhanden.</p>';
    } else {
        booksForStatsDisplay.forEach(bookName => {
            const bookStat = overallStats.books[bookName];
            if (bookStat && bookStat.totalAnswered > 0) { // Stelle sicher, dass es beantwortete Fragen gibt
                const statItemDiv = document.createElement('div');
                statItemDiv.classList.add('stat-item');

                const nameStrong = document.createElement('strong');
                nameStrong.textContent = bookName + ":";
                statItemDiv.appendChild(nameStrong);

                const detailsSpan = document.createElement('span');
                const accuracyValue = Math.round((bookStat.totalCorrect / bookStat.totalAnswered) * 100);
                
                const accuracyBarSpan = document.createElement('span');
                accuracyBarSpan.classList.add('stat-accuracy-bar');
                updateAccuracyBar(accuracyBarSpan, accuracyValue); 
                
                // GEÄNDERT: Der senkrechte Strich "|" wurde entfernt.
                // Es wird jetzt ein Leerzeichen für einen kleinen Abstand verwendet.
                detailsSpan.appendChild(document.createTextNode(`${bookStat.totalCorrect}/${bookStat.totalAnswered} `)); 
                detailsSpan.appendChild(accuracyBarSpan);
                
                statItemDiv.appendChild(detailsSpan);
                statsByBookContainer.appendChild(statItemDiv);
            }
        });
    }
}

function updateAccuracyBar(barElement, percentage) {
    let barFill = barElement.querySelector('.bar .fill');
    let valueSpan = barElement.querySelector('.value');

    // Stelle sicher, dass die HTML-Struktur für den Balken existiert oder erstelle sie
    if (!barFill || !valueSpan) {
        barElement.innerHTML = ''; // Leere vorherigen Inhalt, falls vorhanden
        const barDiv = document.createElement('span');
        barDiv.classList.add('bar');
        barFill = document.createElement('span');
        barFill.classList.add('fill');
        barDiv.appendChild(barFill);
        
        valueSpan = document.createElement('span');
        valueSpan.classList.add('value');
        
        barElement.appendChild(barDiv);
        barElement.appendChild(valueSpan);
    }

    // Setze die Breite des Füllbalkens und den Prozentwert
    barFill.style.width = `${percentage}%`;
    valueSpan.textContent = `${percentage} %`;

    // Farblogik anpassen:
    // 0-29%: Rot
    // 30-59%: Orange
    // 60-89%: Gelb
    // 90-100%: Grün

    if (percentage < 30) {
        barFill.style.backgroundColor = '#dc3545'; // Rot
        valueSpan.style.color = '#dc3545'; // Optional: Textfarbe anpassen
    } else if (percentage < 60) { // Zwischen 30% und 59%
        barFill.style.backgroundColor = '#fd7e14'; // Orange
        valueSpan.style.color = '#fd7e14';
    } else if (percentage < 85) { // Zwischen 60% und 89%
        barFill.style.backgroundColor = '#ffc107'; // Gelb
        valueSpan.style.color = '#b8860b'; // Dunkleres Gelb für besseren Kontrast des Textes
    } else { // 90% und darüber
        barFill.style.backgroundColor = '#28a745'; // Grün
        valueSpan.style.color = '#28a745';
    }
}

function resetOverallStats() {
    if (confirm("Möchtest du wirklich alle gespeicherten Statistiken unwiderruflich zurücksetzen?")) {
        overallStats = { totalAnswered: 0, totalCorrect: 0, books: {} };
        saveOverallStats();
        populateStatsPage();
    }
}

// --- UI Navigation ---
function showStatsPage() {
    startScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    infoPanel.classList.add('hidden');
    populateStatsPage();
    statsPage.classList.remove('hidden');
}

function hideStatsPage() {
    statsPage.classList.add('hidden');
    startScreen.classList.remove('hidden');
    infoPanel.classList.remove('hidden'); // Zeige Info-Panel wieder, wenn man zum Start zurückkehrt
}

// --- Modal-Funktionen ---
function openBookSelectModal() {
    tempSelectedBooksInModal = [...globallySelectedBooks];
    populateModalBookButtons();
    updateTestamentButtonStates();
    bookSelectModal.classList.remove('hidden');
    bookSelectModal.classList.add('modal-open');
}

function closeBookSelectModal() {
    bookSelectModal.classList.add('hidden');
    bookSelectModal.classList.remove('modal-open');
}

function populateModalBookButtons() {
    modalBookButtonsContainer.innerHTML = '';
	
    //const uniqueBooksFromQuestions = [...new Set(allQuestions.map(q => q.book))];
    const filteredByLanguage = currentLanguage
        ? allQuestions.filter(q => q.language === currentLanguage)
        : allQuestions;

    // Einzigartige Bücher aus den gefilterten Fragen extrahieren
    const uniqueBooksFromQuestions = [...new Set(filteredByLanguage.map(q => q.book))];
	
	
    const createButton = (bookName) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('book-select-btn');
        button.textContent = bookName;
        button.dataset.bookname = bookName;
        if (tempSelectedBooksInModal.includes(bookName)) button.classList.add('selected');
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            if (button.classList.contains('selected')) {
                if (!tempSelectedBooksInModal.includes(bookName)) tempSelectedBooksInModal.push(bookName);
            } else {
                tempSelectedBooksInModal = tempSelectedBooksInModal.filter(b => b !== bookName);
            }
            updateTestamentButtonStates();
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

if (uniqueBooksFromQuestions.includes(currentTexts['book_common'])) {
    createTitle(currentTexts['section_common']);
    createButton(currentTexts['book_common']);

    // Add remaining books to the common section
    let remainingBooks = uniqueBooksFromQuestions.filter(b => 
        b !== currentTexts['book_common'] && 
        !OLD_TESTAMENT_NWT_BOOKS.includes(b) && 
        !NEW_TESTAMENT_NWT_BOOKS.includes(b)
    );
    remainingBooks.forEach(createButton);

    // Separator if OT or NT books follow
    if (
        OLD_TESTAMENT_NWT_BOOKS.some(b => uniqueBooksFromQuestions.includes(b)) || 
        NEW_TESTAMENT_NWT_BOOKS.some(b => uniqueBooksFromQuestions.includes(b))
    ) {
        createSeparator();
    }
}

let otBooksExist = OLD_TESTAMENT_NWT_BOOKS.filter(b => uniqueBooksFromQuestions.includes(b));
if (otBooksExist.length > 0) {
    createTitle(currentTexts["hebrew_text"]);
    otBooksExist.forEach(createButton);

    if (NEW_TESTAMENT_NWT_BOOKS.some(b => uniqueBooksFromQuestions.includes(b))) {
        createSeparator();
    }
}

let ntBooksExist = NEW_TESTAMENT_NWT_BOOKS.filter(b => uniqueBooksFromQuestions.includes(b));
if (ntBooksExist.length > 0) {
    createTitle(currentTexts["greek_text"]);
    ntBooksExist.forEach(createButton);
}

// If still nothing was created
if (modalBookButtonsContainer.children.length === 0) {
    modalBookButtonsContainer.innerHTML = '<p>Keine Bibelbücher in den Fragen gefunden.</p>';
}

}

function handleConfirmBookSelection() {
    globallySelectedBooks = [...tempSelectedBooksInModal];
    updateSelectionInfoPanel();
    closeBookSelectModal();
}

function toggleBooksByTestament(testamentType) {
    const booksInTestament = testamentType === 'OT' ? OLD_TESTAMENT_NWT_BOOKS : NEW_TESTAMENT_NWT_BOOKS;
    const availableBooksInQuestions = [...new Set(allQuestions.map(q => q.book))];
    const relevantBooks = booksInTestament.filter(b => availableBooksInQuestions.includes(b));

    const allCurrentlySelected = relevantBooks.length > 0 && relevantBooks.every(b => tempSelectedBooksInModal.includes(b));

    if (allCurrentlySelected) {
        tempSelectedBooksInModal = tempSelectedBooksInModal.filter(b => !relevantBooks.includes(b));
    } else {
        relevantBooks.forEach(b => {
            if (!tempSelectedBooksInModal.includes(b)) tempSelectedBooksInModal.push(b);
        });
    }
    populateModalBookButtons();
    updateTestamentButtonStates();
}

function updateTestamentButtonStates() {
    const availableBooksInQuestions = [...new Set(allQuestions.map(q => q.book))];
    const relevantOTBooks = OLD_TESTAMENT_NWT_BOOKS.filter(b => availableBooksInQuestions.includes(b));
    if (relevantOTBooks.length > 0){
        const allOTSelected = relevantOTBooks.every(b => tempSelectedBooksInModal.includes(b));
        selectAllOtBtn.classList.toggle('active-selection', allOTSelected);
    } else {
        selectAllOtBtn.classList.remove('active-selection');
    }
    const relevantNTBooks = NEW_TESTAMENT_NWT_BOOKS.filter(b => availableBooksInQuestions.includes(b));
    if (relevantNTBooks.length > 0) {
        const allNTSelected = relevantNTBooks.every(b => tempSelectedBooksInModal.includes(b));
        selectAllNtBtn.classList.toggle('active-selection', allNTSelected);
    } else {
        selectAllNtBtn.classList.remove('active-selection');
    }
}

function selectAllAvailableBooksInModal() {
    const availableBooks = [...new Set(allQuestions.map(q => q.book))];
    tempSelectedBooksInModal = [...availableBooks];
    populateModalBookButtons();
    updateTestamentButtonStates();
}

function deselectAllBooksInModal() {
    tempSelectedBooksInModal = [];
    populateModalBookButtons();
    updateTestamentButtonStates();
}

function getSelectedBooks() { return globallySelectedBooks; }

function updateSelectionInfoPanel() {
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
            infoSelectedBooks.textContent = currentTexts['all_books'];
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
    } else { infoSelectedDifficulty.textContent = currentTexts['difficulty_default']; }
}

function updateQuestionAndScoreInfoPanel(question, currentIndex, totalQuestions, score) {
    if (question) {
        infoCurrentBook.textContent = question.book;
        currentQBook.textContent = question.book;
		if (question.difficulty == 'einfach') {
			currentQDifficulty.textContent = currentTexts['difficulty_easy'];
			infoCurrentDifficulty.textContent = currentTexts['difficulty_easy'];
		} else if (question.difficulty == 'mittel') {
			currentQDifficulty.textContent = currentTexts['difficulty_medium'];
			infoCurrentDifficulty.textContent = currentTexts['difficulty_medium'];
		} else if (question.difficulty == 'schwer') {
			currentQDifficulty.textContent = currentTexts['difficulty_hard'];
			infoCurrentDifficulty.textContent = currentTexts['difficulty_hard'];
		}
        currentQuestionMeta.classList.remove('hidden');
    } else {
        infoCurrentBook.textContent = "-"; infoCurrentDifficulty.textContent = "-";
        currentQuestionMeta.classList.add('hidden');
    }
    infoQuestionCounter.textContent = `${currentIndex + 1} / ${totalQuestions}`;
    infoScoreCounter.textContent = score;
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
        showError("Bitte wähle mindestens ein Bibelbuch aus (über 'Bücher wählen...').");
        return;
    }
    showError(null);

    let tempFilteredQuestions = allQuestions.filter(q => 
        (selectedLanguageValue ? q.language === selectedLanguageValue : true) &&
        (selectedBooksValues.length > 0 ? selectedBooksValues.includes(q.book) : true) &&
        (selectedDifficultyValue ? q.difficulty === selectedDifficultyValue : true)
    );
    filteredQuestions = tempFilteredQuestions;

    if (filteredQuestions.length === 0) {
        showError(currentTexts["no_q_error"]);
        return;
    }
    
    filteredQuestions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    updateAccuracyQuote(0,0);
    infoPanel.classList.remove('hidden'); // Info-Panel für Rundenstatistik zeigen
    startScreen.classList.add('hidden');
    statsPage.classList.add('hidden'); // Statistikseite ausblenden
    quizScreen.classList.remove('hidden');
    
    setTimeout(() => {
        quizScreen.focus({preventScroll:true}); // Verhindert, dass der Fokus das Scrollen auslöst
        quizScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

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
        updateQuestionAndScoreInfoPanel(question, currentQuestionIndex, filteredQuestions.length, correctAnswers);
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        answerButtons.forEach((button, index) => {
            if (shuffledOptions[index]) {
                button.textContent = shuffledOptions[index].text;
                button.dataset.isCorrect = shuffledOptions[index].isCorrect;
                button.disabled = false; button.classList.remove('hidden');
            } else { button.classList.add('hidden'); }
        });
        setTimeout(() => {
            quizScreen.focus({preventScroll:true});
            quizScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    } else {
        const finalQuote = filteredQuestions.length > 0 ? Math.round((correctAnswers / filteredQuestions.length) * 100) : 0;
        questionText.textContent = `Quiz beendet! Deine Quote in dieser Runde: ${finalQuote}% (${correctAnswers} von ${filteredQuestions.length} richtig).`;
        answerButtonsContainer.classList.add('hidden');
        feedbackSection.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        currentQuestionMeta.classList.add('hidden');
        setTimeout(() => { backToStartBtn.focus(); }, 0);
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
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const bookName = currentQuestion.book;
    
    if (isCorrect) correctAnswers++;
    overallStats.totalAnswered++;
    if (isCorrect) overallStats.totalCorrect++;
    if (!overallStats.books[bookName]) overallStats.books[bookName] = { totalAnswered: 0, totalCorrect: 0 };
    overallStats.books[bookName].totalAnswered++;
    if (isCorrect) overallStats.books[bookName].totalCorrect++;
    saveOverallStats();
    
    updateQuestionAndScoreInfoPanel(currentQuestion, currentQuestionIndex, filteredQuestions.length, correctAnswers);
    updateAccuracyQuote(correctAnswers, currentQuestionIndex + 1);

    answerButtons.forEach(button => {
        button.disabled = true;
        if (button.dataset.isCorrect === 'true') button.classList.add('correct');
    });
    if (isCorrect) selectedButton.classList.add('correct');
    else selectedButton.classList.add('wrong');

    explanationText.textContent = currentTexts["explanation_label"]+ ": " + currentQuestion.explanation;
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
    if (currentQuestionIndex < filteredQuestions.length) displayQuestion();
}

function goBackToStart() {
    quizScreen.classList.add('hidden');
    statsPage.classList.add('hidden');
    infoPanel.classList.add('hidden'); // Info-Panel für Rundenstatistik auch ausblenden
    startScreen.classList.remove('hidden');
    showError(null);

    
	if (currentLanguage) {
    languageSelect.value = currentLanguage;
	}
    const availableBooks = [...new Set(allQuestions.map(q => q.book))];
    globallySelectedBooks = [...availableBooks];
    difficultySelect.value = "";   
    updateSelectionInfoPanel(); 
    
    // Reset Rundenstatistik-Anzeige im Info-Panel
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
    if (event.target.classList.contains('answer-btn') && !event.target.disabled) selectAnswer(event);
});
openBookSelectModalBtn.addEventListener('click', openBookSelectModal);
closeModalBtn.addEventListener('click', closeBookSelectModal);
confirmBookSelectionBtn.addEventListener('click', handleConfirmBookSelection);
bookSelectModal.addEventListener('click', (event) => { if (event.target === bookSelectModal) closeBookSelectModal(); });
selectAllOtBtn.addEventListener('click', () => toggleBooksByTestament('OT'));
selectAllNtBtn.addEventListener('click', () => toggleBooksByTestament('NT'));
selectAllAvailableBtn.addEventListener('click', selectAllAvailableBooksInModal);
deselectAllModalBtn.addEventListener('click', deselectAllBooksInModal);
showStatsPageBtn.addEventListener('click', showStatsPage);
backToStartFromStatsBtn.addEventListener('click', hideStatsPage);
resetAllStatsBtn.addEventListener('click', resetOverallStats);
difficultySelect.addEventListener('change', updateSelectionInfoPanel);
languageSelect.addEventListener('change', updateSelectionInfoPanel);

document.getElementById('info-btn').addEventListener('click', () => {
  document.getElementById('info-overlay').classList.remove('hidden');
});

document.getElementById('close-info-btn').addEventListener('click', () => {
  document.getElementById('info-overlay').classList.add('hidden');
});

const shareBtn = document.getElementById('share-btn');

shareBtn.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: currentTexts['app_title'],
        text: currentTexts['share_text'],
        url: window.location.href,
      });
    } catch (err) {
    }
  } else {
    alert('Dein Browser unterstützt das Teilen leider nicht.');
  }
});


// --- Start ---
loadQuestions();



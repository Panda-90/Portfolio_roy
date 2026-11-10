// Quiz Configuration and Variables

const SECONDS_PER_QUESTION = 15;

let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = SECONDS_PER_QUESTION;

// DOM Elements
const quizBox = document.getElementById('quiz-box');
const resultBox = document.getElementById('result-box');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const timerElement = document.getElementById('timer');
const explanationBox = document.getElementById('explanation-box');
const explanationText = document.getElementById('explanation-text');
const scoreText = document.getElementById('score-text');
const feedbackMessage = document.getElementById('feedback-message');

// Utility: Fisher-Yates Array Shuffle
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Utility to decode HTML entities returned by the API
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Start / Reset Quiz
async function startQuiz() {
    // Show loading state
    questionElement.textContent = "Fetching questions from the web...";
    optionsElement.innerHTML = "";
    quizBox.classList.remove('hidden');
    resultBox.classList.add('hidden');

    try {
        const response = await fetch('https://opentdb.com/api.php?amount=20&type=multiple');
        const data = await response.json();

        activeQuestions = data.results.map(q => {
            const decodedQuestion = decodeHTMLEntities(q.question);
            const decodedCorrect = decodeHTMLEntities(q.correct_answer);
            const decodedOptions = q.incorrect_answers.map(decodeHTMLEntities);
            decodedOptions.push(decodedCorrect);

            return {
                question: decodedQuestion,
                options: shuffleArray(decodedOptions),
                answer: decodedCorrect,
                explanation: `The correct answer is ${decodedCorrect}.`
            };
        });

        currentQuestionIndex = 0;
        score = 0;

        loadQuestion();
    } catch (error) {
        questionElement.textContent = "Failed to fetch questions. Please check your internet connection.";
    }
}

// Load Question
function loadQuestion() {
    resetState();

    const currentQuestion = activeQuestions[currentQuestionIndex];

    // Update Header Meta
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
    progressBar.style.width = `${((currentQuestionIndex) / activeQuestions.length) * 100}%`;

    // Set Question Text
    questionElement.textContent = currentQuestion.question;

    // Render Options
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => handleOptionClick(button, option, currentQuestion.answer));
        optionsElement.appendChild(button);
    });

    startTimer();
}

// Reset UI between questions
function resetState() {
    clearInterval(timerInterval);
    timeLeft = SECONDS_PER_QUESTION;
    timerElement.textContent = timeLeft;
    nextButton.classList.add('hidden');
    explanationBox.classList.add('hidden');
    optionsElement.innerHTML = '';
}

// Timer Logic
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// Timeout handler if user doesn't pick an option
function handleTimeout() {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Option Click Handler
function handleOptionClick(selectedBtn, selectedOption, correctAnswer) {
    clearInterval(timerInterval);

    if (selectedOption === correctAnswer) {
        score++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function highlightCorrectOption(correctAnswer) {
    Array.from(optionsElement.children).forEach(button => {
        if (button.textContent === correctAnswer) {
            button.classList.add('correct');
        }
    });
}

function disableAllOptions() {
    Array.from(optionsElement.children).forEach(button => {
        button.disabled = true;
    });
}

// Next Question Handler
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

// Final Result Page
function showResults() {
    quizBox.classList.add('hidden');
    resultBox.classList.remove('hidden');
    progressBar.style.width = '100%';

    scoreText.textContent = `${score} / ${activeQuestions.length}`;

    const percentage = (score / activeQuestions.length) * 100;
    if (percentage === 100) {
        feedbackMessage.textContent = "🌟 Perfect Score! You're a Master!";
    } else if (percentage >= 60) {
        feedbackMessage.textContent = "👍 Good job! Keep practicing.";
    } else {
        feedbackMessage.textContent = "📚 Don't give up! Try again to improve.";
    }

    const reviewContainer = document.getElementById('review-container');
    if (reviewContainer) {
        reviewContainer.innerHTML = '<h3>Correct Answers:</h3>';
        activeQuestions.forEach((q, index) => {
            const item = document.createElement('div');
            item.style.marginBottom = '10px';
            item.innerHTML = `<strong>Q${index + 1}:</strong> ${q.question}<br><strong>Answer:</strong> <span style="color: green;">${q.answer}</span>`;
            reviewContainer.appendChild(item);
        });
    }
}

// Restart Handler
restartButton.addEventListener('click', startQuiz);

// Initialize on Load
startQuiz();
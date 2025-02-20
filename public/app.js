

let currentQuiz = [];
let currentQuestionIndex = 0;
let userScore = 0;
let users = JSON.parse(localStorage.getItem('users')) || {}; // Load users from localStorage
let loggedInUser = localStorage.getItem('loggedInUser'); // Check if a user is already logged in
let stayLoggedIn = JSON.parse(localStorage.getItem('stayLoggedIn')); // Check if the user chose to stay logged in

document.addEventListener('DOMContentLoaded', () => {
    if (loggedInUser && stayLoggedIn) {
        loadProgress();
        showDashboard();
    } else {
        localStorage.removeItem('loggedInUser'); // Clear logged in user on page load if not staying logged in
        localStorage.removeItem('stayLoggedIn');
    }

    // Hide quiz container on page load
    document.getElementById('quiz-container').style.display = 'none';

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            navigateTo(event.state.page);
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    loadProgress();
});

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page).style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showChoiceModal() {
    navigateTo('choice-modal');
    history.pushState({ page: 'choice-modal' }, '', '#choice-modal');
}

function showLoginModal() {
    navigateTo('login-modal');
    history.pushState({ page: 'login-modal' }, '', '#login-modal');
}

function showRegistrationModal() {
    navigateTo('registration-modal');
    history.pushState({ page: 'registration-modal' }, '', '#registration-modal');
}

function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar) {
        return true;
    } else {
        alert('Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, and one special character.');
        return false;
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me-login').checked;

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            loggedInUser = data.username;
            localStorage.setItem('loggedInUser', data.username); // Persist the logged-in user
            localStorage.setItem('stayLoggedIn', data.rememberMe); // Persist the stay logged in option
            document.getElementById('login-modal').style.display = 'none'; // Hide login modal
            showDashboard();
        }
    })
    .catch(error => console.error('Error logging in:', error));
}

function register() {
    const fullName = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const rememberMe = document.getElementById('remember-me-register').checked;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (fullName && username && email && validatePassword(password)) {
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, email, password, rememberMe })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                loggedInUser = username; // Set loggedInUser to the registered username
                localStorage.setItem('loggedInUser', username); // Persist the logged-in user
                localStorage.setItem('stayLoggedIn', rememberMe); // Persist the stay logged in option
                document.getElementById('registration-modal').style.display = 'none';
                document.getElementById('otp-modal').style.display = 'flex'; // Show OTP modal
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error registering:', error);
            alert('Failed to register user. Please try again later.');
        });
    } else {
        alert('Please fill in all fields');
    }
}

function verifyOtp() {
    const username = document.getElementById('otp-username').value;
    const otp = document.getElementById('otp-code').value;

    fetch('http://localhost:3000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Verification failed. Please try again.');
            document.getElementById('otp-modal').style.display = 'none';
            document.getElementById('registration-modal').style.display = 'flex';
        } else {
            document.getElementById('otp-modal').style.display = 'none';
            showDashboard();
            alert(data.message);
        }
    })
    .catch(error => console.error('Error verifying OTP:', error));
}

function showDashboard() {
    navigateTo('user-dashboard');
    history.pushState({ page: 'user-dashboard' }, '', '#user-dashboard');
    document.getElementById('welcome-message').textContent = `Welcome, ${loggedInUser}!`;

    // Check if there is saved progress
    fetch(`http://localhost:3000/api/load-progress/${loggedInUser}`)
    .then(response => response.json())
    .then(data => {
        if (data.currentQuiz && data.currentQuiz.length > 0 && data.currentQuestionIndex < data.currentQuiz.length) {
            document.getElementById('continue-quiz-btn').style.display = 'block';
        } else {
            document.getElementById('continue-quiz-btn').style.display = 'none';
        }
    })
    .catch(error => console.error('Error loading progress:', error));
}

function continueQuiz() {
    loadProgress();
    navigateTo('quiz-container');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(language) {
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    console.log(`Starting quiz for language: ${language}`); // Debugging log
    fetch('http://localhost:3000/api/ai-questions')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Questions:', data); // Debugging log
            currentQuiz = data.filter(q => q.type === language);
            if (currentQuiz.length < 10) {
                console.error('Not enough questions for the selected language');
                return;
            }
            currentQuiz = shuffleArray(currentQuiz); // Shuffle questions
            console.log('Shuffled Questions:', currentQuiz); // Debugging log
            navigateTo('quiz-container'); // Ensure the quiz container is displayed
            displayQuestion();
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Failed to fetch questions. Please try again later.');
        });
}

function displayQuestion() {
    if (currentQuestionIndex < currentQuiz.length) {
        const question = currentQuiz[currentQuestionIndex];
        const quizContainer = document.getElementById('current-question');
        if (quizContainer) {
            quizContainer.innerHTML = `
                <h3>${question.question}</h3>
                <div class="question-options">
                    ${question.options.map((opt, index) => `<button class="option-btn" onclick="checkAnswer(${index})">${opt}</button>`).join('')}
                </div>
                <button class="modal-button" onclick="exitQuiz()">Exit Quiz</button>
            `;
            document.getElementById('quiz-container').style.display = 'flex';
        } else {
            console.error('Quiz container not found');
        }
    } else {
        displayScore();
        navigateTo('score-card'); // Ensure the score card is displayed
    }
}

function checkAnswer(selectedIndex) {
    const question = currentQuiz[currentQuestionIndex];
    if (question) {
        const userAnswer = question.options[selectedIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        const options = document.querySelectorAll('.option-btn');
        
        // Disable further clicks on options
        options.forEach(option => option.disabled = true);

        // Highlight the correct answer
        options[question.correctAnswer].style.backgroundColor = 'green';
        if (!isCorrect) {
            options[selectedIndex].style.backgroundColor = 'red';
        }

        if (isCorrect) {
            userScore++;
        }
        currentQuestionIndex++;
        setTimeout(() => {
            if (currentQuestionIndex < currentQuiz.length) {
                displayQuestion();
            } else {
                displayScore();
                navigateTo('score-card'); // Ensure the score card is displayed
            }
        }, 1000); // Delay to show the correct answer
    }
    saveProgress(); // Save progress after each answer
}

function displayScore() {
    const scorePercentage = ((userScore / currentQuiz.length) * 100).toFixed(2);
    const scoreCard = document.getElementById('score-card');
    scoreCard.innerHTML = `
        <div class="falling-flowers"></div>
        <div class="falling-sparkles"></div>
        <h2 class="congratulations">Congratulations!</h2>
        <h2>Your Quiz Score</h2>
        <p id="final-score">You scored ${userScore} out of ${currentQuiz.length} (${scorePercentage}%)</p>
        <button class="modal-button" onclick="returnToDashboard()">Back to Home</button>
    `;
    scoreCard.style.display = 'block';
    console.log('Displayed score card with user score:', userScore, 'out of', currentQuiz.length, '(', scorePercentage, '%)'); // Debugging log
}

function returnToDashboard() {
    // Save progress before returning to dashboard
    saveProgress();

    // Reset quiz state
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    // Hide quiz elements
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('score-card').style.display = 'none';

    // Reset inner HTML to ensure elements are properly cleared
    document.getElementById('current-question').innerHTML = '';

    // Show dashboard
    showDashboard(); // Ensure the dashboard is updated correctly
    console.log('Returned to dashboard'); // Debugging log
}

function exitQuiz() {
    // Save progress before exiting
    saveProgress();

    // Reset quiz state
    currentQuiz = [];
    currentQuestionIndex = 0;
    userScore = 0;

    // Hide quiz elements
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('score-card').style.display = 'none';

    // Reset inner HTML to ensure elements are properly cleared
    document.getElementById('current-question').innerHTML = '';
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('score-card').innerHTML = '';

    // Show dashboard
    showDashboard(); // Ensure the dashboard is updated correctly
    console.log('Exited quiz and returned to dashboard'); // Debugging log
}

// Save user progress to local storage
function saveProgress() {
    const progress = {
        currentQuiz,
        currentQuestionIndex,
        userScore
    };
    fetch('http://localhost:3000/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUser, progress })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error saving progress:', data.error);
        } else {
            console.log('Progress saved successfully');
        }
    })
    .catch(error => console.error('Error saving progress:', error));
}

// Load user progress from local storage
function loadProgress() {
    fetch(`http://localhost:3000/api/load-progress/${loggedInUser}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error loading progress:', data.error);
        } else {
            const progress = data;
            if (progress) {
                currentQuiz = progress.currentQuiz;
                currentQuestionIndex = progress.currentQuestionIndex;
                userScore = progress.userScore;
                displayQuestion();
            }
        }
    })
    .catch(error => console.error('Error loading progress:', error));
}

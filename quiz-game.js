const questions = [
  {
    question: 'Hành tinh nào gần Mặt Trời nhất?',
    answers: ['Trái Đất', 'Sao Hỏa', 'Sao Thủy', 'Sao Kim'],
    correct: 2,
    explanation: 'Sao Thủy là hành tinh gần Mặt Trời nhất.'
  },
  {
    question: 'Động vật nào là loài sống dưới nước?',
    answers: ['Chó', 'Mèo', 'Cá', 'Thỏ'],
    correct: 2,
    explanation: 'Cá sống dưới nước.'
  },
  {
    question: 'Màu của bầu trời vào ban ngày là gì?',
    answers: ['Đỏ', 'Xanh', 'Tím', 'Đen'],
    correct: 1,
    explanation: 'Bầu trời có màu xanh nhờ hiện tượng tán sắc ánh sáng.'
  },
  {
    question: '1 + 1 = ?',
    answers: ['1', '2', '3', '4'],
    correct: 1,
    explanation: '1 + 1 = 2.'
  },
  {
    question: 'Loài nào biết bay?',
    answers: ['Cá', 'Voi', 'Chim', 'Tê giác'],
    correct: 2,
    explanation: 'Chim là loài biết bay.'
  },
  {
    question: 'Thủ đô của Nhật Bản là gì?',
    answers: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'],
    correct: 1,
    explanation: 'Tokyo là thủ đô của Nhật Bản.'
  },
  {
    question: 'Đâu là nguyên tố hóa học của vàng?',
    answers: ['Ag', 'Au', 'Fe', 'Cu'],
    correct: 1,
    explanation: 'Ký hiệu hóa học của vàng là Au.'
  },
  {
    question: 'Nước đóng băng ở nhiệt độ nào?',
    answers: ['0°C', '10°C', '-10°C', '100°C'],
    correct: 0,
    explanation: 'Nước đóng băng ở 0°C.'
  },
  {
    question: 'Con vật nào có nhiều chân nhất?',
    answers: ['Ếch', 'Châu chấu', 'Nhện', 'Cá'],
    correct: 2,
    explanation: 'Nhện có 8 chân.'
  },
  {
    question: 'Bộ phận nào giúp người có thể nhìn?',
    answers: ['Tai', 'Mắt', 'Mũi', 'Da'],
    correct: 1,
    explanation: 'Mắt giúp con người nhìn thấy.'
  }
];

const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const playBtn = document.getElementById('playBtn');
const questionCounter = document.getElementById('questionCounter');
const scoreHud = document.getElementById('scoreHud');
const progressFill = document.getElementById('progressFill');
const questionText = document.getElementById('questionText');
const answersEl = document.getElementById('answers');
const feedback = document.getElementById('feedback');
const finalScore = document.getElementById('finalScore');
const maxScore = document.getElementById('maxScore');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const accuracyValue = document.getElementById('accuracyValue');
const highScoreValue = document.getElementById('highScoreValue');
const playAgainBtn = document.getElementById('playAgainBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');

let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let combo = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let locked = false;
let highScore = Number(localStorage.getItem('quizHighScore') || 0);

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions() {
  const shuffled = shuffle(questions);
  currentQuestions = shuffled.map((q) => {
    const correctAnswer = q.answers[q.correct];
    const answers = shuffle(q.answers);
    return {
      ...q,
      answers,
      correct: answers.indexOf(correctAnswer)
    };
  });
}

function showScreen(screen) {
  startScreen.classList.toggle('active', screen === 'start');
  quizScreen.classList.toggle('active', screen === 'quiz');
  resultScreen.classList.toggle('active', screen === 'result');
}

function playSound(type) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type === 'correct' ? 'triangle' : type === 'wrong' ? 'sawtooth' : 'square';
  oscillator.frequency.value = type === 'correct' ? 660 : type === 'wrong' ? 220 : 320;
  gain.gain.value = 0.03;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

function updateScoreHud() {
  scoreHud.textContent = 'Score: ' + score;
}

function updateProgress() {
  const percent = ((currentIndex) / currentQuestions.length) * 100;
  progressFill.style.width = percent + '%';
  questionCounter.textContent = 'CÂU ' + (currentIndex + 1) + ' / ' + currentQuestions.length;
}

function renderQuestion() {
  if (currentIndex >= currentQuestions.length) {
    endGame();
    return;
  }

  locked = false;
  const q = currentQuestions[currentIndex];
  questionText.textContent = q.question;
  answersEl.innerHTML = '';
  feedback.className = 'feedback hidden';
  feedback.innerHTML = '';

  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.type = 'button';
    btn.textContent = answer;
    btn.addEventListener('click', () => handleAnswer(index, btn));
    answersEl.appendChild(btn);
  });

  updateProgress();
  updateScoreHud();
}

function handleAnswer(index, chosenBtn) {
  if (locked) return;
  locked = true;

  const q = currentQuestions[currentIndex];
  const buttons = [...answersEl.children];
  const correctIndex = q.correct;

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove('selected');

    if (i === correctIndex) {
      btn.classList.add('correct');
    }
  });

  chosenBtn.classList.add('selected');

  if (index === correctIndex) {
    chosenBtn.classList.add('correct');
    correctAnswers += 1;
    combo += 1;
    score += 100;
    playSound('correct');
    feedback.className = 'feedback correct';
    feedback.innerHTML = '<span class="badge">✓</span> CHÍNH XÁC!';
    chosenBtn.classList.add('flash-good');
  } else {
    wrongAnswers += 1;
    combo = 0;
    chosenBtn.classList.add('wrong');
    playSound('wrong');
    feedback.className = 'feedback wrong';
    feedback.innerHTML = '<span class="badge">✕</span><span class="feedback-copy"><strong>SAI RỒI!</strong><span class="feedback-explanation"></span></span>';
    feedback.querySelector('.feedback-explanation').textContent = q.explanation;
  }

  updateScoreHud();
  feedback.classList.remove('hidden');

  setTimeout(() => {
    currentIndex += 1;
    renderQuestion();
  }, 1200);
}

function startGame() {
  score = 0;
  combo = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  currentIndex = 0;
  buildQuestions();
  showScreen('quiz');
  renderQuestion();
}

function endGame() {
  const maxPossible = questions.length * 100;
  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  highScore = Math.max(highScore, score);
  localStorage.setItem('quizHighScore', highScore);

  maxScore.textContent = maxPossible;
  finalScore.textContent = score;
  correctCount.textContent = correctAnswers;
  wrongCount.textContent = wrongAnswers;
  accuracyValue.textContent = accuracy + '%';
  highScoreValue.textContent = highScore;

  showScreen('result');
}

playBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
mainMenuBtn.addEventListener('click', () => {
  showScreen('start');
});

highScoreValue.textContent = highScore;

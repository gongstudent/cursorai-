let score = 0;
let timeLeft = 30;
let gameInterval;
let isPlaying = false;
let missCount = 0;
let combo = 0;
let highScores = JSON.parse(localStorage.getItem('highScores') || '[]');

const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startButton = document.getElementById('start');
const moles = document.querySelectorAll('.mole');
const missDisplay = document.getElementById('miss');
const comboDisplay = document.getElementById('combo');

// 音效
const hitSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
const missSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');
const comboSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3');

// 地鼠类型
const moleTypes = {
    normal: { chance: 0.7, points: 1, className: 'normal-mole', speed: 1500 },
    golden: { chance: 0.2, points: 3, className: 'golden-mole', speed: 1200 },
    bomb: { chance: 0.1, points: -2, className: 'bomb-mole', speed: 2000 }
};

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
    const index = Math.floor(Math.random() * moles.length);
    return moles[index];
}

function getRandomMoleType() {
    const rand = Math.random();
    if (rand < moleTypes.normal.chance) return 'normal';
    if (rand < moleTypes.normal.chance + moleTypes.golden.chance) return 'golden';
    return 'bomb';
}

function updateCombo(hit) {
    if (hit) {
        combo++;
        if (combo > 2) {
            comboSound.play();
        }
    } else {
        combo = 0;
    }
    comboDisplay.textContent = combo;
    comboDisplay.style.fontSize = `${24 + Math.min(combo * 2, 20)}px`;
}

function showMole() {
    if (!isPlaying) return;
    
    const mole = randomHole();
    const moleType = getRandomMoleType();
    const config = moleTypes[moleType];
    
    mole.classList.add('active');
    mole.classList.add(config.className);
    mole.dataset.type = moleType;
    
    setTimeout(() => {
        if (mole.classList.contains('active')) {
            handleMiss();
            missSound.play();
        }
        mole.classList.remove('active');
        mole.classList.remove(config.className);
        if (isPlaying) showMole();
    }, randomTime(config.speed * 0.5, config.speed));
}

function showHighScores() {
    const scoreList = document.getElementById('highScores');
    scoreList.innerHTML = '';
    
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `第${index + 1}名: ${score}分`;
        scoreList.appendChild(li);
    });
    
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function startGame() {
    if (isPlaying) return;
    
    score = 0;
    timeLeft = 30;
    missCount = 0;
    combo = 0;
    isPlaying = true;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    missDisplay.textContent = missCount;
    comboDisplay.textContent = combo;
    startButton.disabled = true;
    
    showMole();
    
    gameInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    startButton.disabled = false;
    
    highScores.push(score);
    showHighScores();
    
    alert(`游戏结束！\n你的得分是: ${score}\n最大连击数: ${combo}\n未击中次数: ${missCount}`);
}

function handleMiss() {
    if (!isPlaying) return;
    missCount++;
    missDisplay.textContent = missCount;
    updateCombo(false);
    
    if (missCount >= 4) {
        endGame();
    }
}

moles.forEach(mole => {
    mole.addEventListener('click', () => {
        if (!isPlaying) return;
        
        if (mole.classList.contains('active')) {
            const moleType = mole.dataset.type;
            const points = moleTypes[moleType].points;
            
            if (moleType === 'bomb') {
                missSound.play();
                handleMiss();
            } else {
                hitSound.play();
                score += points * (combo >= 3 ? 2 : 1); // 连击加倍
                updateCombo(true);
            }
            
            scoreDisplay.textContent = score;
            mole.classList.remove('active');
            mole.classList.remove(moleTypes[moleType].className);
        }
    });
});

startButton.addEventListener('click', startGame); 
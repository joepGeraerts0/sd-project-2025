const LEVEL_CONFIG = {
    TOTAL_LEVELS: 7,
    TRANSITION_DURATION: 600
};

const DEFAULT_PROGRESS = {
    unlockedLevels: 1,
    completedLevels: [],
    levelStars: {}
};

function getProgress() {
    try {
        return Object.assign(DEFAULT_PROGRESS, JSON.parse(localStorage.getItem('levelProgress') || '{}'));
    } catch (error) {
        console.error('Failed to load progress:', error);
        return DEFAULT_PROGRESS;
    }
}

const levelProgress = getProgress();

function loadLevel(levelNum) {
    if (levelNum > levelProgress.unlockedLevels) return;
    
    const levelsPage = document.getElementById('levelsPage');
    levelsPage.style.transition = `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)`;
    levelsPage.style.transform = 'scale(0.9)';
    levelsPage.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = `./game.html?level=${levelNum}`;
    }, LEVEL_CONFIG.TRANSITION_DURATION);
}

function goBack() {
    const levelsPage = document.getElementById('levelsPage');
    levelsPage.style.transition = `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)`;
    levelsPage.style.transform = 'translateY(-30px)';
    levelsPage.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = './index.html';
    }, LEVEL_CONFIG.TRANSITION_DURATION);
}

function generateLevelButtons() {
    const grid = document.getElementById('levelsGrid');
    
    for (let i = 1; i <= LEVEL_CONFIG.TOTAL_LEVELS; i++) {
        const button = document.createElement('button');
        button.className = 'level-btn';
        
        const isUnlocked = i <= levelProgress.unlockedLevels;
        const isCompleted = levelProgress.completedLevels.includes(i);
        const stars = (levelProgress.levelStars && levelProgress.levelStars[i]) || 0;
        
        if (!isUnlocked) {
            button.classList.add('locked');
        } else if (isCompleted) {
            button.classList.add('completed');
        }
        
        const starDisplay = isCompleted ? createStarDisplay(stars) : '';
        
        button.innerHTML = `
            <div class="level-number">${i}</div>
            <div class="level-status">${isCompleted ? 'Complete' : isUnlocked ? 'Available' : 'Locked'}</div>
            ${starDisplay}
        `;
        
        if (isUnlocked) {
            button.onclick = () => loadLevel(i);
        }
        
        grid.appendChild(button);
    }
}

function createStarDisplay(stars) {
    let starHTML = '<div class="star-rating" style="margin-top: 8px; font-size: 0.9em;">';
    for (let i = 1; i <= 3; i++) {
        const color = i <= stars ? '#FFD700' : '#666';
        const shadow = i <= stars ? 'text-shadow: 0 0 5px rgba(255, 215, 0, 0.8);' : '';
        starHTML += `<span style="color: ${color}; ${shadow} margin: 0 2px;">★</span>`;
    }
    starHTML += '</div>';
    return starHTML;
}

window.addEventListener('load', () => {
    const levelsPage = document.getElementById('levelsPage');
    levelsPage.style.opacity = '0';
    levelsPage.style.transform = 'translateY(30px)';
    
    generateLevelButtons();
    
    setTimeout(() => {
        levelsPage.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        levelsPage.style.opacity = '1';
        levelsPage.style.transform = 'translateY(0)';
    }, 100);
});
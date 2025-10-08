const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    MAX_LEVELS: 20,
    PARTICLE_COUNT: 8,
    PARTICLE_DECAY: 0.02
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        this.currentLevel = this.getLevelFromURL();
        this.levelData = null;
        this.player = null;
        this.collectibles = [];
        this.obstacles = [];
        this.particles = [];
        
        this.score = 0;
        this.collectedItems = 0;
        this.gameRunning = false;
        this.timeLeft = 0;
        this.timer = null;
        this.backgroundImage = null;
        
        this.loadLevel();
    }
    
    getLevelFromURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('level')) || 1;
    }
    
    async loadLevel() {
        try {
            const response = await fetch(`./levels/level${this.currentLevel}.json`);
            this.levelData = await response.json();
            this.initializeLevel();
        } catch (error) {
            console.error('Failed to load level:', error);
            this.goToLevels();
        }
    }
    
    initializeLevel() {
        const data = this.levelData;
        
        this.player = new Player(data.playerStart.x, data.playerStart.y);
        this.collectibles = data.collectibles.map(c => new Collectible(c.x, c.y, c.type));
        this.obstacles = data.obstacles;
        
        this.score = 0;
        this.collectedItems = 0;
        this.timeLeft = data.timeLimit;
        this.gameRunning = true;
        this.levelComplete = false;
        this.gameOver = false;
        
        this.loadBackgroundImage();
        this.updateHUD();
        this.startTimer();
        this.gameLoop();
    }
    
    loadBackgroundImage() {
        if (this.levelData && this.levelData.background) {
            this.backgroundImage = new Image();
            this.backgroundImage.src = `./img/${this.levelData.background}`;
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateHUD();
            
            if (this.timeLeft <= 0) {
                this.endGame(false, 'Time\'s up!');
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.player.update();
        
        this.obstacles.forEach(obstacle => {
            CollisionDetector.resolvePlayerPlatformCollision(this.player, obstacle);
        });
        
        this.collectibles.forEach(collectible => {
            collectible.update();
            if (CollisionDetector.checkPlayerCollectibleCollision(this.player, collectible)) {
                const points = collectible.collect();
                if (points > 0) {
                    this.createCollectParticles(collectible.x, collectible.y, collectible.color);
                    this.score += points;
                    this.collectedItems++;
                    this.updateHUD();
                }
            }
        });
        
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        if (this.collectedItems >= this.levelData.requiredItems) {
            this.checkLevelComplete();
        }
    }
    
    createCollectParticles(x, y, color) {
        for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * -4 - 2,
                life: 1.0,
                decay: GAME_CONFIG.PARTICLE_DECAY,
                color,
                size: Math.random() * 4 + 2,
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += 0.2;
                    this.life -= this.decay;
                }
            });
        }
    }
    
    checkLevelComplete() {
        if (CollisionDetector.checkPlayerExitCollision(this.player, this.levelData.exit)) {
            this.endGame(true, 'Level Complete!');
        }
    }
    
    endGame(success, message) {
        this.gameRunning = false;
        this.stopTimer();
        
        if (success) {
            const stars = this.calculateStars();
            this.unlockNextLevel(stars);
            this.showGameOverScreen(message, true, stars);
        } else {
            this.showGameOverScreen(message, false, 0);
        }
    }
    
    calculateStars() {
        const timePercent = this.timeLeft / this.levelData.timeLimit;
        const allItemsCollected = this.collectedItems >= this.levelData.collectibles.length;
        
        if (timePercent >= 0.5 && allItemsCollected) {
            return 3;
        } else if (timePercent >= 0.3 || allItemsCollected) {
            return 2;
        } else {
            return 1;
        }
    }
    
    unlockNextLevel(stars = 1) {
        try {
            const defaultProgress = {
                unlockedLevels: 1,
                completedLevels: [],
                levelStars: {}
            };
            const progress = Object.assign(defaultProgress, JSON.parse(localStorage.getItem('levelProgress') || '{}'));
            
            if (!progress.completedLevels.includes(this.currentLevel)) {
                progress.completedLevels.push(this.currentLevel);
            }
            
            const currentStars = progress.levelStars[this.currentLevel] || 0;
            if (stars > currentStars) {
                progress.levelStars[this.currentLevel] = stars;
            }
            
            if (this.currentLevel === progress.unlockedLevels && this.currentLevel < GAME_CONFIG.MAX_LEVELS) {
                progress.unlockedLevels = this.currentLevel + 1;
            }
            
            localStorage.setItem('levelProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    showGameOverScreen(message, success, stars = 0) {
        const screen = document.getElementById('gameOverScreen');
        const content = document.querySelector('.game-over-content');
        
        content.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = success ? 'Level Complete!' : 'Game Over!';
        title.style.color = success ? '#4CAF50' : '#f44336';
        content.appendChild(title);
        
        if (success && stars > 0) {
            const starContainer = document.createElement('div');
            starContainer.style.cssText = 'margin: 20px 0; font-size: 2em;';
            
            for (let i = 1; i <= 3; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = i <= stars ? '#FFD700' : '#666';
                star.style.margin = '0 5px';
                star.style.textShadow = i <= stars ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none';
                starContainer.appendChild(star);
            }
            content.appendChild(starContainer);
            
            const perfMessage = document.createElement('p');
            if (stars === 3) {
                perfMessage.textContent = 'Perfect! You collected everything with time to spare!';
                perfMessage.style.color = '#FFD700';
            } else if (stars === 2) {
                perfMessage.textContent = 'Great job! You completed the level efficiently!';
                perfMessage.style.color = '#4CAF50';
            } else {
                perfMessage.textContent = 'Good work! Try for a better time next time!';
                perfMessage.style.color = '#81C784';
            }
            content.appendChild(perfMessage);
        }
        
        const stats = document.createElement('div');
        stats.style.cssText = 'margin: 20px 0; color: #ddd; line-height: 1.6;';
        stats.innerHTML = `
            <div>Final Score: ${this.score}</div>
            <div>Items Collected: ${this.collectedItems}/${this.levelData.requiredItems}</div>
            <div>Time Remaining: ${this.timeLeft}s</div>
        `;
        content.appendChild(stats);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'game-over-buttons';
        
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Try Again';
        retryBtn.onclick = () => location.reload();
        
        const nextBtn = document.createElement('button');
        if (success && this.currentLevel < GAME_CONFIG.MAX_LEVELS) {
            nextBtn.textContent = 'Next Level';
            nextBtn.onclick = () => window.location.href = `game.html?level=${this.currentLevel + 1}`;
        } else {
            nextBtn.textContent = 'Level Select';
            nextBtn.onclick = () => window.location.href = 'levels.html';
        }
        
        buttonContainer.appendChild(retryBtn);
        buttonContainer.appendChild(nextBtn);
        content.appendChild(buttonContainer);
        
        screen.style.display = 'flex';
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('collectibles').textContent = this.collectedItems;
        document.getElementById('totalCollectibles').textContent = this.levelData?.requiredItems || 0;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('timer').textContent = this.timeLeft;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBackground();
        this.renderObstacles();
        this.renderCollectibles();
        this.renderParticles();
        this.renderExit();
        this.player.render(this.ctx);
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    renderBackground() {
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.renderDefaultBackground();
        }
    }
    
    renderDefaultBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'wall') {
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(obstacle.x, obstacle.y, 3, obstacle.height);
                this.ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y, 3, obstacle.height);
            } else {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                this.ctx.fillStyle = '#A0522D';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 3);
            }
        });
    }
    
    renderCollectibles() {
        this.collectibles.forEach(collectible => {
            collectible.render(this.ctx);
        });
    }
    
    renderExit() {
        const exit = this.levelData.exit;
        const canExit = this.collectedItems >= this.levelData.requiredItems;
        
        this.ctx.fillStyle = canExit ? '#00FF00' : '#888888';
        this.ctx.beginPath();
        this.ctx.arc(exit.x, exit.y, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = canExit ? '#FFFFFF' : '#444444';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('EXIT', exit.x, exit.y + 4);
        
        if (canExit) {
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(exit.x, exit.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}

function goToLevels() {
    window.location.href = './levels.html';
}

let game;
window.addEventListener('load', () => {
    game = new Game();
});
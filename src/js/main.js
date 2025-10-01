const MAIN_CONFIG = {
    TRANSITION_DURATION: 800,
    LOAD_DELAY: 100,
    LOAD_TRANSITION_DURATION: 600
};

function startGameTransition() {
    const mainPage = document.getElementById('mainPage');
    
    mainPage.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    mainPage.style.transform = 'scale(0.9)';
    mainPage.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = './levels.html';
    }, MAIN_CONFIG.TRANSITION_DURATION);
}

window.addEventListener('load', () => {
    const mainPage = document.getElementById('mainPage');
    if (!mainPage) return;
    
    mainPage.style.opacity = '0';
    mainPage.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        mainPage.style.transition = `all ${MAIN_CONFIG.LOAD_TRANSITION_DURATION / 1000}s cubic-bezier(0.25, 0.8, 0.25, 1)`;
        mainPage.style.opacity = '1';
        mainPage.style.transform = 'scale(1)';
    }, MAIN_CONFIG.LOAD_DELAY);
});
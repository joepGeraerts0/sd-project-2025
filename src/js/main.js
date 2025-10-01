function startGameTransition() {
    const mainPage = document.getElementById('mainPage');
    
    mainPage.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    mainPage.style.transform = 'scale(0.9)';
    mainPage.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = './playGame.html';
    }, 800);
}

window.addEventListener('load', () => {
    const mainPage = document.getElementById('mainPage');
    mainPage.style.opacity = '0';
    mainPage.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        mainPage.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        mainPage.style.opacity = '1';
        mainPage.style.transform = 'scale(1)';
    }, 100);
});
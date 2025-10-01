function goBack() {
    const gamePage = document.getElementById('gamePage');
    
    gamePage.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
    gamePage.style.transform = 'translateY(-30px)';
    gamePage.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = './index.html';
    }, 600);
}

window.addEventListener('load', () => {
    const gamePage = document.getElementById('gamePage');
    gamePage.style.opacity = '0';
    gamePage.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        gamePage.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        gamePage.style.opacity = '1';
        gamePage.style.transform = 'translateY(0)';
    }, 100);
});
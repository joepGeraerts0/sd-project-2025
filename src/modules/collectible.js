const COLLECTIBLE_CONFIG = {
    SIZES: {
        coin: 12,
        gem: 15,
        special: 18
    },
    COLORS: {
        coin: '#FFD700',
        gem: '#FF69B4',
        special: '#00FFFF'
    },
    POINTS: {
        coin: 10,
        gem: 25,
        special: 50
    },
    ANIMATION_SPEED: 0.1
};

class Collectible {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
        this.size = this.getSize();
        this.color = this.getColor();
        this.points = this.getPoints();
        this.animationOffset = Math.random() * Math.PI * 2;
    }
    
    getSize() {
        return COLLECTIBLE_CONFIG.SIZES[this.type] || COLLECTIBLE_CONFIG.SIZES.coin;
    }
    
    getColor() {
        return COLLECTIBLE_CONFIG.COLORS[this.type] || COLLECTIBLE_CONFIG.COLORS.coin;
    }
    
    getPoints() {
        return COLLECTIBLE_CONFIG.POINTS[this.type] || COLLECTIBLE_CONFIG.POINTS.coin;
    }
    
    update() {
        this.animationOffset += COLLECTIBLE_CONFIG.ANIMATION_SPEED;
    }
    
    getBounds() {
        return {
            x: this.x - this.size/2,
            y: this.y - this.size/2,
            width: this.size,
            height: this.size,
            right: this.x + this.size/2,
            bottom: this.y + this.size/2
        };
    }
    
    collect() {
        if (!this.collected) {
            this.collected = true;
            return this.points;
        }
        return 0;
    }
    
    render(ctx) {
        if (this.collected) return;
        
        const pulse = Math.sin(this.animationOffset) * 0.2 + 1;
        const size = this.size * pulse;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Add glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        
        switch(this.type) {
            case 'coin':
                this.renderCoin(ctx, size);
                break;
            case 'gem':
                this.renderGem(ctx, size);
                break;
            case 'special':
                this.renderSpecial(ctx, size);
                break;
        }
        
        ctx.restore();
    }
    
    renderCoin(ctx, size) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, size/3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderGem(ctx, size) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/3, -size/4);
        ctx.lineTo(size/3, size/4);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/3, size/4);
        ctx.lineTo(-size/3, -size/4);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-size/6, -size/6, size/8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderSpecial(ctx, size) {
        const rotation = this.animationOffset;
        ctx.rotate(rotation);
        
        ctx.fillStyle = this.color;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(size/3, size/6);
            ctx.lineTo(size/3, -size/6);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(Math.PI / 3);
        }
    }
}
const PLAYER_CONFIG = {
    WIDTH: 50,
    HEIGHT: 50,
    SPEED: 5,
    JUMP_POWER: 12,
    WALL_JUMP_POWER: 10,
    GRAVITY: 0.5,
    WALL_SLIDE_SPEED: 2,
    WALL_SLIDE_TIMER: 15,
    WALL_JUMP_SPEED_MULTIPLIER: 1.5
};

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_CONFIG.WIDTH;
        this.height = PLAYER_CONFIG.HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = PLAYER_CONFIG.SPEED;
        this.jumpPower = PLAYER_CONFIG.JUMP_POWER;
        this.gravity = PLAYER_CONFIG.GRAVITY;
        this.onGround = false;
        this.onWall = false;
        this.wallSlideSpeed = PLAYER_CONFIG.WALL_SLIDE_SPEED;
        this.wallJumpPower = PLAYER_CONFIG.WALL_JUMP_POWER;
        this.wallJumpDirection = 0;
        this.wallSlideTimer = 0;

        this.keys = { left: false, right: false, up: false };

        this.facing = 1;

        this.sprite = new Image();
        this.spriteLoaded = false;
        this.sprite.src = './img/player.png';
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        this.sprite.onerror = () => {
            console.warn('Не вдалося завантажити спрайт гравця: ./img/knight.png');
        };

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.keys.up = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.keys.up = false;
                    break;
            }
        });
    }

    update() {
        if (this.velocityY > 0) {
            this.onGround = false;
        }

        this.handleInput();
        this.applyPhysics();
        this.constrainToCanvas();

        if (this.wallSlideTimer > 0) {
            this.wallSlideTimer--;
        }
    }

    handleInput() {
        this.velocityX = 0;

        if (this.keys.left) {
            this.velocityX = -this.speed;
            this.facing = -1;
        }
        if (this.keys.right) {
            this.velocityX = this.speed;
            this.facing = 1;
        }

        if (this.keys.up) {
            if (this.onGround) {
                this.velocityY = -this.jumpPower;
                this.onGround = false;
            } else if (this.onWall && this.wallSlideTimer > 0) {
                this.velocityY = -this.wallJumpPower;
                this.velocityX = this.wallJumpDirection * this.speed * PLAYER_CONFIG.WALL_JUMP_SPEED_MULTIPLIER;
                this.onWall = false;
                this.wallSlideTimer = 0;
            }
        }
    }

    applyPhysics() {
        if (this.onWall && !this.onGround && this.velocityY > 0) {
            this.velocityY = Math.min(this.velocityY, this.wallSlideSpeed);
        } else {
            this.velocityY += this.gravity;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    constrainToCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }

    render(ctx) {
        ctx.save();

        if (this.onWall) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FF6B6B';
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }

        if (this.spriteLoaded) {
            if (this.facing === -1) {
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
            }
        } else {
            if (this.onWall) {
                ctx.fillStyle = '#FF6B6B';
            } else {
                ctx.fillStyle = '#4CAF50';
            }
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.shadowBlur = 0;
            ctx.fillStyle = this.onWall ? '#D32F2F' : '#2E7D32';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

            ctx.fillStyle = this.onWall ? '#FF8A80' : '#66BB6A';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        }

        ctx.restore();
    }
}
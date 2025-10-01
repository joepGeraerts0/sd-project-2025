const COLLISION_CONFIG = {
    EXIT_RADIUS: 30,
    WALL_SLIDE_TIMER: 15
};

class CollisionDetector {
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static resolvePlayerPlatformCollision(player, platform) {
        const playerBounds = player.getBounds();
        const platformBounds = platform;
        
        if (!this.checkRectCollision(playerBounds, platformBounds)) {
            player.onWall = false;
            return;
        }
        
        const overlapLeft = playerBounds.right - platformBounds.x;
        const overlapRight = platformBounds.x + platformBounds.width - playerBounds.x;
        const overlapTop = playerBounds.bottom - platformBounds.y;
        const overlapBottom = platformBounds.y + platformBounds.height - playerBounds.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop && player.velocityY >= 0) {
            player.y = platformBounds.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.onWall = false;
        }
        else if (minOverlap === overlapBottom && player.velocityY < 0) {
            player.y = platformBounds.y + platformBounds.height;
            player.velocityY = 0;
            player.onWall = false;
        }
        else if (minOverlap === overlapLeft && !player.onGround) {
            player.x = platformBounds.x - player.width;
            if (player.velocityY > 0) {
                player.onWall = true;
                player.wallJumpDirection = 1;
                player.wallSlideTimer = COLLISION_CONFIG.WALL_SLIDE_TIMER;
            }
        }
        else if (minOverlap === overlapRight && !player.onGround) {
            player.x = platformBounds.x + platformBounds.width;
            if (player.velocityY > 0) {
                player.onWall = true;
                player.wallJumpDirection = -1;
                player.wallSlideTimer = COLLISION_CONFIG.WALL_SLIDE_TIMER;
            }
        }
    }
    
    static checkPlayerCollectibleCollision(player, collectible) {
        if (collectible.collected) return false;
        
        const playerBounds = player.getBounds();
        const collectibleBounds = collectible.getBounds();
        
        return this.checkRectCollision(playerBounds, collectibleBounds);
    }
    
    static checkPlayerExitCollision(player, exit) {
        const playerBounds = player.getBounds();
        const exitBounds = {
            x: exit.x - COLLISION_CONFIG.EXIT_RADIUS,
            y: exit.y - COLLISION_CONFIG.EXIT_RADIUS,
            width: COLLISION_CONFIG.EXIT_RADIUS * 2,
            height: COLLISION_CONFIG.EXIT_RADIUS * 2
        };
        
        return this.checkRectCollision(playerBounds, exitBounds);
    }
}
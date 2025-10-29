function entity(x, y, type, aiType) {
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 50;
  this.type = type;
  this.aiType = aiType || "melee";
  this.health = 100;
  this.maxHealth = 100;
  this.isAlive = true;
  this.attackCooldown = 0;
}

const levelData = {
  20: [
    { x: 300, y: 300, type: "boss", ai: "boss" }
  ]
};

let currentLevel = 1;
const enemies = [];

function startLevel(level) {
  currentLevel = level;
  spawnEnemiesForLevel(level);
  console.log(`Level ${level} gestart met ${enemies.length} vijanden`);
}

function checkLevelComplete() {
  const allDead = enemies.every(e => !e.isAlive);
  if (allDead) {
    startLevel(currentLevel + 1);
  }
}

function spawnEnemiesForLevel(level) {
  enemies.length = 0;

  // Voeg boss toe op level 20
  if (level === 20 && levelData[20]) {
    for (const spawn of levelData[20]) {
      enemies.push(new entity(spawn.x, spawn.y, spawn.type, spawn.ai));
    }
  }

  // Elke 5e level: spawn 10 vijanden
  if (level % 5 === 0) {
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 100;
      const y = 100 + Math.floor(i / 5) * 100;
      const type = "slime";
      const aiTypes = ["melee", "ranged", "dash"];
      const ai = aiTypes[i % aiTypes.length];
      enemies.push(new entity(x, y, type, ai));
    }
    return;
  }

  // Normale levels: fallback met 3 standaard vijanden
  for (let i = 0; i < 3; i++) {
    const x = 150 + i * 100;
    const y = 200;
    enemies.push(new entity(x, y, "slime", "melee"));
  }
}

entity.prototype.runAI = function(player) {
  switch (this.aiType) {
    case "melee":
      this.runMeleeAI(player);
      break;
    case "ranged":
      this.runRangedAI(player);
      break;
    case "dash":
      this.runDashAi(player);
      break;
    case "boss":
      this.runBossAI(player);
      break;
    default:
      console.warn(`Unknown AI type: ${this.aiType}`);
  }
};

entity.prototype.runMeleeAI = function(player) {
  if (!this.isAlive) return;

  const collides = this.x < player.x + player.width &&
                   this.x + this.width > player.x &&
                   this.y < player.y + player.height &&
                   this.y + this.height > player.y;

  if (collides && this.attackCooldown <= 0) {
    player.takeDamage(10);
    this.attackCooldown = 60;
  }

  if (this.attackCooldown > 0) {
    this.attackCooldown--;
  }
};

entity.prototype.runRangedAI = function(player) {
  // Voeg ranged gedrag toe
};

entity.prototype.runDashAi = function(player) {
  // Voeg dash gedrag toe
};

entity.prototype.runBossAI = function(player) {
  // Voeg boss gedrag toe
};

entity.prototype.render = function(ctx) {
  if (!this.isAlive) return;

  ctx.fillStyle = 'purple';
  ctx.fillRect(this.x, this.y, this.width, this.height);

  const healthRatio = this.health / this.maxHealth;
  ctx.fillStyle = 'black';
  ctx.fillRect(this.x, this.y - 10, this.width, 6);
  ctx.fillStyle = healthRatio > 0.5 ? 'limegreen' : healthRatio > 0.2 ? 'orange' : 'red';
  ctx.fillRect(this.x, this.y - 10, this.width * healthRatio, 6);
};

entity.prototype.takeDamage = function(amount) {
  if (!this.isAlive) return;

  this.health -= amount;
  if (this.health <= 0) {
    this.health = 0;
    this.isAlive = false;
    this.onDeath();
  }
};

entity.prototype.onDeath = function() {
  console.log(`${this.type} died`);
};

function updateEnemies(player) {
  for (const e of enemies) {
    e.runAI(player);
  }
}

function renderEnemies(ctx) {
  for (const e of enemies) {
    e.render(ctx);
  }
}
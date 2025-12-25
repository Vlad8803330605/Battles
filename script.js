// Game State
let gameState = {
    character: null,
    currentOpponent: null,
    battleState: null,
    history: [],
    totalFights: 0,
    totalWins: 0,
    totalLosses: 0
};

// Enemy Templates
const enemyTemplates = {
    1: { name: 'Новичок', level: 1, hp: 80, attack: 12, defense: 8, expReward: 50, goldReward: 10 },
    2: { name: 'Уличный боец', level: 2, hp: 100, attack: 15, defense: 10, expReward: 70, goldReward: 20 },
    3: { name: 'Боец', level: 3, hp: 130, attack: 18, defense: 13, expReward: 100, goldReward: 30 },
    4: { name: 'Опытный воин', level: 4, hp: 160, attack: 22, defense: 16, expReward: 130, goldReward: 45 },
    5: { name: 'Ветеран', level: 5, hp: 200, attack: 26, defense: 19, expReward: 160, goldReward: 60 },
    6: { name: 'Мастер', level: 6, hp: 240, attack: 30, defense: 22, expReward: 200, goldReward: 80 },
    7: { name: 'Чемпион', level: 7, hp: 280, attack: 35, defense: 26, expReward: 250, goldReward: 100 },
    8: { name: 'Легенда', level: 8, hp: 320, attack: 40, defense: 30, expReward: 300, goldReward: 130 },
    9: { name: 'Титан', level: 9, hp: 380, attack: 46, defense: 35, expReward: 400, goldReward: 170 },
    10: { name: 'Босс Арены', level: 10, hp: 500, attack: 55, defense: 40, expReward: 600, goldReward: 250 }
};

// Character Classes
const characterClasses = {
    fighter: { name: 'Боец', hp: 150, attack: 20, defense: 15 },
    tank: { name: 'Танк', hp: 200, attack: 15, defense: 25 },
    berserker: { name: 'Берсерк', hp: 120, attack: 30, defense: 10 }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initCreationScreen();
    initGameScreen();
});

// Character Creation
function initCreationScreen() {
    const nameInput = document.getElementById('fighter-name');
    const classCards = document.querySelectorAll('.class-card');
    const startBtn = document.getElementById('start-game-btn');
    
    let selectedClass = null;
    
    classCards.forEach(card => {
        card.addEventListener('click', () => {
            classCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedClass = card.dataset.class;
            updateStartButton();
        });
    });
    
    nameInput.addEventListener('input', updateStartButton);
    
    function updateStartButton() {
        const hasName = nameInput.value.trim().length > 0;
        startBtn.disabled = !(hasName && selectedClass);
    }
    
    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name && selectedClass) {
            createCharacter(name, selectedClass);
            switchScreen('game-screen');
            showPage('profile');
        }
    });
}

function createCharacter(name, classType) {
    const classData = characterClasses[classType];
    gameState.character = {
        name: name,
        class: classType,
        className: classData.name,
        level: 1,
        hp: classData.hp,
        maxHp: classData.hp,
        attack: classData.attack,
        defense: classData.defense,
        exp: 0,
        expToLevel: 100,
        gold: 100,
        weaponUpgrades: 0,
        armorUpgrades: 0
    };
    
    gameState.history = [];
    gameState.totalFights = 0;
    gameState.totalWins = 0;
    gameState.totalLosses = 0;
    
    saveGame();
    updateProfileDisplay();
}

// Screen Management
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    if (pageId === 'arena') {
        showArenaSelection();
    } else if (pageId === 'shop') {
        updateShopDisplay();
    } else if (pageId === 'history') {
        updateHistoryDisplay();
    } else if (pageId === 'profile') {
        updateProfileDisplay();
    }
}

// Game Screen Initialization
function initGameScreen() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(btn.dataset.page);
        });
    });
    
    // Profile heal button
    document.getElementById('heal-btn').addEventListener('click', () => {
        healCharacter();
    });
    
    // Shop buttons
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', () => {
            buyItem(btn.dataset.item);
        });
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите начать заново?')) {
            localStorage.removeItem('fightClubSave');
            location.reload();
        }
    });
}

// Profile Display
function updateProfileDisplay() {
    const char = gameState.character;
    if (!char) return;
    
    document.getElementById('profile-name').textContent = char.name;
    document.getElementById('profile-class').textContent = char.className;
    document.getElementById('stat-level').textContent = char.level;
    document.getElementById('stat-hp').textContent = `${char.hp}/${char.maxHp}`;
    document.getElementById('stat-attack').textContent = char.attack;
    document.getElementById('stat-defense').textContent = char.defense;
    document.getElementById('stat-exp').textContent = `${char.exp}/${char.expToLevel}`;
    document.getElementById('stat-gold').textContent = char.gold;
    
    const expPercent = (char.exp / char.expToLevel) * 100;
    document.getElementById('exp-progress').style.width = expPercent + '%';
    
    document.getElementById('total-fights').textContent = gameState.totalFights;
    document.getElementById('total-wins').textContent = gameState.totalWins;
    document.getElementById('total-losses').textContent = gameState.totalLosses;
    
    const winRate = gameState.totalFights > 0 
        ? Math.round((gameState.totalWins / gameState.totalFights) * 100)
        : 0;
    document.getElementById('win-rate').textContent = winRate + '%';
}

function healCharacter() {
    const char = gameState.character;
    if (char.hp >= char.maxHp) {
        showNotification('У вас уже максимальное здоровье!');
        return;
    }
    
    char.hp = char.maxHp;
    updateProfileDisplay();
    saveGame();
    showNotification('Здоровье восстановлено!');
}

// Arena
function showArenaSelection() {
    document.getElementById('arena-selection').style.display = 'block';
    document.getElementById('battle-screen').style.display = 'none';
    
    const grid = document.getElementById('opponents-grid');
    grid.innerHTML = '';
    
    const char = gameState.character;
    const minLevel = Math.max(1, char.level - 2);
    const maxLevel = Math.min(10, char.level + 2);
    
    for (let level = minLevel; level <= maxLevel; level++) {
        const enemy = enemyTemplates[level];
        const card = createOpponentCard(enemy);
        grid.appendChild(card);
    }
}

function createOpponentCard(enemy) {
    const card = document.createElement('div');
    card.className = 'opponent-card';
    card.innerHTML = `
        <div class="opponent-name">${enemy.name}</div>
        <div class="opponent-level">Уровень ${enemy.level}</div>
        <div class="opponent-stats">
            <div class="opponent-stat">
                <div class="opponent-stat-label">HP</div>
                <div class="opponent-stat-value">${enemy.hp}</div>
            </div>
            <div class="opponent-stat">
                <div class="opponent-stat-label">ATK</div>
                <div class="opponent-stat-value">${enemy.attack}</div>
            </div>
            <div class="opponent-stat">
                <div class="opponent-stat-label">DEF</div>
                <div class="opponent-stat-value">${enemy.defense}</div>
            </div>
        </div>
        <div class="opponent-reward">💰 ${enemy.goldReward} золота | ⭐ ${enemy.expReward} опыта</div>
    `;
    
    card.addEventListener('click', () => {
        startBattle(enemy);
    });
    
    return card;
}

// Battle System
function startBattle(enemyTemplate) {
    gameState.currentOpponent = {
        ...enemyTemplate,
        currentHp: enemyTemplate.hp
    };
    
    gameState.battleState = {
        playerHp: gameState.character.hp,
        enemyHp: enemyTemplate.hp,
        healUsed: false,
        turn: 'player'
    };
    
    document.getElementById('arena-selection').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
    document.getElementById('back-to-arena-btn').style.display = 'none';
    
    updateBattleDisplay();
    clearBattleLog();
    addBattleLog('result', `Бой начался! ${gameState.character.name} VS ${enemyTemplate.name}`);
    
    enableBattleActions(true);
}

function updateBattleDisplay() {
    const char = gameState.character;
    const enemy = gameState.currentOpponent;
    const state = gameState.battleState;
    
    document.getElementById('battle-player-name').textContent = char.name;
    document.getElementById('battle-enemy-name').textContent = enemy.name;
    
    document.getElementById('player-hp-text').textContent = `${state.playerHp}/${char.maxHp}`;
    document.getElementById('enemy-hp-text').textContent = `${state.enemyHp}/${enemy.hp}`;
    
    const playerHpPercent = (state.playerHp / char.maxHp) * 100;
    const enemyHpPercent = (state.enemyHp / enemy.hp) * 100;
    
    document.getElementById('player-hp-fill').style.width = playerHpPercent + '%';
    document.getElementById('enemy-hp-fill').style.width = enemyHpPercent + '%';
    
    document.getElementById('player-attack').textContent = char.attack;
    document.getElementById('player-defense').textContent = char.defense;
    document.getElementById('enemy-attack').textContent = enemy.attack;
    document.getElementById('enemy-defense').textContent = enemy.defense;
    
    // Update heal button
    const healBtn = document.getElementById('heal-action-btn');
    healBtn.disabled = state.healUsed;
    if (state.healUsed) {
        healBtn.textContent = 'ЛЕЧЕНИЕ (использовано)';
    } else {
        healBtn.textContent = 'ЛЕЧЕНИЕ';
    }
}

function enableBattleActions(enabled) {
    document.querySelectorAll('.battle-btn').forEach(btn => {
        if (btn.id !== 'heal-action-btn') {
            btn.disabled = !enabled;
        }
    });
}

// Battle Actions
document.querySelectorAll('.battle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action) {
            performPlayerAction(action);
        }
    });
});

function performPlayerAction(action) {
    enableBattleActions(false);
    
    const char = gameState.character;
    const enemy = gameState.currentOpponent;
    const state = gameState.battleState;
    
    let damage = 0;
    let message = '';
    
    switch(action) {
        case 'attack':
            damage = Math.max(1, char.attack - enemy.defense);
            state.enemyHp -= damage;
            message = `Вы атакуете! Урон: ${damage}`;
            addBattleLog('player-action', message);
            break;
            
        case 'heavy':
            const hitChance = Math.random();
            if (hitChance > 0.3) {
                damage = Math.max(1, (char.attack * 2) - enemy.defense);
                state.enemyHp -= damage;
                message = `Сильный удар! Критический урон: ${damage}`;
                addBattleLog('player-action', message);
            } else {
                message = 'Сильный удар не попал в цель!';
                addBattleLog('player-action', message);
            }
            break;
            
        case 'defend':
            message = 'Вы заняли защитную стойку';
            addBattleLog('player-action', message);
            state.defending = true;
            break;
            
        case 'heal':
            if (!state.healUsed) {
                const healAmount = Math.floor(char.maxHp * 0.3);
                state.playerHp = Math.min(char.maxHp, state.playerHp + healAmount);
                state.healUsed = true;
                message = `Вы восстановили ${healAmount} HP`;
                addBattleLog('player-action', message);
            }
            break;
    }
    
    updateBattleDisplay();
    
    setTimeout(() => {
        if (state.enemyHp <= 0) {
            endBattle(true);
        } else {
            performEnemyAction();
        }
    }, 800);
}

function performEnemyAction() {
    const char = gameState.character;
    const enemy = gameState.currentOpponent;
    const state = gameState.battleState;
    
    const actions = ['attack', 'attack', 'heavy'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    let damage = 0;
    let message = '';
    
    switch(action) {
        case 'attack':
            damage = Math.max(1, enemy.attack - char.defense);
            if (state.defending) {
                damage = Math.floor(damage * 0.5);
                message = `${enemy.name} атакует! Вы блокировали часть урона: ${damage}`;
                state.defending = false;
            } else {
                message = `${enemy.name} атакует! Урон: ${damage}`;
            }
            state.playerHp -= damage;
            addBattleLog('enemy-action', message);
            break;
            
        case 'heavy':
            const hitChance = Math.random();
            if (hitChance > 0.3) {
                damage = Math.max(1, (enemy.attack * 2) - char.defense);
                if (state.defending) {
                    damage = Math.floor(damage * 0.5);
                    message = `${enemy.name} использует сильный удар! Вы блокировали часть урона: ${damage}`;
                    state.defending = false;
                } else {
                    message = `${enemy.name} использует сильный удар! Критический урон: ${damage}`;
                }
                state.playerHp -= damage;
                addBattleLog('enemy-action', message);
            } else {
                message = `${enemy.name} промахивается сильным ударом!`;
                addBattleLog('enemy-action', message);
            }
            break;
    }
    
    updateBattleDisplay();
    
    setTimeout(() => {
        if (state.playerHp <= 0) {
            endBattle(false);
        } else {
            enableBattleActions(true);
        }
    }, 800);
}

function endBattle(playerWon) {
    const enemy = gameState.currentOpponent;
    const char = gameState.character;
    
    gameState.totalFights++;
    
    if (playerWon) {
        gameState.totalWins++;
        addBattleLog('result', `🎉 ПОБЕДА! Вы победили ${enemy.name}!`);
        addBattleLog('result', `💰 Получено ${enemy.goldReward} золота и ${enemy.expReward} опыта`);
        
        char.gold += enemy.goldReward;
        char.exp += enemy.expReward;
        char.hp = gameState.battleState.playerHp;
        
        addToHistory(enemy.name, true, enemy.goldReward);
        
        checkLevelUp();
        
        if (char.level >= 10 && enemy.level === 10) {
            setTimeout(() => {
                showVictoryScreen();
            }, 2000);
            return;
        }
    } else {
        gameState.totalLosses++;
        addBattleLog('result', `💀 ПОРАЖЕНИЕ! ${enemy.name} победил вас!`);
        
        const goldLoss = Math.floor(char.gold * 0.2);
        char.gold = Math.max(0, char.gold - goldLoss);
        char.hp = char.maxHp;
        
        addBattleLog('result', `💰 Потеряно ${goldLoss} золота`);
        addToHistory(enemy.name, false, -goldLoss);
    }
    
    saveGame();
    updateProfileDisplay();
    
    document.getElementById('back-to-arena-btn').style.display = 'block';
    document.getElementById('back-to-arena-btn').onclick = () => {
        showPage('arena');
    };
}

function checkLevelUp() {
    const char = gameState.character;
    
    while (char.exp >= char.expToLevel && char.level < 10) {
        char.level++;
        char.exp -= char.expToLevel;
        char.expToLevel = Math.floor(char.expToLevel * 1.5);
        
        char.maxHp += 10;
        char.hp = char.maxHp;
        char.attack += 3;
        char.defense += 2;
        
        addBattleLog('result', `⭐ ПОВЫШЕНИЕ УРОВНЯ! Вы достигли ${char.level} уровня!`);
        addBattleLog('result', `HP +10, Атака +3, Защита +2`);
    }
}

function clearBattleLog() {
    document.getElementById('battle-log').innerHTML = '';
}

function addBattleLog(type, message) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Shop
function updateShopDisplay() {
    document.getElementById('shop-gold').textContent = gameState.character.gold;
}

function buyItem(itemType) {
    const char = gameState.character;
    
    switch(itemType) {
        case 'potion':
            if (char.gold >= 50) {
                if (char.hp >= char.maxHp) {
                    showNotification('У вас уже максимальное здоровье!');
                    return;
                }
                char.gold -= 50;
                char.hp = char.maxHp;
                showNotification('Зелье здоровья куплено! HP восстановлено.');
            } else {
                showNotification('Недостаточно золота!');
            }
            break;
            
        case 'weapon':
            if (char.gold >= 200) {
                char.gold -= 200;
                char.attack += 5;
                char.weaponUpgrades++;
                showNotification('Оружие улучшено! Атака +5');
            } else {
                showNotification('Недостаточно золота!');
            }
            break;
            
        case 'armor':
            if (char.gold >= 150) {
                char.gold -= 150;
                char.defense += 3;
                char.armorUpgrades++;
                showNotification('Броня улучшена! Защита +3');
            } else {
                showNotification('Недостаточно золота!');
            }
            break;
    }
    
    saveGame();
    updateShopDisplay();
    updateProfileDisplay();
}

// History
function addToHistory(opponentName, won, reward) {
    const entry = {
        opponent: opponentName,
        result: won ? 'win' : 'loss',
        reward: reward,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    gameState.history.unshift(entry);
    if (gameState.history.length > 10) {
        gameState.history = gameState.history.slice(0, 10);
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    
    if (gameState.history.length === 0) {
        historyList.innerHTML = '<p class="no-history">Пока нет истории боёв</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    gameState.history.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-result ${entry.result}">
                ${entry.result === 'win' ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
            </div>
            <div class="history-details">
                <div class="history-opponent">vs ${entry.opponent}</div>
                <div class="history-time">${entry.timestamp}</div>
            </div>
            <div class="history-reward">${entry.reward > 0 ? '+' : ''}${entry.reward} 💰</div>
        `;
        historyList.appendChild(item);
    });
}

// Victory Screen
function showVictoryScreen() {
    const stats = `
        <div class="victory-stat">
            <div class="victory-stat-label">Всего боёв</div>
            <div class="victory-stat-value">${gameState.totalFights}</div>
        </div>
        <div class="victory-stat">
            <div class="victory-stat-label">Побед</div>
            <div class="victory-stat-value">${gameState.totalWins}</div>
        </div>
        <div class="victory-stat">
            <div class="victory-stat-label">Поражений</div>
            <div class="victory-stat-value">${gameState.totalLosses}</div>
        </div>
    `;
    
    document.getElementById('victory-stats').innerHTML = stats;
    switchScreen('victory-screen');
}

// Save/Load
function saveGame() {
    localStorage.setItem('fightClubSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('fightClubSave');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
            if (gameState.character) {
                switchScreen('game-screen');
                showPage('profile');
            }
        } catch (e) {
            console.error('Failed to load save', e);
        }
    }
}

// Notification
function showNotification(message) {
    // Simple alert for MVP
    alert(message);
}
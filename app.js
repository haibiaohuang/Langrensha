// ===== Game Configurations =====
const GAME_CONFIGS = {
    9: [
        { id: '9_standard', name: '标准局', desc: '3狼3神3民', wolves: ['wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter'], villagers: 3 },
        { id: '9_wolf_beauty', name: '狼美人局', desc: '2狼1美人 3神3民', wolves: ['wolf', 'wolf', 'wolf_beauty'], gods: ['seer', 'witch', 'hunter'], villagers: 3 },
        { id: '9_guard', name: '守卫局', desc: '3狼3神3民', wolves: ['wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'guard'], villagers: 3 }
    ],
    10: [
        { id: '10_standard', name: '标准局', desc: '3狼3神4民', wolves: ['wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter'], villagers: 4 },
        { id: '10_wolf_beauty', name: '狼美人局', desc: '2狼1美人 3神4民', wolves: ['wolf', 'wolf', 'wolf_beauty'], gods: ['seer', 'witch', 'hunter'], villagers: 4 },
        { id: '10_white_wolf', name: '白狼王局', desc: '2狼1白狼 3神4民', wolves: ['wolf', 'wolf', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter'], villagers: 4 }
    ],
    12: [
        { id: '12_standard', name: '标准局', desc: '4狼4神4民', wolves: ['wolf', 'wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 4 },
        { id: '12_wolf_beauty', name: '狼美人局', desc: '3狼1美人 4神4民', wolves: ['wolf', 'wolf', 'wolf', 'wolf_beauty'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 4 },
        { id: '12_white_wolf', name: '白狼王局', desc: '3狼1白狼 4神4民', wolves: ['wolf', 'wolf', 'wolf', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 4 },
        { id: '12_double', name: '双狼局', desc: '2狼1美人1白狼 4神4民', wolves: ['wolf', 'wolf', 'wolf_beauty', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 4 }
    ]
};

const ROLES = {
    wolf: { name: '狼人', icon: '🐺', short: '狼', camp: 'wolf' },
    white_wolf_king: { name: '白狼王', icon: '👑', short: '白狼', camp: 'wolf' },
    wolf_beauty: { name: '狼美人', icon: '💋', short: '美人', camp: 'wolf' },
    seer: { name: '预言家', icon: '🔮', short: '预', camp: 'god' },
    witch: { name: '女巫', icon: '🧙‍♀️', short: '巫', camp: 'god' },
    hunter: { name: '猎人', icon: '🏹', short: '猎', camp: 'god' },
    guard: { name: '守卫', icon: '🛡️', short: '守', camp: 'god' },
    idiot: { name: '白痴', icon: '🤪', short: '痴', camp: 'god' },
    villager: { name: '村民', icon: '👨‍🌾', short: '民', camp: 'villager' },
    unknown: { name: '未知', icon: '❓', short: '?', camp: 'unknown' }
};

let players = [];
let selectedPlayerCount = 12;
let selectedConfig = null;
let hasSheriff = true;
let gameHistory = [];

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    loadHistory();
    setupEventListeners();
    renderConfigOptions();
    if (players.length > 0 && selectedConfig) showGame();
});

function setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedPlayerCount = parseInt(tab.dataset.count);
            renderConfigOptions();
        });
    });
    document.getElementById('gameNotes')?.addEventListener('input', debounce(saveGameState, 500));
    document.getElementById('sheriffToggle')?.addEventListener('change', e => hasSheriff = e.target.checked);
}

// ===== Config =====
function renderConfigOptions() {
    const configs = GAME_CONFIGS[selectedPlayerCount] || [];
    document.getElementById('configGrid').innerHTML = configs.map(c => `
        <div class="config-item ${selectedConfig?.id === c.id ? 'selected' : ''}" onclick="selectConfig('${c.id}')">
            <div><div class="name">${c.name}</div><div class="desc">${c.desc}</div></div>
            <div class="roles">${c.wolves.map(r => ROLES[r].icon).join('')}|${c.gods.map(r => ROLES[r].icon).join('')}</div>
        </div>
    `).join('');
    if (!selectedConfig && configs.length) selectConfig(configs[0].id);
}

function selectConfig(id) {
    selectedConfig = (GAME_CONFIGS[selectedPlayerCount] || []).find(c => c.id === id);
    renderConfigOptions();
}

// ===== Game =====
function startGame() {
    if (!selectedConfig) return alert('请选择板子');
    hasSheriff = document.getElementById('sheriffToggle').checked;
    const total = selectedConfig.wolves.length + selectedConfig.gods.length + selectedConfig.villagers;
    players = Array.from({ length: total }, (_, i) => ({
        id: i + 1, role: 'unknown', camp: 'unknown', alive: true, sheriff: false, note: ''
    }));
    showGame();
    renderPlayers();
    updateStats();
    saveGameState();
}

function showGame() {
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('historySection').style.display = 'none';
    const total = selectedConfig.wolves.length + selectedConfig.gods.length + selectedConfig.villagers;
    document.getElementById('currentConfigInfo').innerHTML = `
        <span class="badge">${total}人 ${selectedConfig.name}</span>
        ${hasSheriff ? '<span class="sheriff">👮</span>' : ''}
    `;
    renderPlayers();
}

function showSetup() {
    document.getElementById('setupPanel').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
}

// ===== History =====
function showHistory() {
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';
    renderHistory();
}

function hideHistory() {
    document.getElementById('historySection').style.display = 'none';
    if (players.length > 0 && selectedConfig) {
        showGame();
    } else {
        showSetup();
    }
}

function saveToHistory() {
    if (!selectedConfig || players.length === 0) return;

    const game = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        config: selectedConfig.name,
        playerCount: players.length,
        hasSheriff: hasSheriff,
        players: JSON.parse(JSON.stringify(players)),
        notes: document.getElementById('gameNotes')?.value || '',
        wolves: players.filter(p => p.camp === 'wolf').length,
        good: players.filter(p => p.camp === 'good').length,
        alive: players.filter(p => p.alive).length
    };

    gameHistory.unshift(game);
    if (gameHistory.length > 20) gameHistory.pop(); // 最多保存20局

    localStorage.setItem('werewolfHistory', JSON.stringify(gameHistory));
    alert('✅ 已保存到历史记录！');
}

function loadHistory() {
    try {
        gameHistory = JSON.parse(localStorage.getItem('werewolfHistory') || '[]');
    } catch (e) {
        gameHistory = [];
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (gameHistory.length === 0) {
        list.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }

    list.innerHTML = gameHistory.map(g => `
        <div class="history-item" onclick="viewHistoryGame(${g.id})">
            <div class="history-item-header">
                <span class="history-config">${g.playerCount}人 ${g.config}</span>
                <span class="history-date">${g.date}</span>
            </div>
            <div class="history-item-stats">
                <span>💚${g.alive}存活</span>
                <span>🐺${g.wolves}狼</span>
                <span>😇${g.good}好人</span>
            </div>
            <button class="history-delete" onclick="event.stopPropagation(); deleteHistory(${g.id})">🗑️</button>
        </div>
    `).join('');
}

function viewHistoryGame(id) {
    const game = gameHistory.find(g => g.id === id);
    if (!game) return;

    // Find the config
    for (const count in GAME_CONFIGS) {
        const cfg = GAME_CONFIGS[count].find(c => c.name === game.config);
        if (cfg) {
            selectedConfig = cfg;
            selectedPlayerCount = parseInt(count);
            break;
        }
    }

    players = game.players;
    hasSheriff = game.hasSheriff;
    document.getElementById('gameNotes').value = game.notes || '';

    showGame();
    renderPlayers();
    updateStats();
}

function deleteHistory(id) {
    if (!confirm('删除这条记录？')) return;
    gameHistory = gameHistory.filter(g => g.id !== id);
    localStorage.setItem('werewolfHistory', JSON.stringify(gameHistory));
    renderHistory();
}

// ===== Players =====
function renderPlayers() {
    const roles = getAvailableRoles();
    document.getElementById('playersList').innerHTML = players.map(p => `
        <div class="player-row ${p.alive ? '' : 'dead'}" data-id="${p.id}">
            <div class="player-num">
                <span class="num">${p.id}</span>
                ${hasSheriff ? `<button class="sheriff-btn ${p.sheriff ? 'active' : ''}" onclick="toggleSheriff(${p.id})">👮</button>` : ''}
            </div>
            <select class="role-select" onchange="setRole(${p.id}, this.value)">
                ${roles.map(r => `<option value="${r}" ${p.role === r ? 'selected' : ''}>${ROLES[r].icon}${ROLES[r].short}</option>`).join('')}
            </select>
            <div class="camp-btns">
                <button class="camp-btn ${p.camp === 'good' ? 'active good' : ''}" onclick="setCamp(${p.id},'good')">😇</button>
                <button class="camp-btn ${p.camp === 'unknown' ? 'active' : ''}" onclick="setCamp(${p.id},'unknown')">❓</button>
                <button class="camp-btn ${p.camp === 'wolf' ? 'active wolf' : ''}" onclick="setCamp(${p.id},'wolf')">🐺</button>
            </div>
            <input type="text" class="note-input" value="${escapeHtml(p.note)}" placeholder="备注" onchange="setNote(${p.id}, this.value)">
            <button class="status-btn ${p.alive ? 'alive' : 'dead'}" onclick="toggleStatus(${p.id})">${p.alive ? '💚' : '💀'}</button>
        </div>
    `).join('');
}

function getAvailableRoles() {
    if (!selectedConfig) return ['unknown'];
    const set = new Set(['unknown', ...selectedConfig.wolves, ...selectedConfig.gods, 'villager']);
    return [...set];
}

function setRole(id, role) {
    const p = players.find(x => x.id === id);
    if (p) {
        p.role = role;
        const camp = ROLES[role]?.camp;
        if (camp === 'wolf') p.camp = 'wolf';
        else if (camp === 'god' || role === 'villager') p.camp = 'good';
        renderPlayers();
        updateStats();
        saveGameState();
    }
}

function setCamp(id, camp) {
    const p = players.find(x => x.id === id);
    if (p) { p.camp = camp; renderPlayers(); updateStats(); saveGameState(); }
}

function setNote(id, note) {
    const p = players.find(x => x.id === id);
    if (p) { p.note = note; saveGameState(); }
}

function toggleStatus(id) {
    const p = players.find(x => x.id === id);
    if (p) { p.alive = !p.alive; renderPlayers(); updateStats(); saveGameState(); }
}

function toggleSheriff(id) {
    players.forEach(p => p.sheriff = false);
    const p = players.find(x => x.id === id);
    if (p) { p.sheriff = true; renderPlayers(); saveGameState(); }
}

function updateStats() {
    const alive = players.filter(p => p.alive).length;
    const dead = players.filter(p => !p.alive).length;
    const wolves = players.filter(p => p.camp === 'wolf').length;
    const good = players.filter(p => p.camp === 'good').length;
    document.getElementById('aliveCount').textContent = alive;
    document.getElementById('deadCount').textContent = dead;
    document.getElementById('wolfCount').textContent = wolves;
    document.getElementById('goodCount').textContent = good;
}

function resetGame() {
    if (confirm('重置当前游戏？')) {
        players = [];
        selectedConfig = null;
        document.getElementById('gameNotes').value = '';
        localStorage.removeItem('werewolfGameState');
        showSetup();
        renderConfigOptions();
    }
}

// ===== Persistence =====
function saveGameState() {
    localStorage.setItem('werewolfGameState', JSON.stringify({
        players,
        notes: document.getElementById('gameNotes')?.value || '',
        selectedPlayerCount,
        selectedConfigId: selectedConfig?.id,
        hasSheriff
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('werewolfGameState');
    if (saved) {
        try {
            const s = JSON.parse(saved);
            players = s.players || [];
            selectedPlayerCount = s.selectedPlayerCount || 12;
            hasSheriff = s.hasSheriff !== false;
            document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', parseInt(t.dataset.count) === selectedPlayerCount));
            if (s.selectedConfigId) selectedConfig = (GAME_CONFIGS[selectedPlayerCount] || []).find(c => c.id === s.selectedConfigId);
            const toggle = document.getElementById('sheriffToggle');
            if (toggle) toggle.checked = hasSheriff;
            const notes = document.getElementById('gameNotes');
            if (notes) notes.value = s.notes || '';
            renderConfigOptions();
        } catch (e) { console.error(e); }
    }
}

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
}

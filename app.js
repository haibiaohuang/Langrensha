// ===== Supabase Config =====
var SUPABASE_URL = 'https://amdgywyzyvfcoziefcgy.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZGd5d3l6eXZmY296aWVmY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzcxNzcsImV4cCI6MjA4NjE1MzE3N30.QvsqZjCW8KUzzwKDAEF2Fb8IYCRUTbUtZR69VOkqO04';

var supabaseClient = null;
var currentUser = null;

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

// ===== State =====
let players = [];
let selectedPlayerCount = 12;
let selectedConfig = null;
let hasSheriff = true;
let gameHistory = [];
let authMode = 'login';
let currentRound = 1;
let currentPhase = 'night';
let gameEvents = [];
let undoStack = [];
let deathPickerTarget = null;
let revealTarget = null;
let undoTimeout = null;

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');

    try {
        loadGameState();
        loadLocalHistory();
        setupEventListeners();
        renderConfigOptions();
        if (players.length > 0 && selectedConfig) {
            showGame();
        }
        console.log('Local init done');
    } catch (e) {
        console.error('Local init error:', e);
        showToast('本地初始化失败: ' + e.message, 'error');
    }

    try {
        if (!window.supabase) {
            console.warn('Supabase SDK missing, running in offline mode');
        } else {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized');

            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) console.error('Session error:', error);

            if (session) {
                console.log('User already logged in:', session.user.email);
                currentUser = session.user;
                updateAuthUI();
                await loadCloudHistory();
            }

            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state change:', event, session?.user?.email);
                currentUser = session?.user || null;
                updateAuthUI();
                if (currentUser) {
                    await loadCloudHistory();
                }
            });
        }
    } catch (e) {
        console.error('Supabase init error:', e);
    }
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

// ===== Toast System =====
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 2500;
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () {
        toast.classList.add('toast-show');
    });
    setTimeout(function () {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        toast.addEventListener('animationend', function () {
            toast.remove();
        });
    }, duration);
}

// ===== Confirm Dialog =====
function showConfirm(message, onConfirm) {
    var overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmMessage').textContent = message;
    overlay.classList.add('overlay-active');
    window._confirmCallback = onConfirm;
}

function handleConfirmYes() {
    var overlay = document.getElementById('confirmOverlay');
    overlay.classList.remove('overlay-active');
    if (window._confirmCallback) {
        window._confirmCallback();
        window._confirmCallback = null;
    }
}

function handleConfirmNo() {
    var overlay = document.getElementById('confirmOverlay');
    overlay.classList.remove('overlay-active');
    window._confirmCallback = null;
}

// ===== View Switching =====
function switchView(targetId) {
    var panels = ['authPanel', 'setupPanel', 'gameSection', 'historySection'];
    panels.forEach(function (id) {
        var el = document.getElementById(id);
        if (id === targetId) {
            el.classList.add('view-active');
        } else {
            el.classList.remove('view-active');
        }
    });
}

// ===== Auth Functions =====
function showAuth() {
    switchView('authPanel');
}

function hideAuth() {
    if (players.length > 0 && selectedConfig) {
        showGame();
    } else {
        showSetup();
    }
}

function switchAuthTab(mode) {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab:${mode === 'login' ? 'first-child' : 'last-child'}`).classList.add('active');
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? '登录' : '注册';
}

async function handleAuth(e) {
    e.preventDefault();
    console.log('Auth form submitted', authMode);

    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const btn = document.getElementById('authSubmitBtn');

    if (!email || !password) {
        showToast('请输入邮箱和密码', 'warning');
        return;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '处理中...';

    try {
        if (!supabaseClient) throw new Error('Supabase 未连接');

        let result;
        if (authMode === 'login') {
            console.log('Attempting login for:', email);
            result = await supabaseClient.auth.signInWithPassword({ email, password });
        } else {
            console.log('Attempting signup for:', email);
            result = await supabaseClient.auth.signUp({ email, password });
        }

        console.log('Auth result:', result);

        if (result.error) throw result.error;

        if (authMode === 'register' && !result.data.session) {
            showToast('注册验证邮件已发送，请查看邮箱', 'success', 4000);
        } else {
            console.log('Auth successful');
            hideAuth();
            showToast(authMode === 'login' ? '登录成功' : '注册成功', 'success');
        }
    } catch (err) {
        console.error('Auth error:', err);
        showToast('操作失败: ' + (err.message || err.error_description || '未知错误'), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function signInWithGoogle() {
    try {
        if (!supabaseClient) throw new Error('Supabase 未连接');
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
    } catch (err) {
        showToast('Google登录失败: ' + err.message, 'error');
    }
}

async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateAuthUI();
    gameHistory = [];
    loadLocalHistory();
    renderHistory();
}

function updateAuthUI() {
    var authBtn = document.getElementById('authBtn');
    var userInfo = document.getElementById('userInfo');
    var userName = document.getElementById('userName');

    if (currentUser) {
        authBtn.style.display = 'none';
        userInfo.classList.add('visible');
        userName.textContent = currentUser.email?.split('@')[0] || '用户';
    } else {
        authBtn.style.display = 'block';
        userInfo.classList.remove('visible');
    }
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
    if (!selectedConfig) {
        showToast('请选择板子', 'warning');
        return;
    }
    hasSheriff = document.getElementById('sheriffToggle').checked;
    const total = selectedConfig.wolves.length + selectedConfig.gods.length + selectedConfig.villagers;
    players = Array.from({ length: total }, (_, i) => ({
        id: i + 1, role: 'unknown', camp: 'unknown', alive: true, sheriff: false, note: '',
        deathReason: null, deathRound: null, deathPhase: null, confirmed: false
    }));
    currentRound = 1;
    currentPhase = 'night';
    gameEvents = [];
    undoStack = [];
    showGame();
    renderPlayers();
    updateStats();
    saveGameState();
}

function showGame() {
    switchView('gameSection');
    const total = selectedConfig.wolves.length + selectedConfig.gods.length + selectedConfig.villagers;
    document.getElementById('currentConfigInfo').innerHTML = `
        <span class="badge">${total}人 ${selectedConfig.name}</span>
        ${hasSheriff ? '<span class="sheriff">👮</span>' : ''}
    `;
    renderPlayers();
    updateRoundDisplay();
}

function showSetup() {
    switchView('setupPanel');
}

// ===== Round Tracker =====
function updateRoundDisplay() {
    var display = document.getElementById('roundDisplay');
    var tracker = document.getElementById('roundTracker');
    if (!display || !tracker) return;
    var phaseText = currentPhase === 'night' ? '夜' : '天';
    display.textContent = '第' + currentRound + phaseText;
    tracker.className = 'round-tracker ' + (currentPhase === 'night' ? 'night' : 'day');
}

function nextPhase() {
    if (currentPhase === 'night') {
        currentPhase = 'day';
    } else {
        currentPhase = 'night';
        currentRound++;
    }
    updateRoundDisplay();
    logGameEvent({ type: 'phase_change', round: currentRound, phase: currentPhase });
    saveGameState();
}

function prevPhase() {
    if (currentPhase === 'day') {
        currentPhase = 'night';
    } else if (currentRound > 1) {
        currentRound--;
        currentPhase = 'day';
    }
    updateRoundDisplay();
    saveGameState();
}

function logGameEvent(event) {
    event.timestamp = Date.now();
    gameEvents.push(event);
}

// ===== Death Reason =====
function showDeathReasonPicker(playerId) {
    deathPickerTarget = playerId;
    document.getElementById('deathPickerOverlay').classList.add('overlay-active');
}

function cancelDeathPicker() {
    deathPickerTarget = null;
    document.getElementById('deathPickerOverlay').classList.remove('overlay-active');
}

function confirmDeath(reason) {
    var p = players.find(function (x) { return x.id === deathPickerTarget; });
    if (!p) return;

    pushUndo(p.id + '号 标记死亡');
    p.alive = false;
    p.deathReason = reason;
    p.deathRound = currentRound;
    p.deathPhase = currentPhase;

    logGameEvent({
        type: 'death',
        playerId: p.id,
        reason: reason,
        round: currentRound,
        phase: currentPhase
    });

    document.getElementById('deathPickerOverlay').classList.remove('overlay-active');
    deathPickerTarget = null;

    renderPlayers();
    updateStats();
    saveGameState();
    showToast(p.id + '号 ' + getDeathReasonLabel(reason), 'info');
}

function getDeathReasonLabel(reason) {
    var labels = {
        'vote': '🗳️ 投票出局',
        'wolf_kill': '🐺 狼刀',
        'witch_poison': '🧙‍♀️ 女巫毒杀',
        'hunter_shot': '🏹 猎人带走',
        'white_wolf_boom': '👑 白狼王自爆',
        'other': '❓ 其他'
    };
    return labels[reason] || reason;
}

// ===== Game Result =====
function confirmSaveWithResult() {
    if (!selectedConfig || players.length === 0) return;
    document.getElementById('resultPickerOverlay').classList.add('overlay-active');
}

function saveWithResult(result) {
    document.getElementById('resultPickerOverlay').classList.remove('overlay-active');
    saveToHistory(result);
}

function cancelResultPicker() {
    document.getElementById('resultPickerOverlay').classList.remove('overlay-active');
}

// ===== Undo System =====
function pushUndo(description) {
    undoStack.push({
        players: JSON.parse(JSON.stringify(players)),
        currentRound: currentRound,
        currentPhase: currentPhase,
        description: description
    });
    if (undoStack.length > 10) undoStack.shift();
    showUndoButton();
}

function showUndoButton() {
    var btn = document.getElementById('undoBtn');
    btn.classList.add('undo-visible');
    clearTimeout(undoTimeout);
    undoTimeout = setTimeout(function () {
        btn.classList.remove('undo-visible');
    }, 3000);
}

function performUndo() {
    if (undoStack.length === 0) return;
    var state = undoStack.pop();
    players = state.players;
    currentRound = state.currentRound;
    currentPhase = state.currentPhase;
    renderPlayers();
    updateStats();
    updateRoundDisplay();
    saveGameState();
    showToast('已撤销: ' + state.description, 'info');

    if (undoStack.length === 0) {
        document.getElementById('undoBtn').classList.remove('undo-visible');
    }
}

// ===== Quick Reveal =====
function openQuickReveal() {
    document.getElementById('quickRevealOverlay').classList.add('overlay-active');
    renderRevealGrid();
}

function closeQuickReveal() {
    document.getElementById('quickRevealOverlay').classList.remove('overlay-active');
    renderPlayers();
    updateStats();
    saveGameState();
}

function renderRevealGrid() {
    var grid = document.getElementById('revealGrid');
    grid.innerHTML = players.map(function (p) {
        var campClass = p.camp === 'wolf' ? 'reveal-wolf' : p.camp === 'god' ? 'reveal-god' : p.camp === 'villager' ? 'reveal-villager' : '';
        var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
        return '<div class="reveal-card ' + campClass + '" onclick="revealTapPlayer(' + p.id + ')">' +
            '<span class="reveal-num">' + p.id + '</span>' +
            '<span class="reveal-role">' + (roleInfo ? roleInfo.icon : '❓') + '</span>' +
            (roleInfo ? '<span class="reveal-name">' + roleInfo.short + '</span>' : '') +
            '</div>';
    }).join('');
}

function revealTapPlayer(playerId) {
    revealTarget = playerId;
    var roles = getAvailableRoles();
    document.getElementById('revealRoles').innerHTML = roles.map(function (r) {
        return '<button class="reveal-role-btn" onclick="revealSetRole(' + playerId + ', \'' + r + '\')">' +
            ROLES[r].icon + ' ' + ROLES[r].name + '</button>';
    }).join('');
    document.getElementById('revealRolePicker').classList.add('overlay-active');
}

function revealSetRole(playerId, role) {
    var p = players.find(function (x) { return x.id === playerId; });
    if (p) {
        p.role = role;
        var camp = ROLES[role]?.camp;
        if (camp === 'wolf') p.camp = 'wolf';
        else if (camp === 'god') p.camp = 'god';
        else if (camp === 'villager') p.camp = 'villager';
    }
    closeRevealRolePicker();
    renderRevealGrid();
}

function closeRevealRolePicker() {
    document.getElementById('revealRolePicker').classList.remove('overlay-active');
    revealTarget = null;
}

// ===== Flash Animation =====
function flashPlayerCard(playerId, camp) {
    var card = document.querySelector('.player-card[data-id="' + playerId + '"]');
    if (!card) return;
    var flashClass = camp === 'wolf' ? 'flash-wolf' : camp === 'god' ? 'flash-god' : camp === 'villager' ? 'flash-villager' : 'flash-default';
    card.classList.add(flashClass);
    setTimeout(function () { card.classList.remove(flashClass); }, 600);
}

// ===== Players =====
function renderPlayers() {
    var roles = getAvailableRoles();
    document.getElementById('playersList').innerHTML = players.map(function (p) {
        var deathInfo = '';
        if (!p.alive && p.deathReason) {
            deathInfo = '<span class="death-tag">' + getDeathReasonLabel(p.deathReason) + '</span>';
            if (p.deathRound) {
                deathInfo += '<span class="death-round-tag">第' + p.deathRound + (p.deathPhase === 'night' ? '夜' : '天') + '</span>';
            }
        }

        var roleOptions = roles.map(function (r) {
            return '<option value="' + r + '"' + (p.role === r ? ' selected' : '') + '>' + ROLES[r].icon + ROLES[r].short + '</option>';
        }).join('');

        var confirmedClass = p.confirmed ? ' confirmed' : '';
        var campCardClass = p.camp !== 'unknown' ? ' camp-' + p.camp : '';
        var confirmBtnClass = 'id-confirm-btn' + (p.confirmed ? ' active' : '') + (p.confirmed && p.camp !== 'unknown' ? ' ' + p.camp : '');

        return '<div class="player-card ' + (p.alive ? '' : 'dead') + confirmedClass + campCardClass + '" data-id="' + p.id + '">' +
            '<div class="card-row-top">' +
                '<div class="player-num">' +
                    '<span class="num">' + p.id + '</span>' +
                    (hasSheriff ? '<button class="sheriff-btn ' + (p.sheriff ? 'active' : '') + '" onclick="toggleSheriff(' + p.id + ')">👮</button>' : '') +
                '</div>' +
                '<button class="' + confirmBtnClass + '" onclick="toggleConfirmed(' + p.id + ')">✓</button>' +
                '<select class="role-select" onchange="setRole(' + p.id + ', this.value)">' + roleOptions + '</select>' +
                '<div class="camp-btns">' +
                    '<button class="camp-btn ' + (p.camp === 'god' ? 'active god' : '') + '" onclick="setCamp(' + p.id + ',\'god\')">🔮</button>' +
                    '<button class="camp-btn ' + (p.camp === 'villager' ? 'active villager' : '') + '" onclick="setCamp(' + p.id + ',\'villager\')">👨‍🌾</button>' +
                    '<button class="camp-btn ' + (p.camp === 'unknown' ? 'active' : '') + '" onclick="setCamp(' + p.id + ',\'unknown\')">❓</button>' +
                    '<button class="camp-btn ' + (p.camp === 'wolf' ? 'active wolf' : '') + '" onclick="setCamp(' + p.id + ',\'wolf\')">🐺</button>' +
                '</div>' +
                '<button class="status-btn ' + (p.alive ? 'alive' : 'dead') + '" onclick="toggleStatus(' + p.id + ')">' + (p.alive ? '💚' : '💀') + '</button>' +
            '</div>' +
            '<div class="card-row-bottom">' +
                deathInfo +
                '<input type="text" class="note-input" value="' + escapeHtml(p.note) + '" placeholder="备注" onchange="setNote(' + p.id + ', this.value)">' +
            '</div>' +
        '</div>';
    }).join('');
}

function getAvailableRoles() {
    if (!selectedConfig) return ['unknown'];
    const set = new Set(['unknown', ...selectedConfig.wolves, ...selectedConfig.gods, 'villager']);
    return [...set];
}

function setRole(id, role) {
    var p = players.find(function (x) { return x.id === id; });
    if (p) {
        pushUndo(p.id + '号 角色改为 ' + ROLES[role].name);
        p.role = role;
        var camp = ROLES[role]?.camp;
        if (camp === 'wolf') p.camp = 'wolf';
        else if (camp === 'god') p.camp = 'god';
        else if (camp === 'villager') p.camp = 'villager';
        renderPlayers();
        updateStats();
        saveGameState();
        flashPlayerCard(id, p.camp);
    }
}

function setCamp(id, camp) {
    var p = players.find(function (x) { return x.id === id; });
    if (p) {
        pushUndo(p.id + '号 阵营改为 ' + (camp === 'wolf' ? '狼人' : camp === 'god' ? '神' : camp === 'villager' ? '民' : '未知'));
        p.camp = camp;
        renderPlayers();
        updateStats();
        saveGameState();
        flashPlayerCard(id, camp);
    }
}

function setNote(id, note) {
    var p = players.find(function (x) { return x.id === id; });
    if (p) { p.note = note; saveGameState(); }
}

function toggleStatus(id) {
    var p = players.find(function (x) { return x.id === id; });
    if (!p) return;
    if (p.alive) {
        showDeathReasonPicker(id);
    } else {
        pushUndo(p.id + '号 复活');
        p.alive = true;
        p.deathReason = null;
        p.deathRound = null;
        p.deathPhase = null;
        renderPlayers();
        updateStats();
        saveGameState();
        showToast(p.id + '号 已复活', 'success');
    }
}

function toggleSheriff(id) {
    pushUndo(id + '号 设为警长');
    players.forEach(function (p) { p.sheriff = false; });
    var p = players.find(function (x) { return x.id === id; });
    if (p) { p.sheriff = true; renderPlayers(); saveGameState(); }
}

function toggleConfirmed(id) {
    var p = players.find(function (x) { return x.id === id; });
    if (!p) return;
    pushUndo(p.id + '号 ' + (p.confirmed ? '取消确认' : '确认身份'));
    p.confirmed = !p.confirmed;
    renderPlayers();
    saveGameState();
}

function updateStats() {
    var alive = players.filter(function (p) { return p.alive; }).length;
    var dead = players.filter(function (p) { return !p.alive; }).length;
    var wolves = players.filter(function (p) { return p.camp === 'wolf'; }).length;
    var gods = players.filter(function (p) { return p.camp === 'god'; }).length;
    var villagers = players.filter(function (p) { return p.camp === 'villager'; }).length;
    document.getElementById('aliveCount').textContent = alive;
    document.getElementById('deadCount').textContent = dead;
    document.getElementById('wolfCount').textContent = wolves;
    document.getElementById('godCount').textContent = gods;
    document.getElementById('villagerCount').textContent = villagers;
}

function resetGame() {
    showConfirm('重置当前游戏？', function () {
        players = [];
        selectedConfig = null;
        currentRound = 1;
        currentPhase = 'night';
        gameEvents = [];
        undoStack = [];
        document.getElementById('gameNotes').value = '';
        localStorage.removeItem('werewolfGameState');
        showSetup();
        renderConfigOptions();
        showToast('游戏已重置', 'info');
    });
}

// ===== History =====
function showHistory() {
    switchView('historySection');
    var syncStatus = document.getElementById('syncStatus');
    if (currentUser) {
        syncStatus.innerHTML = '<span class="synced">☁️ 已登录: ' + (currentUser.email?.split('@')[0]) + ' - 数据云端同步</span>';
    } else {
        syncStatus.innerHTML = '<span class="local">📱 未登录 - 数据仅保存在本地</span>';
    }
    renderHistory();
}

function hideHistory() {
    if (players.length > 0 && selectedConfig) {
        showGame();
    } else {
        showSetup();
    }
}

async function saveToHistory(result) {
    if (!selectedConfig || players.length === 0) return;

    var game = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        config_name: selectedConfig.name,
        player_count: players.length,
        has_sheriff: hasSheriff,
        players: JSON.parse(JSON.stringify(players)),
        notes: document.getElementById('gameNotes')?.value || '',
        wolves: players.filter(function (p) { return p.camp === 'wolf'; }).length,
        good: players.filter(function (p) { return p.camp === 'god' || p.camp === 'villager'; }).length,
        alive: players.filter(function (p) { return p.alive; }).length,
        result: result || null,
        game_events: gameEvents.slice()
    };

    if (currentUser && supabaseClient) {
        try {
            var insertData = {
                user_id: currentUser.id,
                config_name: game.config_name,
                player_count: game.player_count,
                has_sheriff: game.has_sheriff,
                players: game.players,
                notes: game.notes,
                wolves: game.wolves,
                good: game.good,
                alive: game.alive,
                result: game.result,
                game_events: game.game_events
            };
            var resp = await supabaseClient.from('game_history').insert(insertData);
            if (resp.error) throw resp.error;
            await loadCloudHistory();
            showToast('已保存到云端', 'success');
        } catch (err) {
            console.error('Cloud save error:', err);
            saveLocalHistory(game);
            showToast('云端保存失败，已保存到本地', 'warning');
        }
    } else {
        saveLocalHistory(game);
        showToast('已保存到本地', 'success');
    }
}

function saveLocalHistory(game) {
    gameHistory.unshift(game);
    if (gameHistory.length > 20) gameHistory.pop();
    localStorage.setItem('werewolfHistory', JSON.stringify(gameHistory));
    renderHistory();
}

function loadLocalHistory() {
    try {
        gameHistory = JSON.parse(localStorage.getItem('werewolfHistory') || '[]');
    } catch (e) {
        gameHistory = [];
    }
}

async function loadCloudHistory() {
    if (!currentUser || !supabaseClient) return;

    try {
        var resp = await supabaseClient
            .from('game_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (resp.error) throw resp.error;

        gameHistory = (resp.data || []).map(function (g) {
            return {
                id: g.id,
                date: new Date(g.created_at).toLocaleString('zh-CN'),
                config_name: g.config_name,
                player_count: g.player_count,
                has_sheriff: g.has_sheriff,
                players: g.players,
                notes: g.notes,
                wolves: g.wolves,
                good: g.good,
                alive: g.alive,
                result: g.result || null,
                game_events: g.game_events || [],
                isCloud: true
            };
        });

        renderHistory();
    } catch (err) {
        console.error('Cloud load error:', err);
    }
}

function renderHistory() {
    var list = document.getElementById('historyList');
    if (gameHistory.length === 0) {
        list.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }

    var resultLabels = {
        'good_win': { text: '😇 好人胜', cls: 'result-good' },
        'wolf_win': { text: '🐺 狼人胜', cls: 'result-wolf' },
        'draw': { text: '🤝 平局', cls: 'result-draw' }
    };

    list.innerHTML = gameHistory.map(function (g) {
        var resultInfo = g.result && resultLabels[g.result]
            ? '<span class="result-tag ' + resultLabels[g.result].cls + '">' + resultLabels[g.result].text + '</span>'
            : '';
        return '<div class="history-item" onclick="viewHistoryGame(\'' + g.id + '\')">' +
            '<div class="history-item-header">' +
                '<span class="history-config">' + g.player_count + '人 ' + g.config_name + ' ' + (g.isCloud ? '☁️' : '📱') + '</span>' +
                '<span class="history-date">' + g.date + '</span>' +
            '</div>' +
            '<div class="history-item-stats">' +
                '<span>💚' + g.alive + '存活</span>' +
                '<span>🐺' + g.wolves + '狼</span>' +
                '<span>😇' + g.good + '好人</span>' +
                resultInfo +
            '</div>' +
            '<button class="history-delete" onclick="event.stopPropagation(); deleteHistory(\'' + g.id + '\', ' + (g.isCloud || false) + ')">🗑️</button>' +
        '</div>';
    }).join('');
}

async function viewHistoryGame(id) {
    var game = gameHistory.find(function (g) { return String(g.id) === String(id); });
    if (!game) return;

    for (var count in GAME_CONFIGS) {
        var cfg = GAME_CONFIGS[count].find(function (c) { return c.name === game.config_name; });
        if (cfg) {
            selectedConfig = cfg;
            selectedPlayerCount = parseInt(count);
            break;
        }
    }

    players = game.players.map(function (p) {
        if (p.confirmed === undefined) p.confirmed = false;
        if (p.camp === 'good') p.camp = 'god';
        return p;
    });
    hasSheriff = game.has_sheriff;
    gameEvents = game.game_events || [];
    undoStack = [];

    // Restore round state from events or defaults
    currentRound = 1;
    currentPhase = 'night';
    if (gameEvents.length > 0) {
        var lastPhaseEvt = null;
        for (var i = gameEvents.length - 1; i >= 0; i--) {
            if (gameEvents[i].type === 'phase_change') {
                lastPhaseEvt = gameEvents[i];
                break;
            }
        }
        if (lastPhaseEvt) {
            currentRound = lastPhaseEvt.round;
            currentPhase = lastPhaseEvt.phase;
        }
    }

    document.getElementById('gameNotes').value = game.notes || '';
    showGame();
    renderPlayers();
    updateStats();
}

async function deleteHistory(id, isCloud) {
    showConfirm('删除这条记录？', async function () {
        if (isCloud && currentUser && supabaseClient) {
            try {
                await supabaseClient.from('game_history').delete().eq('id', id);
                await loadCloudHistory();
                showToast('已删除云端记录', 'success');
            } catch (err) {
                console.error('Delete error:', err);
                showToast('删除失败', 'error');
            }
        } else {
            gameHistory = gameHistory.filter(function (g) { return String(g.id) !== String(id); });
            localStorage.setItem('werewolfHistory', JSON.stringify(gameHistory));
            renderHistory();
            showToast('已删除本地记录', 'success');
        }
    });
}

// ===== Persistence =====
function saveGameState() {
    localStorage.setItem('werewolfGameState', JSON.stringify({
        players: players,
        notes: document.getElementById('gameNotes')?.value || '',
        selectedPlayerCount: selectedPlayerCount,
        selectedConfigId: selectedConfig?.id,
        hasSheriff: hasSheriff,
        currentRound: currentRound,
        currentPhase: currentPhase,
        gameEvents: gameEvents
    }));
}

function loadGameState() {
    var saved = localStorage.getItem('werewolfGameState');
    if (saved) {
        try {
            var s = JSON.parse(saved);
            players = (s.players || []).map(function (p) {
                if (p.confirmed === undefined) p.confirmed = false;
                if (p.camp === 'good') p.camp = 'god';
                return p;
            });
            selectedPlayerCount = s.selectedPlayerCount || 12;
            hasSheriff = s.hasSheriff !== false;
            currentRound = s.currentRound || 1;
            currentPhase = s.currentPhase || 'night';
            gameEvents = s.gameEvents || [];
            document.querySelectorAll('.tab').forEach(function (t) {
                t.classList.toggle('active', parseInt(t.dataset.count) === selectedPlayerCount);
            });
            if (s.selectedConfigId) selectedConfig = (GAME_CONFIGS[selectedPlayerCount] || []).find(function (c) { return c.id === s.selectedConfigId; });
            var toggle = document.getElementById('sheriffToggle');
            if (toggle) toggle.checked = hasSheriff;
            var notes = document.getElementById('gameNotes');
            if (notes) notes.value = s.notes || '';
            renderConfigOptions();
        } catch (e) { console.error(e); }
    }
}

// ===== Utilities =====
function debounce(fn, ms) {
    var t;
    return function () {
        var a = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(null, a); }, ms);
    };
}

function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
}

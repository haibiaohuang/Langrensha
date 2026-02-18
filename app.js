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
    ],
    14: [
        { id: '14_standard', name: '标准局', desc: '4狼4神6民', wolves: ['wolf', 'wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 6 },
        { id: '14_wolf_beauty', name: '狼美人局', desc: '3狼1美人 4神6民', wolves: ['wolf', 'wolf', 'wolf', 'wolf_beauty'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 6 },
        { id: '14_white_wolf', name: '白狼王局', desc: '3狼1白狼 4神6民', wolves: ['wolf', 'wolf', 'wolf', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 6 },
        { id: '14_double', name: '双狼局', desc: '2狼1美人1白狼 4神6民', wolves: ['wolf', 'wolf', 'wolf_beauty', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 6 },
        { id: '14_five_gods', name: '五神局', desc: '4狼5神5民', wolves: ['wolf', 'wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter', 'guard', 'idiot'], villagers: 5 }
    ],
    16: [
        { id: '16_standard', name: '标准局', desc: '4狼4神8民', wolves: ['wolf', 'wolf', 'wolf', 'wolf'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 8 },
        { id: '16_wolf_beauty', name: '狼美人局', desc: '3狼1美人 4神8民', wolves: ['wolf', 'wolf', 'wolf', 'wolf_beauty'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 8 },
        { id: '16_white_wolf', name: '白狼王局', desc: '3狼1白狼 4神8民', wolves: ['wolf', 'wolf', 'wolf', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 8 },
        { id: '16_double', name: '双狼局', desc: '2狼1美人1白狼 4神8民', wolves: ['wolf', 'wolf', 'wolf_beauty', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard'], villagers: 8 },
        { id: '16_five_wolves', name: '五狼局', desc: '5狼5神6民', wolves: ['wolf', 'wolf', 'wolf', 'wolf', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard', 'idiot'], villagers: 6 },
        { id: '16_chaos', name: '混战局', desc: '3狼1美人1白狼 5神6民', wolves: ['wolf', 'wolf', 'wolf', 'wolf_beauty', 'white_wolf_king'], gods: ['seer', 'witch', 'hunter', 'guard', 'idiot'], villagers: 6 }
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

const DEATH_REASONS = {
    'vote': { icon: '🗳️', label: '投票出局', short: '🗳️投票' },
    'wolf_kill': { icon: '🐺', label: '狼刀', short: '🐺狼刀' },
    'witch_poison': { icon: '🧙‍♀️', label: '女巫毒杀', short: '🧙‍♀️毒杀' },
    'hunter_shot': { icon: '🏹', label: '猎人带走', short: '🏹猎人' },
    'white_wolf_boom': { icon: '👑', label: '白狼王自爆', short: '👑自爆' },
    'other': { icon: '❓', label: '其他', short: '❓其他' }
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

// ===== Judge Mode State =====
let isJudgeMode = false;
let judgeSteps = [];
let judgeStepIndex = 0;
let judgeRoundData = {};
let judgeAllRounds = [];
let judgeVoiceEnabled = true;
let witchSaveUsed = false;
let witchPoisonUsed = false;
let lastGuardTarget = null;
let judgePhase = 'night'; // 'night' or 'day'
let judgeSelectedPlayer = null;
let judgeDawnDeaths = [];

// ===== Judge Timer State =====
let judgeTimerInterval = null;
let judgeTimerSeconds = 0;
let judgeTimerRunning = false;
let judgeTimerDuration = 120; // default 2 minutes

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');

    try {
        // Preload speech voices
        if (window.speechSynthesis) {
            try { speechSynthesis.getVoices(); } catch (e) {}
        }

        applyTheme(localStorage.getItem('werewolfTheme') || 'dark');
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
            selectedConfig = null;
            renderConfigOptions();
        });
    });
    document.getElementById('gameNotes')?.addEventListener('input', debounce(saveGameState, 500));
    document.getElementById('sheriffToggle')?.addEventListener('change', e => hasSheriff = e.target.checked);
    document.getElementById('judgeModeToggle')?.addEventListener('change', e => isJudgeMode = e.target.checked);
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
    isJudgeMode = document.getElementById('judgeModeToggle').checked;
    judgeAllRounds = [];
    witchSaveUsed = false;
    witchPoisonUsed = false;
    lastGuardTarget = null;
    showGame();
    renderPlayers();
    updateStats();
    saveGameState();
    if (isJudgeMode) {
        openJudgeAssistant();
    }
}

function showGame() {
    switchView('gameSection');
    const total = selectedConfig.wolves.length + selectedConfig.gods.length + selectedConfig.villagers;
    document.getElementById('currentConfigInfo').innerHTML = `
        <span class="badge">${total}人 ${selectedConfig.name}</span>
        ${hasSheriff ? '<span class="sheriff">👮</span>' : ''}
        ${isJudgeMode ? '<button class="judge-open-btn" onclick="openJudgeAssistant()">⚖️ 法官</button>' : ''}
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
    if (!guardAction()) return;
    var p = players.find(function (x) { return x.id === deathPickerTarget; });
    if (!p) return;

    vibrate(30);
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
    var r = DEATH_REASONS[reason];
    return r ? r.icon + ' ' + r.label : reason;
}

// ===== Game Result =====
function confirmSaveWithResult() {
    if (!guardAction()) return;
    if (!selectedConfig || players.length === 0) return;
    document.getElementById('resultPickerOverlay').classList.add('overlay-active');
}

async function saveWithResult(result) {
    document.getElementById('resultPickerOverlay').classList.remove('overlay-active');
    var game = await saveToHistory(result);
    if (game) openReview(game);
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
    vibrate([15, 50, 15]);
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
        var justDiedClass = !p.alive && p.deathRound === currentRound ? ' just-died' : '';

        return '<div class="player-card ' + (p.alive ? '' : 'dead') + justDiedClass + confirmedClass + campCardClass + '" data-id="' + p.id + '">' +
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
                '<div class="note-chips">' +
                ['查杀','金水','银水','好人','悍跳','首刀','自刀','对跳'].map(function(chip) {
                    return '<button class="note-chip" onclick="appendNote(' + p.id + ',\'' + chip + '\')">' + chip + '</button>';
                }).join('') +
                '</div>' +
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
        vibrate(15);
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

function appendNote(id, chip) {
    var p = players.find(function (x) { return x.id === id; });
    if (!p) return;
    p.note = p.note ? p.note + ' ' + chip : chip;
    var input = document.querySelector('.player-card[data-id="' + id + '"] .note-input');
    if (input) input.value = p.note;
    vibrate(10);
    saveGameState();
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
    var p = players.find(function (x) { return x.id === id; });
    if (!p) return;
    var wasSheriff = p.sheriff;
    pushUndo(id + '号 ' + (wasSheriff ? '取消警长' : '设为警长'));
    players.forEach(function (pl) { pl.sheriff = false; });
    if (!wasSheriff) p.sheriff = true;
    renderPlayers();
    saveGameState();
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
    var wolvesAlive = players.filter(function (p) { return p.camp === 'wolf' && p.alive; }).length;
    var wolvesTotal = players.filter(function (p) { return p.camp === 'wolf'; }).length;
    var godsAlive = players.filter(function (p) { return p.camp === 'god' && p.alive; }).length;
    var godsTotal = players.filter(function (p) { return p.camp === 'god'; }).length;
    var villagersAlive = players.filter(function (p) { return p.camp === 'villager' && p.alive; }).length;
    var villagersTotal = players.filter(function (p) { return p.camp === 'villager'; }).length;
    document.getElementById('aliveCount').textContent = alive;
    document.getElementById('deadCount').textContent = dead;
    document.getElementById('wolfCount').textContent = wolvesTotal ? wolvesAlive + '/' + wolvesTotal : '0';
    document.getElementById('godCount').textContent = godsTotal ? godsAlive + '/' + godsTotal : '0';
    document.getElementById('villagerCount').textContent = villagersTotal ? villagersAlive + '/' + villagersTotal : '0';
}

function resetGame() {
    showConfirm('重置当前游戏？', function () {
        players = [];
        selectedConfig = null;
        currentRound = 1;
        currentPhase = 'night';
        gameEvents = [];
        undoStack = [];
        isJudgeMode = false;
        judgeAllRounds = [];
        witchSaveUsed = false;
        witchPoisonUsed = false;
        lastGuardTarget = null;
        var judgeToggle = document.getElementById('judgeModeToggle');
        if (judgeToggle) judgeToggle.checked = false;
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
    if (!selectedConfig || players.length === 0) return null;

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
            showToast('云端保存失败: ' + (err.message || err.code || '未知错误'), 'warning', 4000);
        }
    } else {
        saveLocalHistory(game);
        showToast('已保存到本地', 'success');
    }

    return game;
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

function viewHistoryGame(id) {
    var game = gameHistory.find(function (g) { return String(g.id) === String(id); });
    if (!game) return;
    openReview(game);
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

// ===== Review =====
function buildReviewTimeline(gamePlayers) {
    var phases = {};
    gamePlayers.forEach(function (p) {
        if (!p.alive && p.deathRound) {
            var key = p.deathRound + '_' + (p.deathPhase || 'night');
            if (!phases[key]) {
                phases[key] = { round: p.deathRound, phase: p.deathPhase || 'night', deaths: [] };
            }
            phases[key].deaths.push(p);
        }
    });

    // Find max round from deaths or default to 1
    var maxRound = 1;
    gamePlayers.forEach(function (p) {
        if (p.deathRound && p.deathRound > maxRound) maxRound = p.deathRound;
    });

    var timeline = [];
    for (var r = 1; r <= maxRound; r++) {
        var nightKey = r + '_night';
        var dayKey = r + '_day';
        timeline.push(phases[nightKey] || { round: r, phase: 'night', deaths: [] });
        timeline.push(phases[dayKey] || { round: r, phase: 'day', deaths: [] });
    }

    // Remove trailing empty phases
    while (timeline.length > 0 && timeline[timeline.length - 1].deaths.length === 0) {
        timeline.pop();
    }

    return timeline;
}

function renderReviewContent(gameData) {
    var resultLabels = {
        'good_win': { text: '😇 好人阵营胜利', cls: 'result-good' },
        'wolf_win': { text: '🐺 狼人阵营胜利', cls: 'result-wolf' },
        'draw': { text: '🤝 平局', cls: 'result-draw' }
    };

    var html = '';

    // Result banner
    if (gameData.result && resultLabels[gameData.result]) {
        var r = resultLabels[gameData.result];
        html += '<div class="review-result ' + r.cls + '">' + r.text + '</div>';
    }

    // Timeline
    var timeline = buildReviewTimeline(gameData.players);
    if (timeline.length > 0) {
        html += '<div><div class="review-section-title">⏱ 死亡时间线</div>';
        html += '<div class="review-timeline">';
        timeline.forEach(function (phase) {
            var phaseIcon = phase.phase === 'night' ? '🌙' : '☀️';
            var phaseText = phase.phase === 'night' ? '夜' : '天';
            var emptyClass = phase.deaths.length === 0 ? ' empty' : '';
            var phaseClass = phase.phase === 'night' ? ' night' : ' day';

            html += '<div class="review-round' + emptyClass + phaseClass + '">';
            html += '<div class="review-round-title">第' + phase.round + phaseText + ' ' + phaseIcon + '</div>';

            if (phase.deaths.length === 0) {
                html += '<span class="review-peace">平安</span>';
            } else {
                phase.deaths.forEach(function (p) {
                    var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
                    var campClass = p.camp !== 'unknown' ? ' camp-' + p.camp : '';
                    var roleName = roleInfo ? roleInfo.icon + ' ' + roleInfo.name : '❓ 未知';
                    var reasonText = p.deathReason ? getDeathReasonLabel(p.deathReason) : '';

                    html += '<div class="review-death-item' + campClass + '">';
                    html += '<span class="review-death-num">' + p.id + '号</span>';
                    html += '<span class="review-death-role">' + roleName + '</span>';
                    if (reasonText) html += '<span class="review-death-reason">' + reasonText + '</span>';
                    html += '</div>';
                });
            }
            html += '</div>';
        });
        html += '</div></div>';
    }

    // All players identity grid
    html += '<div><div class="review-section-title">🎭 玩家身份</div>';
    html += '<div class="review-players-grid">';
    gameData.players.forEach(function (p) {
        var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
        var campClass = p.camp !== 'unknown' ? ' camp-' + p.camp : '';
        var deadClass = !p.alive ? ' dead' : '';
        var icon = roleInfo ? roleInfo.icon : '❓';
        var name = roleInfo ? roleInfo.name : '未知';

        html += '<div class="review-player-card' + campClass + deadClass + '">';
        html += '<span class="review-player-num">' + p.id + '号</span>';
        html += '<span class="review-player-icon">' + icon + '</span>';
        html += '<span class="review-player-name">' + name + '</span>';
        if (!p.alive && p.deathReason) {
            var dr = DEATH_REASONS[p.deathReason];
            html += '<span class="review-player-death">' + (dr ? dr.short : p.deathReason) + '</span>';
        }
        html += '</div>';
    });
    html += '</div></div>';

    // Notes
    if (gameData.notes) {
        html += '<div><div class="review-section-title">📝 笔记</div>';
        html += '<div style="padding:10px 14px;background:var(--bg2);border-radius:8px;font-size:0.9rem;color:var(--text2);white-space:pre-wrap;">' + escapeHtml(gameData.notes) + '</div>';
        html += '</div>';
    }

    return html;
}

var _currentReviewData = null;

function openReview(gameData) {
    _currentReviewData = gameData;
    var configText = gameData.player_count + '人 ' + gameData.config_name;
    if (gameData.date) configText += ' · ' + gameData.date;
    document.getElementById('reviewConfig').textContent = configText;
    document.getElementById('reviewContent').innerHTML = renderReviewContent(gameData);
    document.getElementById('reviewOverlay').classList.add('overlay-active');
}

function closeReview() {
    document.getElementById('reviewOverlay').classList.remove('overlay-active');
}

function copyReviewText(gameData) {
    var text = '【狼人杀复盘】\n';
    text += gameData.player_count + '人 ' + gameData.config_name;
    if (gameData.date) text += ' · ' + gameData.date;
    text += '\n';

    if (gameData.result) {
        var labels = { 'good_win': '好人胜', 'wolf_win': '狼人胜', 'draw': '平局' };
        text += '结果：' + (labels[gameData.result] || '') + '\n';
    }

    text += '\n玩家身份：\n';
    gameData.players.forEach(function (p) {
        var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
        var status = p.alive ? '存活' : '死亡';
        text += p.id + '号 ' + (roleInfo ? roleInfo.name : '未知') + ' ' + status;
        if (!p.alive && p.deathReason) {
            var dr = DEATH_REASONS[p.deathReason];
            text += '(' + (dr ? dr.label : p.deathReason) + ')';
        }
        text += '\n';
    });

    var timeline = buildReviewTimeline(gameData.players);
    if (timeline.length > 0) {
        text += '\n死亡时间线：\n';
        timeline.forEach(function (phase) {
            var phaseText = phase.phase === 'night' ? '夜' : '天';
            if (phase.deaths.length > 0) {
                text += '第' + phase.round + phaseText + '：';
                text += phase.deaths.map(function (p) {
                    var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
                    var dr = DEATH_REASONS[p.deathReason];
                    return p.id + '号' + (roleInfo ? roleInfo.name : '') + (dr ? '(' + dr.label + ')' : '');
                }).join('，');
                text += '\n';
            }
        });
    }

    navigator.clipboard.writeText(text).then(function () {
        showToast('已复制到剪贴板', 'success');
    }).catch(function () {
        showToast('复制失败', 'error');
    });
}

function copyCurrentGame() {
    if (!selectedConfig || players.length === 0) return;
    var text = '【狼人杀当前局面】\n';
    text += players.length + '人 ' + selectedConfig.name + ' 第' + currentRound + (currentPhase === 'night' ? '夜' : '天') + '\n';

    var alive = players.filter(function (p) { return p.alive; }).length;
    var dead = players.filter(function (p) { return !p.alive; }).length;
    text += '存活' + alive + '人 死亡' + dead + '人\n\n';

    players.forEach(function (p) {
        var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
        var campLabel = { wolf: '🐺', god: '🔮', villager: '👨‍🌾', unknown: '❓' };
        text += p.id + '号 ' + (campLabel[p.camp] || '❓');
        if (roleInfo) text += roleInfo.name;
        text += p.alive ? ' 存活' : ' 死亡';
        if (!p.alive && p.deathReason) {
            var dr = DEATH_REASONS[p.deathReason];
            text += '(' + (dr ? dr.label : p.deathReason) + ')';
        }
        if (p.note) text += ' [' + p.note + ']';
        text += '\n';
    });

    navigator.clipboard.writeText(text).then(function () {
        showToast('已复制到剪贴板', 'success');
    }).catch(function () {
        showToast('复制失败', 'error');
    });
}

// ===== Judge Assistant =====
var JudgeSFX = {
    ctx: null,
    enabled: true,
    ambientNodes: null,

    ensureContext: function() {
        if (!this.ctx || this.ctx.state === 'closed') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play: function(name) {
        if (!this.enabled) return;
        try {
            this.ensureContext();
            if (this[name]) this[name]();
        } catch (e) {
            console.warn('SFX error:', name, e);
        }
    },

    nightBell: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var master = ctx.createGain();
        master.gain.setValueAtTime(0.35, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + 3);
        master.connect(ctx.destination);

        [110, 220, 330].forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            var g = ctx.createGain();
            g.gain.value = 0.3 - i * 0.08;
            osc.connect(g);
            g.connect(master);
            osc.start(now);
            osc.stop(now + 3);
        });
    },

    wolfGrowl: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.4);
        osc.frequency.linearRampToValueAtTime(55, now + 1.5);

        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        filter.Q.value = 8;

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
    },

    charmSpell: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.5);
        osc.frequency.linearRampToValueAtTime(500, now + 1.2);

        var vibrato = ctx.createOscillator();
        vibrato.frequency.value = 6;
        var vibGain = ctx.createGain();
        vibGain.gain.value = 15;
        vibrato.connect(vibGain);
        vibGain.connect(osc.frequency);
        vibrato.start(now);
        vibrato.stop(now + 1.5);

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.5);
    },

    witchBrew: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        for (var i = 0; i < 6; i++) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            var freq = 300 + Math.random() * 500;
            var t = now + i * 0.15;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.12);

            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        }
    },

    seerReveal: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var master = ctx.createGain();
        master.gain.setValueAtTime(0.2, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + 2);
        master.connect(ctx.destination);

        [880, 1100, 1320].forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            var g = ctx.createGain();
            g.gain.value = 0.25 - i * 0.05;
            osc.connect(g);
            g.connect(master);
            osc.start(now);
            osc.stop(now + 2);
        });
    },

    guardShield: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;

        // Noise burst through bandpass
        var bufferSize = ctx.sampleRate * 0.15;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        var bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 800;
        bandpass.Q.value = 2;
        var noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        noise.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

        // Metallic tone
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 350;
        var oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
    },

    dawnChime: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        [440, 550, 660, 880].forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            var gain = ctx.createGain();
            var t = now + i * 0.2;
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    },

    deathGong: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var master = ctx.createGain();
        master.gain.setValueAtTime(0.35, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + 4);
        master.connect(ctx.destination);

        [80, 120, 160].forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            var g = ctx.createGain();
            g.gain.value = 0.3 - i * 0.08;
            osc.connect(g);
            g.connect(master);
            osc.start(now);
            osc.stop(now + 4);
        });
    },

    voteHeartbeat: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        for (var beat = 0; beat < 3; beat++) {
            var t = now + beat * 0.6;
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 60;
            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        }
    },

    selectDing: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 1200;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    },

    startNightAmbient: function() {
        if (!this.enabled) return;
        this.stopAmbient();
        try {
            this.ensureContext();
            var ctx = this.ctx;
            var now = ctx.currentTime;
            var master = ctx.createGain();
            master.gain.setValueAtTime(0, now);
            master.gain.linearRampToValueAtTime(0.08, now + 2);
            master.connect(ctx.destination);

            var oscs = [];
            [55, 57, 110].forEach(function(freq) {
                var osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                var g = ctx.createGain();
                g.gain.value = 0.3;
                osc.connect(g);
                g.connect(master);
                osc.start(now);
                oscs.push(osc);
            });

            this.ambientNodes = { master: master, oscs: oscs };
        } catch (e) {
            console.warn('Ambient SFX error:', e);
        }
    },

    stopAmbient: function() {
        if (!this.ambientNodes) return;
        try {
            var ctx = this.ctx;
            var now = ctx.currentTime;
            this.ambientNodes.master.gain.linearRampToValueAtTime(0, now + 1);
            var oscs = this.ambientNodes.oscs;
            setTimeout(function() {
                oscs.forEach(function(osc) {
                    try { osc.stop(); } catch (e) {}
                });
            }, 1200);
        } catch (e) {}
        this.ambientNodes = null;
    }
};

const NIGHT_STEP_TEMPLATES = {
    guard: [
        { type: 'announce', text: '守卫请睁眼', voice: '守卫请睁眼，请选择今晚要守护的玩家', icon: '🛡️', sfx: 'guardShield' },
        { type: 'guard_protect', text: '选择守护对象', icon: '🛡️' },
        { type: 'announce', text: '守卫请闭眼', voice: '守卫请闭眼', icon: '🛡️' },
    ],
    wolf: [
        { type: 'announce', text: '狼人请睁眼', voice: '狼人请睁眼，请讨论并选择今晚要刀的玩家', icon: '🐺', sfx: 'wolfGrowl' },
        { type: 'wolf_kill', text: '选择刀人对象', icon: '🐺' },
        { type: 'announce', text: '狼人请闭眼', voice: '狼人请闭眼', icon: '🐺' },
    ],
    wolf_beauty: [
        { type: 'announce', text: '狼美人请睁眼', voice: '狼美人请睁眼', icon: '💋', sfx: 'charmSpell' },
        { type: 'wolf_beauty_charm', text: '选择魅惑对象', icon: '💋' },
        { type: 'announce', text: '狼美人请闭眼', voice: '狼美人请闭眼', icon: '💋' },
    ],
    witch: [
        { type: 'announce', text: '女巫请睁眼', voice: '女巫请睁眼', icon: '🧙‍♀️', sfx: 'witchBrew' },
        { type: 'witch_turn', text: '女巫用药', icon: '🧙‍♀️' },
        { type: 'announce', text: '女巫请闭眼', voice: '女巫请闭眼', icon: '🧙‍♀️' },
    ],
    seer: [
        { type: 'announce', text: '预言家请睁眼', voice: '预言家请睁眼，请选择今晚要查验的玩家', icon: '🔮', sfx: 'seerReveal' },
        { type: 'seer_check', text: '选择查验对象', icon: '🔮' },
        { type: 'announce', text: '预言家请闭眼', voice: '预言家请闭眼', icon: '🔮' },
    ],
};

function buildNightSteps() {
    var steps = [];
    steps.push({ type: 'announce', text: '天黑请闭眼', voice: '天黑请闭眼', icon: '🌙', sfx: 'nightBell' });

    var order = ['guard', 'wolf', 'wolf_beauty', 'witch', 'seer'];
    order.forEach(function (role) {
        var hasRole = false;
        if (role === 'wolf') {
            hasRole = true;
        } else if (role === 'wolf_beauty') {
            hasRole = selectedConfig.wolves.includes('wolf_beauty');
        } else if (role === 'guard') {
            hasRole = selectedConfig.gods.includes('guard');
        } else if (role === 'witch') {
            hasRole = selectedConfig.gods.includes('witch');
        } else if (role === 'seer') {
            hasRole = selectedConfig.gods.includes('seer');
        }
        if (hasRole) {
            NIGHT_STEP_TEMPLATES[role].forEach(function (s) {
                steps.push(Object.assign({}, s));
            });
        }
    });

    steps.push({ type: 'announce', text: '天亮了请睁眼', voice: '天亮了，请大家睁眼', icon: '☀️', sfx: 'dawnChime' });
    return steps;
}

function buildDaySteps() {
    var steps = [];
    steps.push({ type: 'dawn_result', text: '公布昨晚结果', icon: '☀️', sfx: 'deathGong' });
    if (currentRound === 1 && hasSheriff) {
        steps.push({ type: 'announce', text: '警长竞选', voice: '请进行警长竞选', icon: '👮' });
    }
    steps.push({ type: 'announce', text: '开始发言', voice: '请开始自由发言', icon: '💬' });
    steps.push({ type: 'vote', text: '投票环节', icon: '🗳️', sfx: 'voteHeartbeat' });
    steps.push({ type: 'end_day', text: '结束白天', icon: '🌙' });
    return steps;
}

// ===== Judge Timer Functions =====
function judgeTimerFormat(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function judgeTimerUpdateDisplay() {
    var el = document.getElementById('judgeTimerDisplay');
    if (!el) return;
    el.textContent = judgeTimerFormat(judgeTimerSeconds);
    if (judgeTimerSeconds <= 10 && judgeTimerSeconds > 0) {
        el.classList.add('timer-warning');
    } else {
        el.classList.remove('timer-warning');
    }
    if (judgeTimerSeconds <= 0) {
        el.classList.add('timer-expired');
    } else {
        el.classList.remove('timer-expired');
    }
}

function judgeTimerStart() {
    if (judgeTimerRunning) return;
    judgeTimerRunning = true;
    var btn = document.getElementById('judgeTimerToggleBtn');
    if (btn) btn.textContent = '⏸';
    judgeTimerInterval = setInterval(function () {
        judgeTimerSeconds--;
        judgeTimerUpdateDisplay();
        if (judgeTimerSeconds <= 0) {
            judgeTimerPause();
            JudgeSFX.play('nightBell');
            showToast('时间到！', 'warning');
        }
    }, 1000);
}

function judgeTimerPause() {
    judgeTimerRunning = false;
    clearInterval(judgeTimerInterval);
    judgeTimerInterval = null;
    var btn = document.getElementById('judgeTimerToggleBtn');
    if (btn) btn.textContent = '▶';
}

function judgeTimerToggle() {
    if (judgeTimerRunning) {
        judgeTimerPause();
    } else {
        if (judgeTimerSeconds <= 0) {
            judgeTimerSeconds = judgeTimerDuration;
            judgeTimerUpdateDisplay();
        }
        judgeTimerStart();
    }
}

function judgeTimerReset() {
    judgeTimerPause();
    judgeTimerSeconds = judgeTimerDuration;
    judgeTimerUpdateDisplay();
}

function judgeTimerSetDuration(sec) {
    judgeTimerDuration = sec;
    judgeTimerPause();
    judgeTimerSeconds = sec;
    judgeTimerUpdateDisplay();
    // Update active state on preset buttons
    document.querySelectorAll('.judge-timer-preset').forEach(function (b) {
        b.classList.toggle('active', parseInt(b.dataset.seconds) === sec);
    });
}

function judgeTimerStop() {
    judgeTimerPause();
    judgeTimerSeconds = 0;
}

function renderJudgeTimerUI() {
    return '<div class="judge-timer-container">' +
        '<div class="judge-timer-presets">' +
            '<button class="judge-timer-preset' + (judgeTimerDuration === 30 ? ' active' : '') + '" data-seconds="30" onclick="judgeTimerSetDuration(30)">30秒</button>' +
            '<button class="judge-timer-preset' + (judgeTimerDuration === 60 ? ' active' : '') + '" data-seconds="60" onclick="judgeTimerSetDuration(60)">1分</button>' +
            '<button class="judge-timer-preset' + (judgeTimerDuration === 90 ? ' active' : '') + '" data-seconds="90" onclick="judgeTimerSetDuration(90)">1分半</button>' +
            '<button class="judge-timer-preset' + (judgeTimerDuration === 120 ? ' active' : '') + '" data-seconds="120" onclick="judgeTimerSetDuration(120)">2分</button>' +
            '<button class="judge-timer-preset' + (judgeTimerDuration === 180 ? ' active' : '') + '" data-seconds="180" onclick="judgeTimerSetDuration(180)">3分</button>' +
        '</div>' +
        '<div class="judge-timer-display" id="judgeTimerDisplay">' + judgeTimerFormat(judgeTimerSeconds) + '</div>' +
        '<div class="judge-timer-controls">' +
            '<button class="judge-timer-btn" id="judgeTimerToggleBtn" onclick="judgeTimerToggle()">▶</button>' +
            '<button class="judge-timer-btn" onclick="judgeTimerReset()">↺</button>' +
        '</div>' +
    '</div>';
}

function openJudgeAssistant() {
    JudgeSFX.ensureContext();
    judgeRoundData = { round: currentRound, night: {}, day: {} };
    judgePhase = 'night';
    judgeSteps = buildNightSteps();
    judgeStepIndex = 0;
    judgeSelectedPlayer = null;
    judgeDawnDeaths = [];
    judgeTimerStop();
    judgeTimerSeconds = judgeTimerDuration;
    document.getElementById('judgeOverlay').classList.add('overlay-active');
    updateJudgeRoundInfo();
    renderJudgeStep();
}

function closeJudgeAssistant() {
    if (window.speechSynthesis) {
        try { speechSynthesis.cancel(); } catch (e) {}
    }
    JudgeSFX.stopAmbient();
    judgeTimerStop();
    document.getElementById('judgeOverlay').classList.remove('overlay-active');
}

function updateJudgeRoundInfo() {
    var phaseText = judgePhase === 'night' ? '夜晚' : '白天';
    document.getElementById('judgeRoundInfo').textContent = '第' + currentRound + '轮 · ' + phaseText;
}

function renderJudgeProgress() {
    var html = '';
    for (var i = 0; i < judgeSteps.length; i++) {
        var cls = 'judge-progress-dot';
        if (i < judgeStepIndex) cls += ' done';
        else if (i === judgeStepIndex) cls += ' active ' + judgePhase;
        html += '<span class="' + cls + '"></span>';
    }
    document.getElementById('judgeProgress').innerHTML = html;
}

function renderJudgeStep() {
    if (judgeStepIndex >= judgeSteps.length) {
        if (judgePhase === 'night') {
            judgePhase = 'day';
            judgeSteps = buildDaySteps();
            judgeStepIndex = 0;
            updateJudgeRoundInfo();
            renderJudgeStep();
        }
        return;
    }

    var step = judgeSteps[judgeStepIndex];
    var content = document.getElementById('judgeStepContent');
    var footer = document.getElementById('judgeFooter');
    judgeSelectedPlayer = null;

    renderJudgeProgress();

    if (step.type === 'announce') {
        renderAnnounceStep(step, content, footer);
    } else if (step.type === 'wolf_kill') {
        renderPlayerSelectStep(step, content, footer, 'wolf_kill');
    } else if (step.type === 'guard_protect') {
        renderGuardStep(step, content, footer);
    } else if (step.type === 'wolf_beauty_charm') {
        renderPlayerSelectStep(step, content, footer, 'wolf_beauty_charm');
    } else if (step.type === 'witch_turn') {
        renderWitchStep(step, content, footer);
    } else if (step.type === 'seer_check') {
        renderSeerStep(step, content, footer);
    } else if (step.type === 'dawn_result') {
        renderDawnResultStep(step, content, footer);
    } else if (step.type === 'vote') {
        renderVoteStep(step, content, footer);
    } else if (step.type === 'end_day') {
        renderEndDayStep(step, content, footer);
    }

    // Play step SFX
    if (step.sfx) JudgeSFX.play(step.sfx);

    // Night ambient management
    if (step.text === '天黑请闭眼') JudgeSFX.startNightAmbient();
    if (step.text === '天亮了请睁眼' || step.type === 'dawn_result') JudgeSFX.stopAmbient();

    if (step.type === 'announce' && step.voice) {
        judgeSpeak(step.voice);
    }
}

function renderAnnounceStep(step, content, footer) {
    var showTimer = step.text === '开始发言' || step.text === '警长竞选';
    content.innerHTML =
        '<div class="judge-step-icon">' + (step.icon || '📢') + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>' +
        (step.voice ? '<button class="judge-replay-btn" onclick="judgeSpeak(\'' + escapeHtml(step.voice).replace(/'/g, "\\'") + '\')">🔊 重播</button>' : '') +
        (showTimer ? renderJudgeTimerUI() : '');

    if (showTimer) {
        judgeTimerPause();
        judgeTimerSeconds = judgeTimerDuration;
        judgeTimerUpdateDisplay();
    }

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()" ' + (judgeStepIndex === 0 ? 'style="visibility:hidden"' : '') + '>◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeNextStep()">下一步 ▶</button>';
}

function getAlivePlayers() {
    return players.filter(function (p) { return p.alive; });
}

function buildPlayerGrid(disabledIds, actionType) {
    var html = '<div class="judge-player-grid">';
    players.forEach(function (p) {
        var isDisabled = !p.alive || (disabledIds && disabledIds.indexOf(p.id) >= 0);
        var isSelected = judgeSelectedPlayer === p.id;
        var cls = 'judge-player-cell';
        if (isDisabled) cls += ' disabled';
        if (isSelected) cls += ' selected';
        var roleInfo = p.role !== 'unknown' ? ROLES[p.role] : null;
        html += '<div class="' + cls + '" onclick="judgeSelectPlayer(' + p.id + ', \'' + actionType + '\')">' +
            '<span class="cell-num">' + p.id + '</span>' +
            (roleInfo ? '<span class="cell-role">' + roleInfo.icon + '</span>' : '') +
            '</div>';
    });
    html += '</div>';
    return html;
}

function renderPlayerSelectStep(step, content, footer, actionType) {
    var disabledIds = [];
    content.innerHTML =
        '<div class="judge-step-icon">' + (step.icon || '❓') + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>' +
        buildPlayerGrid(disabledIds, actionType) +
        (actionType === 'wolf_beauty_charm' ? '<button class="judge-action-btn skip" style="margin-top:8px;max-width:400px;width:100%" onclick="judgeSkipAction(\'' + actionType + '\')">⏭ 不魅惑</button>' : '');

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeConfirmSelection(\'' + actionType + '\')" id="judgeConfirmBtn" ' + (judgeSelectedPlayer ? '' : 'style="opacity:0.4;pointer-events:none"') + '>确认 ▶</button>';
}

function renderGuardStep(step, content, footer) {
    var disabledIds = [];
    if (lastGuardTarget) disabledIds.push(lastGuardTarget);

    content.innerHTML =
        '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>' +
        (lastGuardTarget ? '<div class="judge-step-subtitle">上夜守护了 ' + lastGuardTarget + '号，不可连续守护</div>' : '') +
        buildPlayerGrid(disabledIds, 'guard_protect') +
        '<button class="judge-action-btn skip" style="margin-top:8px;max-width:400px;width:100%" onclick="judgeSkipAction(\'guard_protect\')">⏭ 空守</button>';

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeConfirmSelection(\'guard_protect\')" id="judgeConfirmBtn" ' + (judgeSelectedPlayer ? '' : 'style="opacity:0.4;pointer-events:none"') + '>确认 ▶</button>';
}

function renderWitchStep(step, content, footer) {
    var wolfTarget = judgeRoundData.night.wolf_kill;
    var targetText = wolfTarget ? wolfTarget + '号 被刀' : '今晚无人被刀';
    var saveDisabled = witchSaveUsed || !wolfTarget;
    var poisonDisabled = witchPoisonUsed;

    content.innerHTML =
        '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-witch-info">🐺 今晚 ' + targetText + '</div>' +
        '<div class="judge-action-btns">' +
            '<button class="judge-action-btn save' + (saveDisabled ? ' disabled' : '') + '" onclick="judgeWitchAction(\'save\')">' +
                '💊 救' + (witchSaveUsed ? '（已用）' : '') +
            '</button>' +
            '<button class="judge-action-btn poison' + (poisonDisabled ? ' disabled' : '') + '" onclick="judgeWitchAction(\'poison\')">' +
                '🧪 毒' + (witchPoisonUsed ? '（已用）' : '') +
            '</button>' +
            '<button class="judge-action-btn skip" onclick="judgeWitchAction(\'skip\')">⏭ 不用药</button>' +
        '</div>' +
        '<div id="witchPoisonGrid"></div>';

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<span></span>';
}

function judgeWitchAction(action) {
    if (action === 'save') {
        var wolfTarget = judgeRoundData.night.wolf_kill;
        if (!wolfTarget || witchSaveUsed) return;
        judgeRoundData.night.witch_save = wolfTarget;
        witchSaveUsed = true;
        showToast('女巫使用解药救了 ' + wolfTarget + '号', 'success');
        judgeNextStep();
    } else if (action === 'poison') {
        if (witchPoisonUsed) return;
        var grid = document.getElementById('witchPoisonGrid');
        judgeSelectedPlayer = null;
        grid.innerHTML =
            '<div class="judge-step-subtitle" style="margin:12px 0 8px">选择毒杀目标</div>' +
            buildPlayerGrid([], 'witch_poison') +
            '<button class="judge-btn next" style="margin-top:10px;width:100%;opacity:0.4;pointer-events:none" onclick="judgeConfirmWitchPoison()" id="judgeConfirmBtn">确认毒杀 ▶</button>';
    } else {
        judgeNextStep();
    }
}

function judgeConfirmWitchPoison() {
    if (!judgeSelectedPlayer) return;
    judgeRoundData.night.witch_poison = judgeSelectedPlayer;
    witchPoisonUsed = true;
    showToast('女巫毒杀了 ' + judgeSelectedPlayer + '号', 'info');
    judgeSelectedPlayer = null;
    judgeNextStep();
}

function renderSeerStep(step, content, footer) {
    content.innerHTML =
        '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>' +
        buildPlayerGrid([], 'seer_check');

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeConfirmSelection(\'seer_check\')" id="judgeConfirmBtn" ' + (judgeSelectedPlayer ? '' : 'style="opacity:0.4;pointer-events:none"') + '>确认 ▶</button>';
}

function judgeSeerResult(playerId) {
    var content = document.getElementById('judgeStepContent');
    content.innerHTML =
        '<div class="judge-step-icon">🔮</div>' +
        '<div class="judge-step-text">' + playerId + '号 的查验结果</div>' +
        '<div class="judge-action-btns">' +
            '<button class="judge-action-btn good-result" onclick="judgeRecordSeerResult(' + playerId + ', \'good\')">😇 好人</button>' +
            '<button class="judge-action-btn wolf-result" onclick="judgeRecordSeerResult(' + playerId + ', \'wolf\')">🐺 狼人</button>' +
        '</div>';

    document.getElementById('judgeFooter').innerHTML =
        '<button class="judge-btn prev" onclick="renderJudgeStep()">◀ 返回</button><span></span>';
}

function judgeRecordSeerResult(playerId, result) {
    judgeRoundData.night.seer_check = { target: playerId, result: result };
    var resultText = result === 'good' ? '😇 好人' : '🐺 狼人';
    showToast(playerId + '号 查验结果：' + resultText, 'info');
    judgeNextStep();
}

function renderDawnResultStep(step, content, footer) {
    judgeDawnDeaths = computeNightDeaths();

    var html = '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>';

    if (judgeDawnDeaths.length === 0) {
        html += '<div class="judge-dawn-peace">平安夜 🎉</div>';
    } else {
        html += '<div class="judge-dawn-list">';
        judgeDawnDeaths.forEach(function (d, idx) {
            var drInfo = DEATH_REASONS[d.reason];
            var reasonLabel = drInfo ? drInfo.icon + ' ' + drInfo.label : d.reason;
            html += '<div class="judge-dawn-item">' +
                '<span class="dawn-info">' + d.id + '号</span>' +
                '<span class="dawn-reason">' + reasonLabel + '</span>' +
                '<button class="dawn-remove" onclick="judgeDawnRemove(' + idx + ')">✕</button>' +
                '</div>';
        });
        html += '</div>';
    }

    html += '<button class="judge-dawn-add" onclick="judgeDawnAddPicker()">+ 添加死亡玩家</button>' +
        '<div id="judgeDawnAddGrid"></div>';

    content.innerHTML = html;

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeDawnConfirm()">确认公布 ▶</button>';
}

function judgeDawnRemove(idx) {
    judgeDawnDeaths.splice(idx, 1);
    renderDawnResultStep(judgeSteps[judgeStepIndex], document.getElementById('judgeStepContent'), document.getElementById('judgeFooter'));
}

function judgeDawnAddPicker() {
    var grid = document.getElementById('judgeDawnAddGrid');
    var existingIds = judgeDawnDeaths.map(function (d) { return d.id; });
    var deadIds = players.filter(function (p) { return !p.alive; }).map(function (p) { return p.id; });
    var disabledIds = existingIds.concat(deadIds);
    judgeSelectedPlayer = null;
    grid.innerHTML =
        '<div class="judge-step-subtitle" style="margin:12px 0 8px">选择要添加的死亡玩家</div>' +
        buildPlayerGrid(disabledIds, 'dawn_add') +
        '<button class="judge-btn next" style="margin-top:10px;width:100%;opacity:0.4;pointer-events:none" onclick="judgeDawnAddConfirm()" id="judgeConfirmBtn">添加 ▶</button>';
}

function judgeDawnAddConfirm() {
    if (!judgeSelectedPlayer) return;
    judgeDawnDeaths.push({ id: judgeSelectedPlayer, reason: 'other' });
    judgeSelectedPlayer = null;
    renderDawnResultStep(judgeSteps[judgeStepIndex], document.getElementById('judgeStepContent'), document.getElementById('judgeFooter'));
}

function judgeDawnConfirm() {
    applyJudgeDeaths(judgeDawnDeaths);
    if (judgeDawnDeaths.length > 0) {
        var names = judgeDawnDeaths.map(function (d) { return d.id + '号'; }).join('、');
        showToast('昨晚死亡：' + names, 'info');
    } else {
        showToast('昨晚是平安夜', 'success');
    }
    judgeNextStep();
}

function renderVoteStep(step, content, footer) {
    content.innerHTML =
        '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-step-text">' + step.text + '</div>' +
        renderJudgeTimerUI() +
        buildPlayerGrid([], 'vote') +
        '<button class="judge-action-btn skip" style="margin-top:8px;max-width:400px;width:100%" onclick="judgeSkipAction(\'vote\')">⏭ 平票/无人出局</button>';

    judgeTimerPause();
    judgeTimerSeconds = judgeTimerDuration;
    judgeTimerUpdateDisplay();

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeConfirmSelection(\'vote\')" id="judgeConfirmBtn" ' + (judgeSelectedPlayer ? '' : 'style="opacity:0.4;pointer-events:none"') + '>确认 ▶</button>';
}

function renderEndDayStep(step, content, footer) {
    content.innerHTML =
        '<div class="judge-step-icon">' + step.icon + '</div>' +
        '<div class="judge-step-text">白天阶段结束</div>' +
        '<div class="judge-step-subtitle">点击下方按钮进入下一夜</div>';

    footer.innerHTML =
        '<button class="judge-btn prev" onclick="judgePrevStep()">◀ 上一步</button>' +
        '<button class="judge-btn next" onclick="judgeStartNextNight()">🌙 进入下一夜 ▶</button>';
}

function judgeStartNextNight() {
    judgeAllRounds.push(JSON.parse(JSON.stringify(judgeRoundData)));
    currentRound++;
    currentPhase = 'night';
    updateRoundDisplay();
    judgeRoundData = { round: currentRound, night: {}, day: {} };
    judgePhase = 'night';
    judgeSteps = buildNightSteps();
    judgeStepIndex = 0;
    judgeSelectedPlayer = null;
    judgeDawnDeaths = [];
    updateJudgeRoundInfo();
    renderJudgeStep();
    saveGameState();
}

function judgeNextStep() {
    judgeTimerPause();
    judgeStepIndex++;
    if (judgeStepIndex >= judgeSteps.length) {
        if (judgePhase === 'night') {
            judgePhase = 'day';
            currentPhase = 'day';
            updateRoundDisplay();
            judgeSteps = buildDaySteps();
            judgeStepIndex = 0;
            updateJudgeRoundInfo();
        }
    }
    judgeSelectedPlayer = null;
    renderJudgeStep();
    saveGameState();
}

function judgePrevStep() {
    judgeTimerPause();
    if (judgeStepIndex > 0) {
        judgeStepIndex--;
        judgeSelectedPlayer = null;
        renderJudgeStep();
    }
}

function judgeSelectPlayer(playerId, actionType) {
    var p = players.find(function (x) { return x.id === playerId; });
    if (!p || !p.alive) return;

    if (actionType === 'guard_protect' && lastGuardTarget === playerId) return;

    if (actionType === 'seer_check') {
        judgeSelectedPlayer = playerId;
        judgeSeerResult(playerId);
        return;
    }

    judgeSelectedPlayer = playerId;

    // Re-render the grid to show selection
    var cells = document.querySelectorAll('.judge-player-cell');
    cells.forEach(function (cell) {
        cell.classList.remove('selected');
    });
    var targetCell = null;
    cells.forEach(function (cell) {
        var num = cell.querySelector('.cell-num');
        if (num && parseInt(num.textContent) === playerId) {
            targetCell = cell;
        }
    });
    if (targetCell) targetCell.classList.add('selected');

    // Enable confirm button
    var confirmBtn = document.getElementById('judgeConfirmBtn');
    if (confirmBtn) {
        confirmBtn.style.opacity = '1';
        confirmBtn.style.pointerEvents = 'auto';
    }
}

function judgeConfirmSelection(actionType) {
    if (!judgeSelectedPlayer) return;
    JudgeSFX.play('selectDing');

    if (actionType === 'wolf_kill') {
        judgeRoundData.night.wolf_kill = judgeSelectedPlayer;
        showToast('狼人刀了 ' + judgeSelectedPlayer + '号', 'info');
    } else if (actionType === 'guard_protect') {
        judgeRoundData.night.guard_protect = judgeSelectedPlayer;
        lastGuardTarget = judgeSelectedPlayer;
        showToast('守卫守护了 ' + judgeSelectedPlayer + '号', 'info');
    } else if (actionType === 'wolf_beauty_charm') {
        judgeRoundData.night.wolf_beauty_charm = judgeSelectedPlayer;
        showToast('狼美人魅惑了 ' + judgeSelectedPlayer + '号', 'info');
    } else if (actionType === 'vote') {
        judgeRoundData.day.vote_out = judgeSelectedPlayer;
        vibrate(30);
        var vp = players.find(function (x) { return x.id === judgeSelectedPlayer; });
        if (vp) {
            pushUndo(vp.id + '号 投票出局');
            vp.alive = false;
            vp.deathReason = 'vote';
            vp.deathRound = currentRound;
            vp.deathPhase = 'day';
            renderPlayers();
            updateStats();
            logGameEvent({ type: 'death', playerId: vp.id, reason: 'vote', round: currentRound, phase: 'day' });
        }
        showToast(judgeSelectedPlayer + '号 被投票出局', 'info');
    }

    judgeSelectedPlayer = null;
    judgeNextStep();
}

function judgeSkipAction(actionType) {
    if (actionType === 'guard_protect') {
        judgeRoundData.night.guard_protect = null;
        lastGuardTarget = null;
        showToast('守卫空守', 'info');
    } else if (actionType === 'wolf_beauty_charm') {
        judgeRoundData.night.wolf_beauty_charm = null;
        showToast('狼美人未魅惑', 'info');
    } else if (actionType === 'vote') {
        judgeRoundData.day.vote_out = null;
        showToast('无人被投出', 'info');
    }
    judgeNextStep();
}

function judgeSpeak(text) {
    if (!judgeVoiceEnabled || !window.speechSynthesis) return;
    try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.rate = 0.9;
        var voices = speechSynthesis.getVoices();
        var zhVoice = voices.find(function (v) { return v.lang.startsWith('zh'); });
        if (zhVoice) u.voice = zhVoice;
        speechSynthesis.speak(u);
    } catch (e) {
        console.warn('Speech synthesis error:', e);
    }
}

function toggleJudgeVoice() {
    judgeVoiceEnabled = !judgeVoiceEnabled;
    document.getElementById('judgeVoiceBtn').textContent = judgeVoiceEnabled ? '🔊' : '🔇';
    if (!judgeVoiceEnabled && window.speechSynthesis) {
        try { speechSynthesis.cancel(); } catch (e) {}
    }
    showToast(judgeVoiceEnabled ? '语音已开启' : '语音已关闭', 'info');
}

function toggleJudgeSfx() {
    JudgeSFX.enabled = !JudgeSFX.enabled;
    document.getElementById('judgeSfxBtn').textContent = JudgeSFX.enabled ? '🔈' : '🔇';
    if (!JudgeSFX.enabled) JudgeSFX.stopAmbient();
    showToast(JudgeSFX.enabled ? '音效已开启' : '音效已关闭', 'info');
}

function computeNightDeaths() {
    var deaths = [];
    var wolfTarget = judgeRoundData.night.wolf_kill;
    var witchSaved = judgeRoundData.night.witch_save;
    var guardTarget = judgeRoundData.night.guard_protect;
    var witchPoison = judgeRoundData.night.witch_poison;

    if (wolfTarget && wolfTarget !== witchSaved && wolfTarget !== guardTarget) {
        deaths.push({ id: wolfTarget, reason: 'wolf_kill' });
    }
    if (witchPoison) {
        deaths.push({ id: witchPoison, reason: 'witch_poison' });
    }
    return deaths;
}

function applyJudgeDeaths(deaths) {
    deaths.forEach(function (d) {
        var p = players.find(function (x) { return x.id === d.id; });
        if (p && p.alive) {
            pushUndo(p.id + '号 死亡');
            p.alive = false;
            p.deathReason = d.reason;
            p.deathRound = currentRound;
            p.deathPhase = 'night';
            logGameEvent({ type: 'death', playerId: p.id, reason: d.reason, round: currentRound, phase: 'night' });
        }
    });
    renderPlayers();
    updateStats();
    saveGameState();
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
        gameEvents: gameEvents,
        isJudgeMode: isJudgeMode,
        judgeAllRounds: judgeAllRounds,
        witchSaveUsed: witchSaveUsed,
        witchPoisonUsed: witchPoisonUsed,
        lastGuardTarget: lastGuardTarget,
        judgeVoiceEnabled: judgeVoiceEnabled,
        judgeSfxEnabled: JudgeSFX.enabled
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
            isJudgeMode = s.isJudgeMode || false;
            judgeAllRounds = s.judgeAllRounds || [];
            witchSaveUsed = s.witchSaveUsed || false;
            witchPoisonUsed = s.witchPoisonUsed || false;
            lastGuardTarget = s.lastGuardTarget || null;
            if (s.judgeVoiceEnabled !== undefined) judgeVoiceEnabled = s.judgeVoiceEnabled;
            if (s.judgeSfxEnabled !== undefined) JudgeSFX.enabled = s.judgeSfxEnabled;
            document.querySelectorAll('.tab').forEach(function (t) {
                t.classList.toggle('active', parseInt(t.dataset.count) === selectedPlayerCount);
            });
            if (s.selectedConfigId) selectedConfig = (GAME_CONFIGS[selectedPlayerCount] || []).find(function (c) { return c.id === s.selectedConfigId; });
            var toggle = document.getElementById('sheriffToggle');
            if (toggle) toggle.checked = hasSheriff;
            var judgeToggle = document.getElementById('judgeModeToggle');
            if (judgeToggle) judgeToggle.checked = isJudgeMode;
            var notes = document.getElementById('gameNotes');
            if (notes) notes.value = s.notes || '';
            renderConfigOptions();
        } catch (e) { console.error(e); }
    }
}

// ===== Utilities =====
function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms || 15);
}

var _lastActionTime = 0;
function guardAction() {
    var now = Date.now();
    if (now - _lastActionTime < 300) return false;
    _lastActionTime = now;
    return true;
}

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
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== Theme =====
function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('meta[name="theme-color"]').content = '#f2f2f7';
        document.getElementById('themeBtn').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.querySelector('meta[name="theme-color"]').content = '#0f0f1a';
        document.getElementById('themeBtn').textContent = '🌙';
    }
}

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('werewolfTheme', next);
}

// Load theme on startup (before DOMContentLoaded to avoid flash)
(function() {
    var saved = localStorage.getItem('werewolfTheme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

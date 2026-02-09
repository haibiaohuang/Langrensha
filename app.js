// ===== Debug Alert =====
window.alert('DEBUG MODE: app.js loaded successfully!\\n如果不弹这个窗说明脚本根本没加载。');

// ===== Supabase Config =====
const SUPABASE_URL = 'https://amdgywyzyvfcoziefcgy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZGd5d3l6eXZmY296aWVmY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzcxNzcsImV4cCI6MjA4NjE1MzE3N30.QvsqZjCW8KUzzwKDAEF2Fb8IYCRUTbUtZR69VOkqO04';

let supabase = null;
let currentUser = null;

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
let authMode = 'login';

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');

    // 1. Load Local State First (Essential)
    try {
        loadGameState();
        loadLocalHistory();
        setupEventListeners();
        renderConfigOptions();
        if (players.length > 0 && selectedConfig) showGame();
        console.log('Local init done');
    } catch (e) {
        console.error('Local init error:', e);
        alert('本地初始化失败: ' + e.message);
    }

    // 2. Initialize Supabase (Optional Enhancement)
    try {
        if (!window.supabase) {
            console.warn('Supabase SDK missing, running in offline mode');
        } else {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized');

            // Check for existing session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) console.error('Session error:', error);

            if (session) {
                console.log('User already logged in:', session.user.email);
                currentUser = session.user;
                updateAuthUI();
                await loadCloudHistory();
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
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

// ===== Auth Functions =====
function showAuth() {
    document.getElementById('authPanel').style.display = 'flex';
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
}

function hideAuth() {
    document.getElementById('authPanel').style.display = 'none';
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
        alert('请输入邮箱和密码');
        return;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '处理中...';

    try {
        if (!supabase) throw new Error('Supabase 未连接');

        let result;
        if (authMode === 'login') {
            console.log('Attempting login for:', email);
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            console.log('Attempting signup for:', email);
            result = await supabase.auth.signUp({ email, password });
        }

        console.log('Auth result:', result);

        if (result.error) throw result.error;

        if (authMode === 'register' && !result.data.session) {
            alert('注册验证邮件已发送！\n请去邮箱查看并点击确认链接。\n(注意检查垃圾邮件)');
        } else {
            // Login successful or auto-login after register
            console.log('Auth successful');
            hideAuth();
            alert(authMode === 'login' ? '登录成功！' : '注册成功！');
        }
    } catch (err) {
        console.error('Auth error:', err);
        alert('操作失败: ' + (err.message || err.error_description || '未知错误'));
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function signInWithGoogle() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
    } catch (err) {
        alert('Google登录失败: ' + err.message);
    }
}

async function signOut() {
    await supabase.auth.signOut();
    currentUser = null;
    updateAuthUI();
    gameHistory = [];
    loadLocalHistory();
    renderHistory();
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (currentUser) {
        authBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.email?.split('@')[0] || '用户';
    } else {
        authBtn.style.display = 'block';
        userInfo.style.display = 'none';
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
    document.getElementById('authPanel').style.display = 'none';
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
    document.getElementById('authPanel').style.display = 'none';
    document.getElementById('setupPanel').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
}

// ===== History =====
function showHistory() {
    document.getElementById('authPanel').style.display = 'none';
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';

    const syncStatus = document.getElementById('syncStatus');
    if (currentUser) {
        syncStatus.innerHTML = `<span class="synced">☁️ 已登录: ${currentUser.email?.split('@')[0]} - 数据云端同步</span>`;
    } else {
        syncStatus.innerHTML = `<span class="local">📱 未登录 - 数据仅保存在本地</span>`;
    }

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

async function saveToHistory() {
    if (!selectedConfig || players.length === 0) return;

    const game = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        config_name: selectedConfig.name,
        player_count: players.length,
        has_sheriff: hasSheriff,
        players: JSON.parse(JSON.stringify(players)),
        notes: document.getElementById('gameNotes')?.value || '',
        wolves: players.filter(p => p.camp === 'wolf').length,
        good: players.filter(p => p.camp === 'good').length,
        alive: players.filter(p => p.alive).length
    };

    // Save to cloud if logged in
    if (currentUser && supabase) {
        try {
            const { error } = await supabase
                .from('game_history')
                .insert({
                    user_id: currentUser.id,
                    config_name: game.config_name,
                    player_count: game.player_count,
                    has_sheriff: game.has_sheriff,
                    players: game.players,
                    notes: game.notes,
                    wolves: game.wolves,
                    good: game.good,
                    alive: game.alive
                });

            if (error) throw error;
            await loadCloudHistory();
            alert('✅ 已保存到云端！');
        } catch (err) {
            console.error('Cloud save error:', err);
            // Fallback to local
            saveLocalHistory(game);
            alert('⚠️ 云端保存失败，已保存到本地');
        }
    } else {
        saveLocalHistory(game);
        alert('✅ 已保存到本地！(登录后可云端同步)');
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
    if (!currentUser || !supabase) return;

    try {
        const { data, error } = await supabase
            .from('game_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        gameHistory = (data || []).map(g => ({
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
            isCloud: true
        }));

        renderHistory();
    } catch (err) {
        console.error('Cloud load error:', err);
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (gameHistory.length === 0) {
        list.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }

    list.innerHTML = gameHistory.map(g => `
        <div class="history-item" onclick="viewHistoryGame('${g.id}')">
            <div class="history-item-header">
                <span class="history-config">${g.player_count}人 ${g.config_name} ${g.isCloud ? '☁️' : '📱'}</span>
                <span class="history-date">${g.date}</span>
            </div>
            <div class="history-item-stats">
                <span>💚${g.alive}存活</span>
                <span>🐺${g.wolves}狼</span>
                <span>😇${g.good}好人</span>
            </div>
            <button class="history-delete" onclick="event.stopPropagation(); deleteHistory('${g.id}', ${g.isCloud || false})">🗑️</button>
        </div>
    `).join('');
}

async function viewHistoryGame(id) {
    const game = gameHistory.find(g => String(g.id) === String(id));
    if (!game) return;

    for (const count in GAME_CONFIGS) {
        const cfg = GAME_CONFIGS[count].find(c => c.name === game.config_name);
        if (cfg) {
            selectedConfig = cfg;
            selectedPlayerCount = parseInt(count);
            break;
        }
    }

    players = game.players;
    hasSheriff = game.has_sheriff;
    document.getElementById('gameNotes').value = game.notes || '';

    showGame();
    renderPlayers();
    updateStats();
}

async function deleteHistory(id, isCloud) {
    if (!confirm('删除这条记录？')) return;

    if (isCloud && currentUser && supabase) {
        try {
            await supabase.from('game_history').delete().eq('id', id);
            await loadCloudHistory();
        } catch (err) {
            console.error('Delete error:', err);
        }
    } else {
        gameHistory = gameHistory.filter(g => String(g.id) !== String(id));
        localStorage.setItem('werewolfHistory', JSON.stringify(gameHistory));
        renderHistory();
    }
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

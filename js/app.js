// ============================================
// 家庭健康守护 — 主应用逻辑
// ============================================

let appData = null;
let currentPage = 'dashboard';

function initApp() {
    appData = loadData();
    renderSidebar();
    switchPage('dashboard');
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    const member = getActiveMember(appData);
    sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="app-logo">💚</div>
      <h2 class="app-name">健康守护</h2>
    </div>
    <div class="member-list">
      ${appData.members.map(m => `
        <button class="member-btn ${m.id === appData.activeMemberId ? 'active' : ''}"
                onclick="selectMember('${m.id}')" title="${m.name}">
          <span class="member-avatar">${m.avatar}</span>
          <span class="member-name">${m.name}</span>
          ${m.id === appData.activeMemberId ? '<span class="member-active-dot"></span>' : ''}
        </button>
      `).join('')}
      <button class="member-btn add-btn" onclick="showAddMemberModal()">
        <span class="member-avatar">＋</span>
        <span class="member-name">添加</span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <button class="nav-btn ${currentPage === 'dashboard' ? 'active' : ''}" onclick="switchPage('dashboard')">
        <span>🏠</span><span>仪表盘</span>
      </button>
      <button class="nav-btn ${currentPage === 'tracker' ? 'active' : ''}" onclick="switchPage('tracker')">
        <span>📊</span><span>习惯追踪</span>
      </button>
      <button class="nav-btn ${currentPage === 'knowledge' ? 'active' : ''}" onclick="switchPage('knowledge')">
        <span>📚</span><span>知识库</span>
      </button>
    </nav>
    <div class="sidebar-footer">
      <button class="nav-btn" onclick="showSettings()">
        <span>⚙️</span><span>设置</span>
      </button>
    </div>`;
}

function switchPage(page) {
    currentPage = page;
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    main.className = 'main-content fade-in';
    appData = loadData();
    if (page === 'dashboard') renderDashboard(main, appData);
    else if (page === 'tracker') renderTracker(main, appData);
    else if (page === 'knowledge') renderKnowledge(main, appData);
    renderSidebar();
}

function selectMember(id) {
    appData.activeMemberId = id;
    saveData(appData);
    switchPage(currentPage);
}

function showAddMemberModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-add-member';
    modal.innerHTML = `
    <div class="modal">
      <h3>添加家庭成员</h3>
      <div class="form-group"><label>称呼</label><input id="new-name" class="input" placeholder="例：奶奶"></div>
      <div class="form-group"><label>头像 Emoji</label><input id="new-avatar" class="input" value="👤" maxlength="2"></div>
      <div class="form-group"><label>年龄</label><input id="new-age" class="input" type="number" placeholder="65"></div>
      <div class="form-group"><label>身高(cm)</label><input id="new-height" class="input" type="number" placeholder="160"></div>
      <div class="form-group"><label>体重(kg)</label><input id="new-weight" class="input" type="number" placeholder="55"></div>
      <div class="form-group"><label>下次体检日期</label><input id="new-checkup" class="input" type="date"></div>
      <div class="modal-btns">
        <button class="btn btn-outline" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveNewMember()">保存</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function saveNewMember() {
    const name = document.getElementById('new-name').value.trim();
    if (!name) { showToast('请输入称呼'); return; }
    const data = loadData();
    addMember(data, {
        name,
        avatar: document.getElementById('new-avatar').value || '👤',
        age: parseInt(document.getElementById('new-age').value) || 0,
        height: parseInt(document.getElementById('new-height').value) || 0,
        weight: parseInt(document.getElementById('new-weight').value) || 0,
        checkupDate: document.getElementById('new-checkup').value || ''
    });
    closeModal();
    appData = data;
    switchPage(currentPage);
    showToast('成员已添加 ✓');
}

function closeModal() {
    const m = document.querySelector('.modal-overlay');
    if (m) { m.classList.remove('show'); setTimeout(() => m.remove(), 300); }
}

function showSettings() {
    const member = getActiveMember(appData);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
    <div class="modal">
      <h3>⚙️ ${member.avatar} ${member.name} 的信息</h3>
      <div class="form-group"><label>称呼</label><input id="edit-name" class="input" value="${member.name}"></div>
      <div class="form-group"><label>头像</label><input id="edit-avatar" class="input" value="${member.avatar}" maxlength="2"></div>
      <div class="form-group"><label>年龄</label><input id="edit-age" class="input" type="number" value="${member.age}"></div>
      <div class="form-group"><label>身高(cm)</label><input id="edit-height" class="input" type="number" value="${member.height}"></div>
      <div class="form-group"><label>体重(kg)</label><input id="edit-weight" class="input" type="number" value="${member.weight}"></div>
      <div class="form-group"><label>下次体检</label><input id="edit-checkup" class="input" type="date" value="${member.checkupDate}"></div>
      <div class="modal-btns">
        <button class="btn btn-danger" onclick="confirmDelete('${member.id}')">删除成员</button>
        <button class="btn btn-outline" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveEditMember('${member.id}')">保存</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function saveEditMember(id) {
    const data = loadData();
    updateMember(data, id, {
        name: document.getElementById('edit-name').value.trim(),
        avatar: document.getElementById('edit-avatar').value,
        age: parseInt(document.getElementById('edit-age').value) || 0,
        height: parseInt(document.getElementById('edit-height').value) || 0,
        weight: parseInt(document.getElementById('edit-weight').value) || 0,
        checkupDate: document.getElementById('edit-checkup').value
    });
    closeModal();
    appData = data;
    switchPage(currentPage);
    showToast('信息已更新 ✓');
}

function confirmDelete(id) {
    if (appData.members.length <= 1) { showToast('至少保留一位家庭成员'); return; }
    if (confirm('确定要删除这位成员吗？相关记录也会保留。')) {
        const data = loadData();
        deleteMember(data, id);
        appData = data;
        closeModal();
        switchPage(currentPage);
        showToast('已删除');
    }
}

// Mobile sidebar toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', initApp);

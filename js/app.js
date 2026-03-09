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
                onclick="selectMember('${escapeHtml(m.id)}')" title="${escapeHtml(m.name)}">
          <span class="member-avatar">${escapeHtml(m.avatar)}</span>
          <span class="member-name">${escapeHtml(m.name)}</span>
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
      <button class="nav-btn" onclick="showFeedback()">
        <span>💬</span><span>意见反馈</span>
      </button>
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
  addMember(data, validateMemberInput({
    name,
    avatar: document.getElementById('new-avatar').value,
    age: document.getElementById('new-age').value,
    height: document.getElementById('new-height').value,
    weight: document.getElementById('new-weight').value,
    checkupDate: document.getElementById('new-checkup').value
  }));
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
      <h3>⚙️ ${escapeHtml(member.avatar)} ${escapeHtml(member.name)} 的信息</h3>
      <div class="form-group"><label>称呼</label><input id="edit-name" class="input" value="${escapeHtml(member.name)}"></div>
      <div class="form-group"><label>头像</label><input id="edit-avatar" class="input" value="${escapeHtml(member.avatar)}" maxlength="2"></div>
      <div class="form-group"><label>年龄</label><input id="edit-age" class="input" type="number" min="0" max="150" value="${member.age}"></div>
      <div class="form-group"><label>身高(cm)</label><input id="edit-height" class="input" type="number" min="50" max="250" value="${member.height}"></div>
      <div class="form-group"><label>体重(kg)</label><input id="edit-weight" class="input" type="number" min="10" max="300" value="${member.weight}"></div>
      <div class="form-group"><label>下次体检</label><input id="edit-checkup" class="input" type="date" value="${member.checkupDate}"></div>
      <div class="modal-btns">
        <button class="btn btn-danger" onclick="confirmDelete('${escapeHtml(member.id)}')">删除成员</button>
        <button class="btn btn-outline" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveEditMember('${escapeHtml(member.id)}')">保存</button>
      </div>
      <div style="border-top:1px solid var(--card-border);margin-top:16px;padding-top:16px">
        <div class="card-title">💾 数据管理</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline" style="flex:1" onclick="exportData()">📥 导出备份</button>
          <label class="btn btn-outline" style="flex:1;text-align:center;cursor:pointer">📤 导入恢复<input type="file" accept=".json" style="display:none" onchange="importData(this.files[0])"></label>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}

function saveEditMember(id) {
  const data = loadData();
  updateMember(data, id, validateMemberInput({
    name: document.getElementById('edit-name').value,
    avatar: document.getElementById('edit-avatar').value,
    age: document.getElementById('edit-age').value,
    height: document.getElementById('edit-height').value,
    weight: document.getElementById('edit-weight').value,
    checkupDate: document.getElementById('edit-checkup').value
  }));
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

// Quick record modal - accessible from dashboard
function showQuickRecord() {
  const data = loadData();
  const member = getActiveMember(data);
  const rec = getTodayRecord(data, member.id);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
  <div class="modal modal-wide">
    <h3>📝 ${member.avatar} ${member.name} · 今日记录</h3>
    <div class="quick-form-grid">
      <div class="form-group">
        <label>😴 睡眠时长</label>
        <div class="slider-row">
          <input type="range" id="qr-sleep" min="0" max="12" step="0.5" value="${rec ? rec.sleep : 7}">
          <span id="qr-val-sleep">${rec ? rec.sleep : 7}h</span>
        </div>
      </div>
      <div class="form-group">
        <label>🏃 运动时长</label>
        <div class="slider-row">
          <input type="range" id="qr-exercise" min="0" max="120" step="5" value="${rec ? rec.exercise : 30}">
          <span id="qr-val-exercise">${rec ? rec.exercise : 30}min</span>
        </div>
      </div>
      <div class="form-group">
        <label>💧 饮水杯数</label>
        <div class="slider-row">
          <input type="range" id="qr-water" min="0" max="15" step="1" value="${rec ? rec.water : 4}">
          <span id="qr-val-water">${rec ? rec.water : 4}杯</span>
        </div>
      </div>
      <div class="form-group">
        <label>🍽️ 饮食评分</label>
        <div class="slider-row">
          <input type="range" id="qr-diet" min="1" max="5" step="1" value="${rec ? rec.diet : 3}">
          <span id="qr-val-diet">${rec ? rec.diet : 3}/5</span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>心情</label>
      <div class="mood-select">
        ${['😢', '😟', '😐', '🙂', '😄'].map((e, i) => `
          <button type="button" class="mood-btn ${(rec ? rec.mood : 3) === i + 1 ? 'active' : ''}" data-mood="${i + 1}" onclick="selectQuickMood(${i + 1})">${e}</button>
        `).join('')}
      </div>
    </div>
    <div class="modal-btns">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveQuickRecord()">保存记录</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
  // Slider live updates
  ['sleep', 'exercise', 'water', 'diet'].forEach(key => {
    const inp = document.getElementById('qr-' + key);
    const val = document.getElementById('qr-val-' + key);
    if (inp && val) {
      const units = { sleep: 'h', exercise: 'min', water: '杯', diet: '/5' };
      inp.addEventListener('input', () => { val.textContent = inp.value + units[key]; });
    }
  });
}

let quickMood = 3;
function selectQuickMood(val) {
  quickMood = val;
  document.querySelectorAll('.modal .mood-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.mood) === val);
  });
}

function saveQuickRecord() {
  const data = loadData();
  const member = getActiveMember(data);
  const today = new Date().toISOString().slice(0, 10);
  const existing = data.records.findIndex(r => r.memberId === member.id && r.date === today);
  const rec = {
    memberId: member.id, date: today,
    sleep: parseFloat(document.getElementById('qr-sleep').value),
    exercise: parseInt(document.getElementById('qr-exercise').value),
    water: parseInt(document.getElementById('qr-water').value),
    diet: parseInt(document.getElementById('qr-diet').value),
    mood: quickMood
  };
  if (existing >= 0) { rec.id = data.records[existing].id; data.records[existing] = rec; }
  else { rec.id = Date.now().toString(); data.records.push(rec); }
  saveData(data);
  closeModal();
  appData = data;
  switchPage(currentPage);
  showToast('记录已保存 ✓');
}

// Feedback / suggestion collection
function showFeedback() {
  const data = loadData();
  const member = getActiveMember(data);
  const feedbacks = data.feedbacks || [];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
  <div class="modal modal-wide">
    <h3>💬 意见与建议</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:16px">家人的反馈帮助我们不断改善健康管理方式</p>
    <div class="form-group">
      <label>提交人</label>
      <span style="color:var(--green)">${escapeHtml(member.avatar)} ${escapeHtml(member.name)}</span>
    </div>
    <div class="form-group">
      <label>类型</label>
      <div class="feedback-types">
        <button class="fb-type active" data-type="suggestion" onclick="selectFbType(this)">💡 建议</button>
        <button class="fb-type" data-type="problem" onclick="selectFbType(this)">🐛 问题</button>
        <button class="fb-type" data-type="praise" onclick="selectFbType(this)">👍 表扬</button>
      </div>
    </div>
    <div class="form-group">
      <label>内容</label>
      <textarea id="fb-content" class="input" rows="3" placeholder="请输入您的建议或反馈..."></textarea>
    </div>
    <button class="btn btn-primary btn-block" onclick="submitFeedback()">提交反馈</button>
    ${feedbacks.length ? `
      <div class="fb-history">
        <div class="card-title" style="margin-top:20px">📋 历史反馈 (${feedbacks.length})</div>
        ${feedbacks.slice(-5).reverse().map(f => `
          <div class="fb-item">
            <div class="fb-meta">${escapeHtml(f.memberName)} · ${escapeHtml(f.date)} · ${f.type === 'suggestion' ? '💡建议' : f.type === 'problem' ? '🐛问题' : '👍表扬'}</div>
            <div class="fb-text">${escapeHtml(f.content)}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    <div class="modal-btns" style="margin-top:16px">
      <button class="btn btn-outline" onclick="closeModal()">关闭</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}

let fbType = 'suggestion';
function selectFbType(btn) {
  document.querySelectorAll('.fb-type').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fbType = btn.dataset.type;
}

function submitFeedback() {
  const content = document.getElementById('fb-content').value.trim();
  if (!content) { showToast('请输入反馈内容'); return; }
  const data = loadData();
  const member = getActiveMember(data);
  if (!data.feedbacks) data.feedbacks = [];
  data.feedbacks.push({
    id: Date.now().toString(),
    memberId: member.id,
    memberName: member.name,
    type: fbType,
    content: content,
    date: new Date().toISOString().slice(0, 10)
  });
  saveData(data);
  closeModal();
  showFeedback();
  showToast('感谢您的反馈 ✓');
}

// Mobile sidebar toggle
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', initApp);

// ============================================
// 家庭健康守护 — 习惯追踪页面
// ============================================

function renderTracker(container, data) {
    const member = getActiveMember(data);
    const todayRec = getTodayRecord(data, member.id);
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    // Calendar cells
    let calCells = '';
    for (let i = 0; i < firstDay; i++) calCells += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const rec = data.records.find(r => r.memberId === member.id && r.date === ds);
        const isToday = d === now.getDate();
        let dot = 'none';
        if (rec) {
            const s = calcHealthScore([rec]);
            dot = s >= 80 ? 'green' : s >= 60 ? 'yellow' : 'red';
        }
        calCells += `<div class="cal-cell ${isToday ? 'today' : ''}" data-date="${ds}">
      <span>${d}</span>
      ${dot !== 'none' ? `<div class="cal-dot ${dot}"></div>` : ''}
    </div>`;
    }

    container.innerHTML = `
    <div class="page-header">
      <h1>习惯追踪</h1>
      <span class="subtitle">${member.avatar} ${member.name} · ${monthNames[month]}</span>
    </div>
    <div class="tracker-grid">
      <div class="card card-calendar">
        <div class="card-title">📅 ${year}年${month + 1}月</div>
        <div class="cal-header">
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div class="cal-grid">${calCells}</div>
        <div class="cal-legend">
          <span><span class="cal-dot green inline"></span> 优秀</span>
          <span><span class="cal-dot yellow inline"></span> 一般</span>
          <span><span class="cal-dot red inline"></span> 待改善</span>
        </div>
      </div>
      <div class="card card-record-form">
        <div class="card-title">📝 今日记录</div>
        <form id="record-form" onsubmit="submitRecord(event)">
          <div class="form-group">
            <label>😴 睡眠时长</label>
            <div class="slider-row">
              <input type="range" id="inp-sleep" min="0" max="12" step="0.5" value="${todayRec ? todayRec.sleep : 7}">
              <span id="val-sleep">${todayRec ? todayRec.sleep : 7}h</span>
            </div>
          </div>
          <div class="form-group">
            <label>🏃 运动时长</label>
            <div class="slider-row">
              <input type="range" id="inp-exercise" min="0" max="120" step="5" value="${todayRec ? todayRec.exercise : 30}">
              <span id="val-exercise">${todayRec ? todayRec.exercise : 30}min</span>
            </div>
          </div>
          <div class="form-group">
            <label>💧 饮水杯数</label>
            <div class="slider-row">
              <input type="range" id="inp-water" min="0" max="15" step="1" value="${todayRec ? todayRec.water : 4}">
              <span id="val-water">${todayRec ? todayRec.water : 4}杯</span>
            </div>
          </div>
          <div class="form-group">
            <label>🍽️ 饮食评分</label>
            <div class="slider-row">
              <input type="range" id="inp-diet" min="1" max="5" step="1" value="${todayRec ? todayRec.diet : 3}">
              <span id="val-diet">${todayRec ? todayRec.diet : 3}/5</span>
            </div>
          </div>
          <div class="form-group">
            <label>心情</label>
            <div class="mood-select">
              ${['😢', '😟', '😐', '🙂', '😄'].map((e, i) => `
                <button type="button" class="mood-btn ${(todayRec ? todayRec.mood : 3) === i + 1 ? 'active' : ''}" data-mood="${i + 1}" onclick="selectMood(${i + 1})">${e}</button>
              `).join('')}
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">${todayRec ? '更新记录' : '保存记录'}</button>
        </form>
      </div>
      <div class="card card-trend">
        <div class="card-title">📈 近7天趋势</div>
        <canvas id="chart-trend" class="line-canvas-lg"></canvas>
      </div>
      <div class="card card-stats">
        <div class="card-title">📊 本月统计</div>
        <div id="month-stats"></div>
      </div>
    </div>`;

    // Slider live update
    ['sleep', 'exercise', 'water', 'diet'].forEach(key => {
        const inp = document.getElementById('inp-' + key);
        const val = document.getElementById('val-' + key);
        if (inp && val) {
            const units = { sleep: 'h', exercise: 'min', water: '杯', diet: '/5' };
            inp.addEventListener('input', () => { val.textContent = inp.value + units[key]; });
        }
    });

    // Draw trend chart
    requestAnimationFrame(() => {
        const canvas = document.getElementById('chart-trend');
        if (canvas) {
            const labels = [], scores = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
                const ds = d.toISOString().slice(0, 10);
                const r = data.records.find(rec => rec.memberId === member.id && rec.date === ds);
                scores.push(r ? calcHealthScore([r]) : 0);
            }
            drawLineChart(canvas, labels, scores, '#00d4aa');
        }

        // Month stats
        const statsEl = document.getElementById('month-stats');
        if (statsEl) {
            const monthRecs = data.records.filter(r => {
                return r.memberId === member.id && r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
            });
            const avgSleep = monthRecs.length ? (monthRecs.reduce((s, r) => s + r.sleep, 0) / monthRecs.length).toFixed(1) : '-';
            const avgExercise = monthRecs.length ? Math.round(monthRecs.reduce((s, r) => s + r.exercise, 0) / monthRecs.length) : '-';
            const totalWater = monthRecs.reduce((s, r) => s + r.water, 0);
            const recordDays = monthRecs.length;
            statsEl.innerHTML = `
        <div class="stat-grid">
          <div class="stat-item"><div class="stat-value">${recordDays}</div><div class="stat-label">记录天数</div></div>
          <div class="stat-item"><div class="stat-value">${avgSleep}</div><div class="stat-label">平均睡眠(h)</div></div>
          <div class="stat-item"><div class="stat-value">${avgExercise}</div><div class="stat-label">平均运动(min)</div></div>
          <div class="stat-item"><div class="stat-value">${totalWater}</div><div class="stat-label">总饮水(杯)</div></div>
        </div>`;
        }
    });
}

let selectedMood = 3;
function selectMood(val) {
    selectedMood = val;
    document.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.mood) === val);
    });
}

function submitRecord(e) {
    e.preventDefault();
    const data = loadData();
    const member = getActiveMember(data);
    const today = new Date().toISOString().slice(0, 10);
    const existing = data.records.findIndex(r => r.memberId === member.id && r.date === today);
    const rec = {
        memberId: member.id,
        date: today,
        sleep: parseFloat(document.getElementById('inp-sleep').value),
        exercise: parseInt(document.getElementById('inp-exercise').value),
        water: parseInt(document.getElementById('inp-water').value),
        diet: parseInt(document.getElementById('inp-diet').value),
        mood: selectedMood
    };
    if (existing >= 0) {
        rec.id = data.records[existing].id;
        data.records[existing] = rec;
    } else {
        rec.id = Date.now().toString();
        data.records.push(rec);
    }
    saveData(data);
    renderTracker(document.getElementById('main-content'), data);
    showToast('记录已保存 ✓');
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000);
}

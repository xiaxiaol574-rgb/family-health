// ============================================
// 家庭健康守护 — 仪表盘页面
// ============================================

function renderDashboard(container, data) {
  const member = getActiveMember(data);
  const records = getRecords(data, member.id, 7);
  const score = calcHealthScore(records);
  const bmi = calcBMI(member.height, member.weight);
  const bmiStatus = getBMIStatus(bmi);
  const checkupDays = daysUntilCheckup(member.checkupDate);
  const todayRec = getTodayRecord(data, member.id);

  container.innerHTML = `
    <div class="page-header">
      <h1>健康概览</h1>
      <span class="subtitle">${member.avatar} ${member.name} 的健康状态</span>
    </div>
    <div class="dashboard-grid">
      <div class="card card-score" id="card-score">
        <div class="card-title">健康评分</div>
        <canvas id="chart-score" class="ring-canvas"></canvas>
      </div>
      <div class="card card-bmi">
        <div class="card-title">BMI 指数</div>
        <div class="bmi-value" style="color:${bmiStatus.color}">${bmi}</div>
        <div class="bmi-label" style="color:${bmiStatus.color}">${bmiStatus.label}</div>
        <div class="bmi-detail">${member.height}cm / ${member.weight}kg</div>
      </div>
      <div class="card card-water" id="card-water">
        <div class="card-title">今日饮水</div>
        <canvas id="chart-water" class="water-canvas"></canvas>
        <div class="water-btns">
          <button class="btn-sm btn-water-minus" onclick="adjustWater(-1)">−</button>
          <button class="btn-sm btn-water-plus" onclick="adjustWater(1)">+</button>
        </div>
      </div>
      <div class="card card-checkup">
        <div class="card-title">体检提醒</div>
        <div class="checkup-days ${checkupDays <= 30 ? 'urgent' : ''}">${checkupDays > 0 ? checkupDays : '已过期'}</div>
        <div class="checkup-label">${checkupDays > 0 ? '天后体检' : '请尽快安排'}</div>
        <div class="checkup-date">📅 ${member.checkupDate || '未设置'}</div>
      </div>
      <div class="card card-activity">
        <div class="card-title">本周活动</div>
        <canvas id="chart-activity" class="bar-canvas"></canvas>
      </div>
      <div class="card card-sleep">
        <div class="card-title">睡眠趋势</div>
        <canvas id="chart-sleep" class="line-canvas"></canvas>
      </div>
      <div class="card card-today">
        <div class="card-title">今日记录</div>
        ${todayRec ? `
          <div class="today-stats">
            <div class="today-item"><span class="today-icon">😴</span><span>${todayRec.sleep}h</span></div>
            <div class="today-item"><span class="today-icon">🏃</span><span>${todayRec.exercise}min</span></div>
            <div class="today-item"><span class="today-icon">💧</span><span>${todayRec.water}杯</span></div>
            <div class="today-item"><span class="today-icon">${['😢', '😟', '😐', '🙂', '😄'][todayRec.mood - 1] || '😐'}</span><span>心情</span></div>
          </div>
          <button class="btn btn-outline btn-block" style="margin-top:12px" onclick="showQuickRecord()">✏️ 修改今日记录</button>
        ` : `
          <div class="today-empty">
            <div class="today-empty-icon">📝</div>
            <p>今天还没有记录</p>
            <button class="btn btn-primary btn-lg pulse-btn" onclick="showQuickRecord()">✨ 快速记录今天的状态</button>
          </div>
        `}
      </div>
      <div class="card card-quick">
        <div class="card-title">快捷入口</div>
        <div class="quick-links">
          <button class="quick-link" onclick="showQuickRecord()">📝 快速记录</button>
          <button class="quick-link" onclick="switchPage('tracker')">📊 习惯追踪</button>
          <button class="quick-link" onclick="switchPage('knowledge')">🚑 急救指南</button>
          <button class="quick-link" onclick="switchPage('knowledge')">💊 家庭药箱</button>
        </div>
      </div>
    </div>`;

  // Draw charts after DOM render
  requestAnimationFrame(() => {
    const scoreCanvas = document.getElementById('chart-score');
    if (scoreCanvas) drawRingChart(scoreCanvas, score, 100, score >= 80 ? '#00d4aa' : score >= 60 ? '#ffd93d' : '#ff6b6b', '/ 100');

    const waterCanvas = document.getElementById('chart-water');
    if (waterCanvas) drawWaterDrop(waterCanvas, todayRec ? todayRec.water : 0, 8, '#4fc3f7');

    const actCanvas = document.getElementById('chart-activity');
    if (actCanvas) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const last7 = [];
      const exerciseData = [], sleepData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        last7.push('周' + days[d.getDay()]);
        const r = data.records.find(rec => rec.memberId === member.id && rec.date === ds);
        exerciseData.push(r ? r.exercise : 0);
        sleepData.push(r ? r.sleep : 0);
      }
      drawBarChart(actCanvas, last7, [
        { data: exerciseData, color: '#00d4aa' },
        { data: sleepData, color: '#7c5cfc' }
      ]);
    }

    const sleepCanvas = document.getElementById('chart-sleep');
    if (sleepCanvas) {
      const labels = [], sleepVals = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        labels.push((d.getMonth() + 1) + '/' + d.getDate());
        const r = data.records.find(rec => rec.memberId === member.id && rec.date === ds);
        sleepVals.push(r ? r.sleep : 0);
      }
      drawLineChart(sleepCanvas, labels, sleepVals, '#7c5cfc');
    }
  });
}

function adjustWater(delta) {
  const data = loadData();
  const member = getActiveMember(data);
  let rec = getTodayRecord(data, member.id);
  if (!rec) {
    rec = addRecord(data, { memberId: member.id, sleep: 0, exercise: 0, water: 0, diet: 3, mood: 3 });
  } else {
    rec.water = Math.max(0, (rec.water || 0) + delta);
    saveData(data);
  }
  renderDashboard(document.getElementById('main-content'), data);
}

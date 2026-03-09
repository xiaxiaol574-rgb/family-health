// ============================================
// 家庭健康守护 — 健康知识库页面
// ============================================

const FIRST_AID_GUIDES = [
  { icon: '❤️', title: '心肺复苏 (CPR)', steps: ['确认环境安全，拍打双肩呼唤伤者', '拨打120急救电话', '仰头抬颏开放气道', '胸外按压：双手交叉，按压胸骨中下段', '频率：100-120次/分钟，深度5-6cm', '每30次按压后给2次人工呼吸', '持续到专业救援到达'] },
  { icon: '🔥', title: '烫伤处理', steps: ['冲：冷水冲洗15-20分钟', '脱：小心脱去覆盖衣物', '泡：冷水中浸泡10-30分钟', '盖：用干净纱布覆盖', '送：严重烫伤立即就医', '⚠️ 不要涂牙膏、酱油等偏方'] },
  { icon: '🦴', title: '骨折急救', steps: ['不要移动伤肢', '用夹板或硬物固定伤处', '开放性骨折用干净布覆盖伤口', '冰敷减轻肿胀（不直接接触皮肤）', '立即拨打120或送医'] },
  { icon: '⚡', title: '触电急救', steps: ['先切断电源或用绝缘物移除电源', '不要直接用手触碰触电者', '检查意识和呼吸', '无呼吸立即CPR', '有烧伤用干净布覆盖', '拨打120'] },
  { icon: '💊', title: '中毒处理', steps: ['确定中毒类型和时间', '保留毒物样本或包装', '拨打120或中毒热线', '如清醒且非腐蚀性中毒，可催吐', '⚠️ 腐蚀性中毒禁止催吐', '等待专业救援'] },
  { icon: '🩸', title: '外伤止血', steps: ['用干净纱布直接压迫伤口', '抬高受伤部位', '持续按压至少15分钟', '如渗透纱布，再加一层（不要移除）', '严重出血用止血带', '拨打120'] }
];

const SEASONAL_TIPS = {
  spring: { season: '🌸 春季', tips: ['预防花粉过敏，外出戴口罩', '注意倒春寒，适时增减衣物', '多吃新鲜蔬菜补充维生素', '适当户外运动，增强免疫力'] },
  summer: { season: '☀️ 夏季', tips: ['注意防暑降温，多饮水', '防蚊虫叮咬', '注意食品卫生防止腹泻', '防晒：涂防晒霜，避免正午暴晒'] },
  autumn: { season: '🍂 秋季', tips: ['注意保湿润燥，多喝水', '预防秋季感冒，注意温差', '适当进补但不过量', '注意心血管疾病预防'] },
  winter: { season: '❄️ 冬季', tips: ['注意保暖，预防感冒流感', '室内通风换气', '冬季进补：羊肉、红枣等', '适当运动，不宜过早晨练'] }
};

const HEALTH_RESOURCES = [
  {
    cat: '🏥 在线问诊', links: [
      { name: '丁香医生', url: 'https://dxy.com', desc: '专业医学科普与健康咨询' },
      { name: '好大夫在线', url: 'https://www.haodf.com', desc: '找医生、问诊、预约挂号' },
      { name: '微医', url: 'https://www.guahao.com', desc: '互联网医院，在线问诊' }
    ]
  },
  {
    cat: '🏋️ 运动健身', links: [
      { name: 'Keep', url: 'https://www.gotokeep.com', desc: '运动课程、健身计划' },
      { name: 'B站健身区', url: 'https://www.bilibili.com/v/sports', desc: '免费健身教程视频' },
      { name: '薄荷健康', url: 'https://www.boohee.com', desc: '运动与饮食记录工具' }
    ]
  },
  {
    cat: '🍎 营养饮食', links: [
      { name: '下厨房', url: 'https://www.xiachufang.com', desc: '健康食谱与烹饪教程' },
      { name: '中国营养学会', url: 'https://www.cnsoc.org', desc: '权威营养指南与膳食标准' },
      { name: '食物营养查询', url: 'https://www.boohee.com/food', desc: '查询食物热量与营养成分' }
    ]
  },
  {
    cat: '📖 健康科普', links: [
      { name: '中国疾控中心', url: 'https://www.chinacdc.cn', desc: '疾病预防与公共卫生信息' },
      { name: '医学微视', url: 'https://www.mvyxws.com', desc: '院士专家讲解医学知识' },
      { name: '世界卫生组织', url: 'https://www.who.int/zh', desc: '全球健康资讯与指南' }
    ]
  },
  {
    cat: '🧘 心理健康', links: [
      { name: '壹心理', url: 'https://www.xinli001.com', desc: '心理咨询与心理测评' },
      { name: '简单心理', url: 'https://www.jiandanxinli.com', desc: '专业心理咨询平台' }
    ]
  }
];

function getCurrentSeason(month) {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function renderKnowledge(container, data) {
  const season = getCurrentSeason(new Date().getMonth());
  const tip = SEASONAL_TIPS[season];

  container.innerHTML = `
    <div class="page-header">
      <h1>健康知识库</h1>
      <span class="subtitle">急救指南 · 家庭药箱 · 季节贴士</span>
    </div>
    <div class="knowledge-grid">
      <div class="card card-season">
        <div class="card-title">${tip.season} 健康贴士</div>
        <ul class="tip-list">${tip.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="card card-medicine">
        <div class="card-title">💊 家庭药箱</div>
        <div class="medicine-list" id="medicine-list">
          ${data.medicines.map(m => {
    const expiring = isExpiringSoon(m.expiryDate);
    const expired = new Date(m.expiryDate) < new Date();
    return `<div class="med-item ${expired ? 'expired' : expiring ? 'expiring' : ''}">
              <div class="med-info">
                <span class="med-name">${m.name}</span>
                <span class="med-cat">${m.category}</span>
              </div>
              <div class="med-meta">
                <span class="med-qty">×${m.quantity}</span>
                <span class="med-exp ${expired ? 'text-red' : expiring ? 'text-yellow' : ''}">${expired ? '已过期' : m.expiryDate}</span>
              </div>
              <button class="btn-icon" onclick="removeMedicine('${m.id}')">🗑️</button>
            </div>`;
  }).join('')}
        </div>
        <button class="btn btn-outline btn-block" onclick="showAddMedicine()">+ 添加药品</button>
        <div id="add-med-form" class="add-med-form hidden">
          <input id="med-name" placeholder="药品名称" class="input">
          <input id="med-qty" type="number" placeholder="数量" class="input input-sm">
          <input id="med-cat" placeholder="分类" class="input">
          <input id="med-exp" type="date" class="input">
          <button class="btn btn-primary btn-sm" onclick="saveMedicine()">保存</button>
        </div>
      </div>
      <div class="card card-firstaid card-full">
        <div class="card-title">🚑 急救指南</div>
        <div class="firstaid-grid">
          ${FIRST_AID_GUIDES.map(g => `
            <div class="guide-card" onclick="this.classList.toggle('expanded')">
              <div class="guide-header">
                <span class="guide-icon">${g.icon}</span>
                <span class="guide-title">${g.title}</span>
                <span class="guide-expand">▼</span>
              </div>
              <ol class="guide-steps">${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card card-resources card-full">
        <div class="card-title">🔗 健康资源导航</div>
        <div class="resources-grid">
          ${HEALTH_RESOURCES.map(cat => `
            <div class="resource-category">
              <div class="resource-cat-title">${cat.cat}</div>
              <div class="resource-links">
                ${cat.links.map(l => `
                  <a href="${l.url}" target="_blank" rel="noopener" class="resource-link" title="${l.desc}">
                    <span class="resource-name">${l.name}</span>
                    <span class="resource-desc">${l.desc}</span>
                    <span class="resource-arrow">↗</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function showAddMedicine() {
  document.getElementById('add-med-form').classList.toggle('hidden');
}

function saveMedicine() {
  const name = document.getElementById('med-name').value.trim();
  const qty = parseInt(document.getElementById('med-qty').value) || 1;
  const cat = document.getElementById('med-cat').value.trim() || '其他';
  const exp = document.getElementById('med-exp').value;
  if (!name || !exp) { showToast('请填写药品名称和有效期'); return; }
  const data = loadData();
  addMedicine(data, { name, quantity: qty, category: cat, expiryDate: exp });
  renderKnowledge(document.getElementById('main-content'), data);
  showToast('药品已添加 ✓');
}

function removeMedicine(id) {
  const data = loadData();
  deleteMedicine(data, id);
  renderKnowledge(document.getElementById('main-content'), data);
  showToast('已删除');
}

// ============================================
// 家庭健康守护 — 数据层 (localStorage)
// ============================================

const STORAGE_KEY = 'health_guardian_data';

const DEFAULT_DATA = {
    members: [
        { id: '1', name: '爸爸', avatar: '👨', age: 45, height: 175, weight: 72, checkupDate: '2026-06-15' },
        { id: '2', name: '妈妈', avatar: '👩', age: 43, height: 162, weight: 58, checkupDate: '2026-06-15' },
        { id: '3', name: '儿子', avatar: '👦', age: 18, height: 178, weight: 65, checkupDate: '2026-09-01' },
        { id: '4', name: '女儿', avatar: '👧', age: 15, height: 163, weight: 50, checkupDate: '2026-09-01' }
    ],
    records: [],
    medicines: [
        { id: '1', name: '布洛芬', quantity: 10, expiryDate: '2027-03-01', category: '退烧止痛' },
        { id: '2', name: '创可贴', quantity: 20, expiryDate: '2028-01-01', category: '外伤护理' },
        { id: '3', name: '碘伏', quantity: 1, expiryDate: '2027-06-01', category: '外伤护理' },
        { id: '4', name: '感冒灵', quantity: 8, expiryDate: '2027-01-15', category: '感冒用药' }
    ],
    activeMemberId: '1'
};

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('数据加载失败，使用默认数据', e);
    }
    const data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData(data);
    return data;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getMember(data, id) {
    return data.members.find(m => m.id === id);
}

function getActiveMember(data) {
    return getMember(data, data.activeMemberId) || data.members[0];
}

function addMember(data, member) {
    member.id = Date.now().toString();
    data.members.push(member);
    saveData(data);
    return member;
}

function updateMember(data, id, updates) {
    const m = getMember(data, id);
    if (m) Object.assign(m, updates);
    saveData(data);
}

function deleteMember(data, id) {
    data.members = data.members.filter(m => m.id !== id);
    if (data.activeMemberId === id && data.members.length > 0) {
        data.activeMemberId = data.members[0].id;
    }
    saveData(data);
}

function addRecord(data, record) {
    record.id = Date.now().toString();
    record.date = record.date || new Date().toISOString().slice(0, 10);
    data.records.push(record);
    saveData(data);
    return record;
}

function getRecords(data, memberId, days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return data.records
        .filter(r => r.memberId === memberId && r.date >= cutoffStr)
        .sort((a, b) => a.date.localeCompare(b.date));
}

function getTodayRecord(data, memberId) {
    const today = new Date().toISOString().slice(0, 10);
    return data.records.find(r => r.memberId === memberId && r.date === today);
}

function calcBMI(height, weight) {
    if (!height || !weight) return 0;
    const h = height / 100;
    return +(weight / (h * h)).toFixed(1);
}

function getBMIStatus(bmi) {
    if (bmi < 18.5) return { label: '偏瘦', color: '#ffd93d' };
    if (bmi < 24) return { label: '正常', color: '#00d4aa' };
    if (bmi < 28) return { label: '偏胖', color: '#ff9f43' };
    return { label: '肥胖', color: '#ff6b6b' };
}

function calcHealthScore(records) {
    if (!records.length) return 60;
    let total = 0;
    records.forEach(r => {
        let s = 0;
        if (r.sleep >= 7 && r.sleep <= 9) s += 25; else if (r.sleep >= 6) s += 15; else s += 5;
        if (r.exercise >= 30) s += 25; else if (r.exercise >= 15) s += 15; else s += 5;
        if (r.water >= 8) s += 25; else if (r.water >= 5) s += 15; else s += 5;
        if (r.mood >= 4) s += 25; else if (r.mood >= 3) s += 15; else s += 5;
        total += s;
    });
    return Math.round(total / records.length);
}

function daysUntilCheckup(dateStr) {
    if (!dateStr) return -1;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function addMedicine(data, med) {
    med.id = Date.now().toString();
    data.medicines.push(med);
    saveData(data);
}

function deleteMedicine(data, id) {
    data.medicines = data.medicines.filter(m => m.id !== id);
    saveData(data);
}

function isExpiringSoon(dateStr, withinDays = 90) {
    const diff = new Date(dateStr) - new Date();
    return diff / (1000 * 60 * 60 * 24) <= withinDays;
}

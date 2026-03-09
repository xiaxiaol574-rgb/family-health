// ============================================
// 家庭健康守护 — Canvas 图表工具
// ============================================

function drawRingChart(canvas, value, max, color, label) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const cw = w / 4, ch = h / 4, r = Math.min(cw, ch) - 12, lw = 10;
    const pct = Math.min(value / max, 1);

    ctx.clearRect(0, 0, w, h);
    // bg ring
    ctx.beginPath();
    ctx.arc(cw, ch, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = lw;
    ctx.stroke();
    // value ring
    ctx.beginPath();
    ctx.arc(cw, ch, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
    // center text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${r * 0.5}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, cw, ch - 6);
    if (label) {
        ctx.font = `${r * 0.22}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(label, cw, ch + r * 0.35);
    }
}

function drawBarChart(canvas, labels, datasets) {
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    const w = canvas.width = canvas.offsetWidth * dpr;
    const h = canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const cw = w / dpr, ch = h / dpr;
    const pad = { top: 20, right: 15, bottom: 30, left: 35 };
    const plotW = cw - pad.left - pad.right;
    const plotH = ch - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    const allVals = datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allVals, 1) * 1.15;

    // Y axis lines
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + plotH * (1 - i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(cw - pad.right, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * i / 4), pad.left - 5, y + 3);
    }

    const n = labels.length;
    const groupW = plotW / n;
    const barW = Math.min(groupW * 0.3, 16);
    const totalBars = datasets.length;

    datasets.forEach((ds, di) => {
        ds.data.forEach((val, i) => {
            const barH = (val / maxVal) * plotH;
            const x = pad.left + i * groupW + groupW / 2 - (totalBars * barW) / 2 + di * barW;
            const y = pad.top + plotH - barH;
            ctx.fillStyle = ds.color;
            ctx.beginPath();
            ctx.roundRect(x, y, barW - 2, barH, [3, 3, 0, 0]);
            ctx.fill();
        });
    });

    // X labels
    labels.forEach((lbl, i) => {
        const x = pad.left + i * groupW + groupW / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '10px "Noto Sans SC"';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, x, ch - 8);
    });
}

function drawLineChart(canvas, labels, data, color) {
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    const w = canvas.width = canvas.offsetWidth * dpr;
    const h = canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const cw = w / dpr, ch = h / dpr;
    const pad = { top: 20, right: 15, bottom: 30, left: 35 };
    const plotW = cw - pad.left - pad.right;
    const plotH = ch - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    if (!data.length) return;

    const maxVal = Math.max(...data, 1) * 1.15;
    const minVal = 0;
    const range = maxVal - minVal;

    // Grid
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + plotH * (1 - i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(cw - pad.right, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(minVal + range * i / 4), pad.left - 5, y + 3);
    }

    // Line + gradient fill
    const pts = data.map((v, i) => ({
        x: pad.left + (i / (data.length - 1 || 1)) * plotW,
        y: pad.top + plotH * (1 - (v - minVal) / range)
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + plotH);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0e27';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });

    // X labels
    labels.forEach((lbl, i) => {
        const x = pad.left + (i / (labels.length - 1 || 1)) * plotW;
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '10px "Noto Sans SC"';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, x, ch - 8);
    });
}

function drawWaterDrop(canvas, current, goal, color) {
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    const w = canvas.width = canvas.offsetWidth * dpr;
    const h = canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const cw = w / dpr, ch = h / dpr;
    const pct = Math.min(current / goal, 1);

    ctx.clearRect(0, 0, w, h);
    const cx = cw / 2, cy = ch / 2 + 5, size = Math.min(cw, ch) * 0.35;

    // Drop path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 1.3);
    ctx.bezierCurveTo(cx + size * 0.1, cy - size, cx + size, cy - size * 0.2, cx + size, cy + size * 0.1);
    ctx.bezierCurveTo(cx + size, cy + size * 0.7, cx + size * 0.5, cy + size, cx, cy + size);
    ctx.bezierCurveTo(cx - size * 0.5, cy + size, cx - size, cy + size * 0.7, cx - size, cy + size * 0.1);
    ctx.bezierCurveTo(cx - size, cy - size * 0.2, cx - size * 0.1, cy - size, cx, cy - size * 1.3);
    ctx.closePath();
    ctx.clip();

    // bg
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, cw, ch);

    // water fill
    const fillTop = cy + size - pct * size * 2.3;
    ctx.fillStyle = color + '55';
    ctx.fillRect(0, fillTop, cw, ch);
    ctx.restore();

    // outline
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 1.3);
    ctx.bezierCurveTo(cx + size * 0.1, cy - size, cx + size, cy - size * 0.2, cx + size, cy + size * 0.1);
    ctx.bezierCurveTo(cx + size, cy + size * 0.7, cx + size * 0.5, cy + size, cx, cy + size);
    ctx.bezierCurveTo(cx - size * 0.5, cy + size, cx - size, cy + size * 0.7, cx - size, cy + size * 0.1);
    ctx.bezierCurveTo(cx - size, cy - size * 0.2, cx - size * 0.1, cy - size, cx, cy - size * 1.3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size * 0.45}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(current, cx, cy);
    ctx.font = `${size * 0.25}px "Noto Sans SC"`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`/ ${goal} 杯`, cx, cy + size * 0.45);
}

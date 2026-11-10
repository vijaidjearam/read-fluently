/**
 * Progress Charts Engine for ReadFluently
 * 
 * High-definition HTML5 Canvas charts with zero external dependencies.
 * Visualizes WPM progression and text comprehension metrics.
 */

class ReadingProgressCharts {
    /**
     * Draw the WPM Progression Line Chart
     */
    static renderWpmChart(canvasId, sessions, targetWpm = 75) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Handle high-DPI retina screens
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        if (!sessions || sessions.length === 0) {
            ctx.fillStyle = "#8892b0";
            ctx.font = "14px 'Nunito', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("No reading sessions recorded yet. Start reading to see your WPM chart!", width / 2, height / 2);
            return;
        }

        const padding = { top: 30, right: 30, bottom: 45, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Data points (take latest 15 sessions)
        const recentSessions = sessions.slice(-15);
        const wpmValues = recentSessions.map(s => s.wpm || 0);
        const maxVal = Math.max(...wpmValues, targetWpm, 40) + 15;
        const minVal = 0;

        // Y-axis grid lines
        const ySteps = 4;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.lineWidth = 1;
        ctx.font = "11px 'Nunito', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "right";

        for (let i = 0; i <= ySteps; i++) {
            const val = Math.round(minVal + (maxVal - minVal) * (i / ySteps));
            const y = padding.top + chartHeight - (i / ySteps) * chartHeight;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillText(`${val} wpm`, padding.left - 8, y + 4);
        }

        // Draw Target WPM Reference Line
        if (targetWpm) {
            const targetY = padding.top + chartHeight - ((targetWpm - minVal) / (maxVal - minVal)) * chartHeight;
            ctx.save();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#eab308"; // Golden amber
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding.left, targetY);
            ctx.lineTo(width - padding.right, targetY);
            ctx.stroke();

            ctx.fillStyle = "#ca8a04";
            ctx.font = "bold 11px 'Nunito', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`Target: ${targetWpm} WPM 🎯`, padding.left + 8, targetY - 6);
            ctx.restore();
        }

        // Coordinates for points
        const points = recentSessions.map((s, idx) => {
            const x = padding.left + (idx / Math.max(recentSessions.length - 1, 1)) * chartWidth;
            const y = padding.top + chartHeight - ((s.wpm - minVal) / (maxVal - minVal)) * chartHeight;
            return { x, y, session: s };
        });

        // Fill area gradient under the curve
        if (points.length > 0) {
            const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            grad.addColorStop(0, "rgba(59, 130, 246, 0.35)");
            grad.addColorStop(1, "rgba(59, 130, 246, 0.0)");

            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartHeight);
            ctx.lineTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = "#2563eb"; // Vibrant blue
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        points.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Draw Data Point Circles and X-axis Labels
        ctx.textAlign = "center";
        points.forEach((pt, idx) => {
            // Circle
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#2563eb";
            ctx.stroke();

            // Value label above dot
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 11px 'Nunito', sans-serif";
            ctx.fillText(pt.session.wpm, pt.x, pt.y - 9);

            // Date below X-axis
            const dt = new Date(pt.session.date);
            const dateLabel = `${dt.getMonth() + 1}/${dt.getDate()}`;
            ctx.fillStyle = "#64748b";
            ctx.font = "10px 'Nunito', sans-serif";
            ctx.fillText(dateLabel, pt.x, height - padding.bottom + 18);
        });
    }

    /**
     * Draw Comprehension & Accuracy Bar Chart
     */
    static renderMetricsChart(canvasId, sessions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        if (!sessions || sessions.length === 0) {
            ctx.fillStyle = "#8892b0";
            ctx.font = "14px 'Nunito', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("No comprehension records yet.", width / 2, height / 2);
            return;
        }

        const padding = { top: 25, right: 25, bottom: 45, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Take last 8 sessions
        const recent = sessions.slice(-8);
        const groupWidth = chartWidth / recent.length;
        const barWidth = Math.min(groupWidth * 0.32, 22);

        // Grid lines (0%, 25%, 50%, 75%, 100%)
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.lineWidth = 1;
        ctx.font = "10px 'Nunito', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "right";

        for (let pct = 0; pct <= 100; pct += 25) {
            const y = padding.top + chartHeight - (pct / 100) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText(`${pct}%`, padding.left - 6, y + 4);
        }

        recent.forEach((s, idx) => {
            const centerX = padding.left + (idx + 0.5) * groupWidth;
            const compScore = s.comprehensionScore !== undefined ? s.comprehensionScore : 100;
            const accuracy = s.accuracy !== undefined ? s.accuracy : 100;

            // Bar 1: Comprehension (Green)
            const compHeight = (compScore / 100) * chartHeight;
            const compY = padding.top + chartHeight - compHeight;
            ctx.fillStyle = "#10b981"; // Emerald green
            this.roundRect(ctx, centerX - barWidth - 2, compY, barWidth, compHeight, 4);

            // Bar 2: Accuracy (Purple)
            const accHeight = (accuracy / 100) * chartHeight;
            const accY = padding.top + chartHeight - accHeight;
            ctx.fillStyle = "#8b5cf6"; // Violet purple
            this.roundRect(ctx, centerX + 2, accY, barWidth, accHeight, 4);

            // Date label
            const dt = new Date(s.date);
            const dateLabel = `${dt.getMonth() + 1}/${dt.getDate()}`;
            ctx.fillStyle = "#64748b";
            ctx.font = "10px 'Nunito', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(dateLabel, centerX, height - padding.bottom + 18);
        });
    }

    static roundRect(ctx, x, y, width, height, radius) {
        if (height < 2) return;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

window.ReadingProgressCharts = ReadingProgressCharts;

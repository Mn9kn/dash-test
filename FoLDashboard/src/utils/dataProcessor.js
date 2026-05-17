// src/utils/dataProcessor.js
export const fetchSummaryData = async () => {
    try {
        const response = await fetch('/summary.json');
        const text = await response.text();
        const lines = text.split('\n');

        const data = lines.map(line => {
            const cols = line.split(',');
            if (cols.length < 6) return null;

            return {
                District: cols[0].trim(),
                total_items: parseInt(cols[1] || 0),
                healthy_count: parseInt(cols[2] || 0),
                unhealthy_count: parseInt(cols[3] || 0),
                healthy_pct: parseFloat(cols[4] || 0),
                unhealthy_pct: parseFloat(cols[5] || 0),
                avg_calories: parseFloat(cols[6] || 0), // تأكد أن الكويري يخرج السعرات هنا
                restaurant_count: parseInt(cols[7] || 0)
            };
        }).filter(item => item !== null);
        return data;
    } catch (e) { return []; }
};
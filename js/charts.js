function drawProjectChart(projectData) {
    const svg = document.getElementById("project-chart");
    const height = 350;
    const barWidth = 80;
    const spacing = 70;

    svg.innerHTML = "";

    const data = [
        { label: "Passed", value: projectData.passed },
        { label: "Failed", value: projectData.failed }
    ];

    const maxValue = Math.max(...data.map(item => item.value));

    data.forEach((item, index) => {
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const barHeight = maxValue > 0 ? (item.value / maxValue) * 250 : 0;
        const x = index * (barWidth + spacing) + 50;
        const y = height - barHeight - 50;

        bar.setAttribute("x", x);
        bar.setAttribute("y", y);
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);

        svg.appendChild(bar);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.textContent = item.label;
        label.setAttribute("x", x + barWidth / 2);
        label.setAttribute("y", height - 20);
        label.setAttribute("text-anchor", "middle");

        svg.appendChild(label);

        const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
        value.textContent = item.value;
        value.setAttribute("x", x + barWidth / 2);
        value.setAttribute("y", y - 10);
        value.setAttribute("text-anchor", "middle");

        svg.appendChild(value);
    });
}

function drawXpChart(transactions) {
    const svg = document.getElementById("xp-chart");
    const height = 350;

    svg.innerHTML = "";

    const totalXP = transactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
    );

    const chartTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
    chartTitle.textContent = `Total XP: ${formatBytes(totalXP)}`;
    chartTitle.setAttribute("x", 50);
    chartTitle.setAttribute("y", 30);
    chartTitle.setAttribute("font-weight", "bold");

    svg.appendChild(chartTitle);

    const xpByDate = {};

    transactions.forEach(transaction => {
        const date = transaction.createdAt.split("T")[0];

        if (!xpByDate[date]) {
            xpByDate[date] = 0;
        }

        xpByDate[date] += transaction.amount;
    });

    let runningXP = 0;
    const points = [];

    Object.keys(xpByDate)
        .sort()
        .forEach((date, index) => {
            runningXP += xpByDate[date];

            points.push({
                x: index,
                y: runningXP,
                date: date
            });
        });

    if (points.length < 2) {
        return;
    }

    const maxXP = Math.max(...points.map(point => point.y));

    const chartPoints = points.map(point => ({
        x: (point.x / (points.length - 1)) * 600 + 50,
        y: height - (point.y / maxXP) * 250 - 50,
        date: point.date,
        xp: point.y
    }));

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 50);
    xAxis.setAttribute("y1", 300);
    xAxis.setAttribute("x2", 650);
    xAxis.setAttribute("y2", 300);
    xAxis.setAttribute("stroke", "black");

    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 50);
    yAxis.setAttribute("y1", 50);
    yAxis.setAttribute("x2", 50);
    yAxis.setAttribute("y2", 300);
    yAxis.setAttribute("stroke", "black");

    svg.appendChild(yAxis);

    let pathData = "";

    chartPoints.forEach((point, index) => {
        pathData += index === 0
            ? `M ${point.x} ${point.y}`
            : ` L ${point.x} ${point.y}`;
    });

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", pathData);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "1");

    svg.appendChild(line);

    chartPoints.forEach(point => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 3);

        svg.appendChild(circle);
    });
}

const savedToken = localStorage.getItem("token");

if (!savedToken || !checkTokenExpiry()) {
    window.location.href = "index.html";
}

if (!checkTokenExpiry()) {
    throw new Error("Token expired");
}

const usernameElement = document.getElementById("username");
const userIdElement = document.getElementById("user-id");
const xpElement = document.getElementById("xp-value");
const projectsElement = document.getElementById("projects-value");
const auditElement = document.getElementById("audit-value");
const levelElement = document.getElementById("level-value");
const gradesTableElement = document.getElementById("grades-table");
const logoutButton = document.getElementById("logout-btn");

let userId;



function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return `${Math.round(bytes / Math.pow(1000, index))} ${units[index]}`;
}

async function loadUserData() {
    const query = `
    {
        user {
            id
            login
            firstName
            lastName
        }
    }`;

    const response = await fetchGraphQL(query);
    const item = response.data.user[0];
    userId = item.id;

    userIdElement.textContent = item.id;
    usernameElement.textContent = `Welcome ${item.firstName} ${item.lastName}`;
}

async function loadXp() {
    const startQuery = `
    {
        transaction(
            where: {
                type: { _eq: "xp" }
                object: { name: { _eq: "go-reloaded" } }
            }
        ) {
            createdAt
        }
    }`;

    const startResponse = await fetchGraphQL(startQuery);

    if (!startResponse.data.transaction.length) {
        console.error("Go Reloaded transaction not found");
        return;
    }

    const goReloadedDate = startResponse.data.transaction[0].createdAt;

    const query = `
    {
        transaction(
            where: {
                type: { _eq: "xp" }
                createdAt: { _gte: "${goReloadedDate}" }
                _or: [
                    { object: { type: { _eq: "project" } } }
                    { object: { type: { _eq: "piscine" } } }
                    {
                        object: { type: { _eq: "exercise" } }
                        path: { _ilike: "%/checkpoint/%" }
                    }
                ]
            }
            order_by: { createdAt: desc }
        ) {
            id
            amount
            createdAt
            path
            object {
                id
                name
                type
            }
        }
    }`;

    const response = await fetchGraphQL(query);
    console.log("loadXp raw response:", response);

    if (!response.data) {
        console.error("loadXp GraphQL error message:", response.errors?.[0]?.message);
        console.error("loadXp full error object:", JSON.stringify(response.errors, null, 2));
        return;
    }

    const transactions = response.data.transaction;
    let totalXP = 0;

    transactions.forEach(transaction => {
        totalXP += transaction.amount;
    });

    xpElement.textContent = formatBytes(totalXP);
    drawXpChart(transactions);
}

async function loadProjects() {
    const query = `
    {
        progress(
            where: { userId: { _eq: ${userId} } }
            order_by: { createdAt: desc }
        ) {
            grade
            createdAt
            object {
                name
                type
            }
        }
    }`;

    const response = await fetchGraphQL(query);
    const projects = response.data.progress;

    const completedProjects = new Set();
    const uniqueProjects = new Map();

    let failedProjects = 0;
    let pendingProjects = 0;

    projects.forEach(project => {
        if (!project.object || project.object.type !== "project") {
            return;
        }

        const projectName = project.object.name;

        if (project.grade >= 1) {
            completedProjects.add(projectName);
        } else if (project.grade === 0) {
            failedProjects++;
        } else {
            pendingProjects++;
        }

        if (!uniqueProjects.has(projectName)) {
            uniqueProjects.set(projectName, project);
        }
    });

    projectsElement.textContent = completedProjects.size;

    drawProjectChart({
        passed: completedProjects.size,
        failed: failedProjects,
        pending: pendingProjects
    });

    gradesTableElement.innerHTML = "";

    const recentProjects = Array.from(uniqueProjects.values());

    recentProjects.forEach(project => {
        const row = document.createElement("tr");
        const projectCell = document.createElement("td");
        const gradeCell = document.createElement("td");
        const statusCell = document.createElement("td");

        projectCell.textContent = project.object.name;
        gradeCell.textContent = project.grade;

        if (project.grade === null) {
            statusCell.textContent = "Pending";
        } else if (project.grade >= 1) {
            statusCell.textContent = "Passed";
        } else {
            statusCell.textContent = "Failed";
        }

        row.appendChild(projectCell);
        row.appendChild(gradeCell);
        row.appendChild(statusCell);

        gradesTableElement.appendChild(row);
    });
}

async function loadAudit() {
    const query = `
    {
        transaction(
            where: { type: { _in: ["up", "down"] } }
        ) {
            type
            amount
        }
    }`;

    const response = await fetchGraphQL(query);
    const transactions = response.data.transaction;

    let totalUp = 0;
    let totalDown = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "up") {
            totalUp += transaction.amount;
        } else {
            totalDown += transaction.amount;
        }
    });

    const auditRatio = totalDown ? totalUp / totalDown : 0;
    auditElement.textContent = auditRatio.toFixed(1);
}

async function loadCurrentLevel() {
    const query = `
{
  transaction(
    where: {
      type: { _eq: "level" }
      path: { _ilike: "%/bahrain/bh-module/%" }
    }
    order_by: { createdAt: desc }
    limit: 1
  ) {
    amount
  }
}`;

    const response = await fetchGraphQL(query);
    const transactions = response.data.transaction;

    if (transactions.length > 0) {
        levelElement.textContent = transactions[0].amount;
    }
}

async function loadProfile() {
    try {
        await loadUserData();
    } catch (err) {
        console.error("loadUserData failed:", err);
    }

    try {
        await loadXp();
    } catch (err) {
        console.error("loadXp failed:", err);
    }

    try {
        await loadProjects();
    } catch (err) {
        console.error("loadProjects failed:", err);
    }

    try {
        await loadAudit();
    } catch (err) {
        console.error("loadAudit failed:", err);
    }

    try {
        await loadCurrentLevel();
    } catch (err) {
        console.error("loadCurrentLevel failed:", err);
    }
}

loadProfile();

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});
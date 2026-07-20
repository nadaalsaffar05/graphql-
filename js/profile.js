const savedToken = localStorage.getItem("token");

if (!savedToken) {
    window.location.href = "login.html";
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



async function loadUserData() {

    const query = `
    {
        user {
            id
            login
        }
    }`;

    const response = await fetchGraphQL(query);

    const item = response.data.user[0];

    userId = item.id;

    userIdElement.textContent = item.id;
    usernameElement.textContent = item.login;

}



async function loadXp() {

    const query = `
    {
        transaction(
            where: {
                type: {
                    _eq: "xp"
                }
            }
        ) {
            amount
            createdAt
        }
    }`;

    const response = await fetchGraphQL(query);

    const transactions = response.data.transaction;

    let totalXP = 0;

    transactions.forEach(transaction => {
        totalXP += transaction.amount;
    });

    xpElement.textContent = totalXP;
    drawXpChart(transactions);

}


async function loadProjects() {

    const query = `
    {
        progress(
            where: {
                userId: {
                    _eq: ${userId}
                }
            }
            order_by: {
                createdAt: desc
            }
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


        // Count completed projects
        if (project.grade >= 1) {

            completedProjects.add(projectName);

        } 
        
        else if (project.grade === 0) {

            failedProjects++;

        } 
        
        else {

            pendingProjects++;

        }



        // Keep latest attempt only
        if (!uniqueProjects.has(projectName)) {
            uniqueProjects.set(projectName, project);
        }

    });

    projectsElement.textContent = completedProjects.size;


    // send data to chart
    drawProjectChart({

        passed: completedProjects.size,

        failed: failedProjects,

        pending: pendingProjects

    });


    // Update card
    projectsElement.textContent = completedProjects.size;


    // Clear table
    gradesTableElement.innerHTML = "";


    // Show latest 10 projects
    const recentProjects = Array.from(uniqueProjects.values()).slice(0, 10);


    recentProjects.forEach(project => {

        const row = document.createElement("tr");


        const projectCell = document.createElement("td");
        const gradeCell = document.createElement("td");
        const statusCell = document.createElement("td");


        projectCell.textContent = project.object.name;
        gradeCell.textContent = project.grade;
        if (project.grade === null) {
        statusCell.textContent = "Pending";
     } 
        else if (project.grade >= 1) {
        statusCell.textContent = "Passed";
   } 
        else {
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
            where: {
                type: {
                    _in: ["up", "down"]
                }
            }
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
        } 
        
        else {
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
                type: {
                    _eq: "level"
                }
            }
            order_by: {
                amount: desc
            }
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

    await loadUserData();

    await loadXp();

    await loadProjects();

    await loadAudit();

    await loadCurrentLevel();

}



loadProfile();


logoutButton.addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location.href = "login.html";

});
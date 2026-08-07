const loginButton = document.getElementById("login-btn");

if (loginButton) {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error");

    loginButton.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        errorMessage.textContent = "";

        if (!username || !password) {
            errorMessage.textContent = "Username and password are required";
            return;
        }

        const credentials = btoa(`${username}:${password}`);

        try {
            const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                errorMessage.textContent = "Invalid username or password";
                return;
            }

            const token = await response.json();

            if (typeof token !== "string" || !token) {
                errorMessage.textContent = "Invalid username or password";
                return;
            }

            localStorage.setItem("token", token);
            window.location.href = "profile.html";

        } catch (error) {
            console.error("Login request failed:", error);
            errorMessage.textContent = "Something went wrong";
        }
    });
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function checkTokenExpiry() {
    const token = localStorage.getItem("token");

    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;

        if (Date.now() >= expiry) {
            logout();
            return false;
        }

        return true;
    } catch (error) {
        logout();
        return false;
    }
}

setInterval(checkTokenExpiry, 60000);
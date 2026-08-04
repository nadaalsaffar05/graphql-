const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-btn");
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

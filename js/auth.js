const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-btn");
const errorMessage = document.getElementById("error");


loginButton.addEventListener("click", () => {

    const username = usernameInput.value;
    const password = passwordInput.value;

    const credentials = btoa(`${username}:${password}`);

    console.log(username);
    console.log(password);
    console.log(credentials);

    fetch("https://learn.reboot01.com/api/auth/signin", {

        method: "POST",

        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
        }

    })

    .then(response => response.json())

    .then(data => {

        console.log(data);


        if (data) {

            localStorage.setItem("token", data);

            window.location.href = "profile.html";


        } else {

            errorMessage.textContent = "Invalid username or password";

        }

    })

    .catch(error => {

        console.log(error);

        errorMessage.textContent = "Something went wrong";

    });

});
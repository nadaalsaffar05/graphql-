const token = localStorage.getItem("token");
const endpoint = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

async function fetchGraphQL(query) {

    const response = await fetch(endpoint, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify({
            query: query
        })
    });
    const data = await response.json();
    return data;

}

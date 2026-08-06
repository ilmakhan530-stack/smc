import { app } from "./firebase-config.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login Successful");

        window.location.href = "dashboard.html";

    } catch (error) {

        alert(error.message);

    }

});

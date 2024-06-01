import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import app from '/initializeFirebase.js';

const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Disable the login button to prevent further clicks
    loginBtn.disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const auth = getAuth(app);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const user = userCredential.user.uid;
        console.log(user);

        // Redirect to the dashboard page after a successful login
        location.href = '/dashboard.html';
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        // Re-enable the login button and handle the error
        loginBtn.disabled = false;
        alert(errorMessage);
    }
});

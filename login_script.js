
const firebaseConfig = {
    apiKey: "AIzaSyCAKoW_qCM9gF9k_vFvLOOpDORsFAfOgOQ",
    authDomain: "hpcl-campaign-live.firebaseapp.com",
    databaseURL: "https://hpcl-campaign-live-default-rtdb.firebaseio.com",
    projectId: "hpcl-campaign-live",
    storageBucket: "hpcl-campaign-live.firebasestorage.app",
    messagingSenderId: "843304288801",
    appId: "1:843304288801:web:3130a50baad7efa427d960",
    measurementId: "G-CDQDF0Z040"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const appCheck = firebase.appCheck();
appCheck.activate(
    '6LcWPgwsAAAAABmtXNz6XlIH_gAysJictdngUHKY',
    true
);
const auth = firebase.auth();


const glassContainer = document.querySelector('.glass-container');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const rememberMeCheckbox = document.getElementById('remember-me-checkbox');
const errorMessage = document.getElementById('error-message');
const formTooltip = document.getElementById('form-tooltip');

loginButton.addEventListener('mouseover', () => {
    const emailValue = emailInput.value;
    const passwordValue = passwordInput.value;

    if (!emailValue) {
        const direction = Math.random() < 0.5 ? '-150%' : '50%';
        loginButton.style.transform = `translateX(${direction})`;
        formTooltip.textContent = 'Please enter username first!';
        formTooltip.classList.add('visible');
    } else if (!passwordValue) {
        const direction = Math.random() < 0.5 ? '-150%' : '50%';
        loginButton.style.transform = `translateX(${direction})`;
        formTooltip.textContent = 'Now, please enter the password!';
        formTooltip.classList.add('visible');
    }
});

loginButton.addEventListener('mouseout', () => {
    loginButton.style.transform = 'translateX(0)';
    formTooltip.classList.remove('visible');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMessage.style.display = 'none';
    glassContainer.classList.remove('shake');

    loginButton.disabled = true;
    loginButton.textContent = 'Logging In...';

    if (!email || !password) {
        glassContainer.classList.add('shake');
        errorMessage.textContent = 'Both fields are required!';
        errorMessage.style.display = 'block';
        
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
        return;
    }

    const persistence = rememberMeCheckbox.checked 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;

    auth.setPersistence(persistence)
        .then(() => auth.signInWithEmailAndPassword(email, password))
        .then((userCredential) => {
            const user = userCredential.user;
            const adminDocRef = db.collection('admin_roles').doc(user.uid);
            return adminDocRef.get();
        })
        .then(doc => {
            if (doc.exists) {
                const assignedArea = doc.data().area;
                const targetArea = (assignedArea === 'all') ? 'akola' : assignedArea;
                window.location.href = `index.html?role=admin&area=${targetArea}`;
            } else {
                auth.signOut();
                throw new Error("Permission Denied");
            }
        })
        .catch((error) => {
            glassContainer.classList.add('shake');
            if(error.message === "Permission Denied"){
                 errorMessage.textContent = 'You do not have permission to access this page.';
            } else {
                 errorMessage.textContent = 'Oops! Something went wrong. Please try again!';
            }
            errorMessage.style.display = 'block';
            setTimeout(() => { glassContainer.classList.remove('shake'); }, 500);

            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        });
});
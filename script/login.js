const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

const DEMO_USER = {
  username: 'admin',
  password: 'admin123',
};

if (localStorage.getItem('issueTrackerAuth') === 'true') {
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get('username')).trim();
  const password = String(formData.get('password')).trim();

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    localStorage.setItem('issueTrackerAuth', 'true');
    loginMessage.textContent = 'Login successful. Redirecting...';
    loginMessage.className = 'form-message success';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);

    return;
  }

  loginMessage.textContent = 'Invalid username or password. Please use the demo credentials.';
  loginMessage.className = 'form-message error';
});

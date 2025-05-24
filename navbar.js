document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('header');
  if (!container) return;

  fetch('/header.html')
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      const user = JSON.parse(localStorage.getItem('user'));

      const loginLink    = document.getElementById('login-link');
      const registerLink = document.getElementById('register-link');
      const userDropdown = document.getElementById('user-dropdown');
      const navUsername  = document.getElementById('profile-username');
      const navEmail     = document.getElementById('profile-email');
      const logoutBtn    = document.getElementById('logout-button');
      const profileBtn   = document.getElementById('profile-btn');
      const profileCard  = document.getElementById('profile-card');

      if (user) {
        if (loginLink)    loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'inline-block';
        if (navUsername)  navUsername.textContent = user.username;
        if (navEmail)     navEmail.textContent = user.email || '(sin email)';

        if (profileBtn && profileCard) {
          profileBtn.addEventListener('click', () => {
            profileCard.classList.toggle('hidden');
          });
        }

        if (logoutBtn) {
          logoutBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = '/login.html';
          });
        }

      } else {
        if (loginLink)    loginLink.style.display = 'inline-block';
        if (registerLink) registerLink.style.display = 'inline-block';
        if (userDropdown) userDropdown.style.display = 'none';
      }
    });
});

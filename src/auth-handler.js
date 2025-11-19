// Authentication page handler
let authPageInitialized = false;

async function initAuthPage() {
  if (authPageInitialized) return;
  authPageInitialized = true;

  const authPage = document.getElementById('auth-page');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginFormElement = document.getElementById('login-form-element');
  const signupFormElement = document.getElementById('signup-form-element');
  const switchToSignupBtn = document.getElementById('switch-to-signup');
  const switchToLoginBtn = document.getElementById('switch-to-login');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  // Wait for auth manager to be ready
  if (typeof mapusDB === 'undefined') {
    await new Promise(resolve => {
      const checkDB = setInterval(() => {
        if (typeof mapusDB !== 'undefined') {
          clearInterval(checkDB);
          resolve();
        }
      }, 50);
    });
  }

  await mapusDB.init();
  const auth = getAuthManager(mapusDB);

  // Check if user is already logged in
  const currentUser = await auth.getCurrentUser();
  if (currentUser) {
    hideAuthPage();
    // Dispatch event for main.js
    window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: currentUser }));
    return;
  }

  // Show auth page
  showAuthPage();

  // Switch between login and signup
  switchToSignupBtn.addEventListener('click', () => {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    clearErrors();
  });

  switchToLoginBtn.addEventListener('click', () => {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    clearErrors();
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 2L18 18M10 4C6 4 3.27 6.11 2 9C3.27 11.89 6 14 10 14C14 14 16.73 11.89 18 9C16.73 6.11 14 4 10 4ZM10 12.5C8.07 12.5 6.5 10.93 6.5 9C6.5 7.07 8.07 5.5 10 5.5C11.93 5.5 13.5 7.07 13.5 9C13.5 10.93 11.93 12.5 10 12.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      } else {
        input.type = 'password';
        this.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4C6 4 3.27 6.11 2 9C3.27 11.89 6 14 10 14C14 14 16.73 11.89 18 9C16.73 6.11 14 4 10 4ZM10 12.5C8.07 12.5 6.5 10.93 6.5 9C6.5 7.07 8.07 5.5 10 5.5C11.93 5.5 13.5 7.07 13.5 9C13.5 10.93 11.93 12.5 10 12.5ZM10 7C9.17 7 8.5 7.67 8.5 8.5C8.5 9.33 9.17 10 10 10C10.83 10 11.5 9.33 11.5 8.5C11.5 7.67 10.83 7 10 7Z" fill="currentColor"/>
          </svg>
        `;
      }
    });
  });

  // Handle login form submission
  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = loginFormElement.querySelector('button[type="submit"]');

    if (!email || !password) {
      showError(loginError, 'Please fill in all fields');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    loginFormElement.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Signing in...';

    try {
      const result = await auth.signIn(email, password);
      // Success - hide auth page and reload
      hideAuthPage();
      // Trigger a custom event to notify main.js
      window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: result.user }));
      // Reload to initialize the app with the authenticated user
      window.location.reload();
    } catch (error) {
      showError(loginError, error.message || 'Failed to sign in. Please try again.');
    } finally {
      submitBtn.disabled = false;
      loginFormElement.classList.remove('loading');
      submitBtn.querySelector('span').textContent = 'Sign in';
    }
  });

  // Handle signup form submission
  signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = signupFormElement.querySelector('button[type="submit"]');

    if (!name || !email || !password) {
      showError(signupError, 'Please fill in all fields');
      return;
    }

    if (!terms) {
      showError(signupError, 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    signupFormElement.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Creating account...';

    try {
      const result = await auth.signUp(email, password, name);
      // Success - hide auth page and reload
      hideAuthPage();
      // Trigger a custom event to notify main.js
      window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: result.user }));
      // Reload to initialize the app with the authenticated user
      window.location.reload();
    } catch (error) {
      showError(signupError, error.message || 'Failed to create account. Please try again.');
    } finally {
      submitBtn.disabled = false;
      signupFormElement.classList.remove('loading');
      submitBtn.querySelector('span').textContent = 'Create account';
    }
  });

  function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => {
      errorElement.classList.remove('show');
    }, 5000);
  }

  function clearErrors() {
    loginError.classList.remove('show');
    signupError.classList.remove('show');
    loginError.textContent = '';
    signupError.textContent = '';
  }
}

function showAuthPage() {
  const authPage = document.getElementById('auth-page');
  if (authPage) {
    authPage.classList.remove('hidden');
  }
}

function hideAuthPage() {
  const authPage = document.getElementById('auth-page');
  if (authPage) {
    authPage.classList.add('hidden');
  }
}

// Initialize auth page when DOM is ready
// Use setTimeout to ensure all scripts are loaded
setTimeout(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthPage);
  } else {
    initAuthPage();
  }
}, 100);


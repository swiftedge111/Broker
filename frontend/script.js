class AuthForms {
    constructor() {
        this.forms = {
            login: document.getElementById('loginForm'),
            signup: document.getElementById('signupForm')
        };
        this.API_BASE_URL = window.API_BASE_URL || 'https://swift-edge-backend.onrender.com';
        this.init();
    }
    
    async init() {
        if (this.forms.login || this.forms.signup) {
            await this.loadSweetAlert();
            this.setupForms();
            this.setupPasswordVisibilityToggles();
        }
    }

    setupPasswordVisibilityToggles() {
        // Setup for all password toggle buttons
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            const input = toggle.closest('.input-group').querySelector('input[type="password"], input[type="text"]');
            toggle.addEventListener('click', () => this.togglePasswordVisibility(input, toggle));
        });
    }
    
    async loadSweetAlert() {
        try {
            if (typeof Swal === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
            }
        } catch (error) {
            console.error('Failed to load SweetAlert2:', error);
            window.showAlert = (title, text, icon) => {
                alert(`${icon ? icon.toUpperCase() + ': ' : ''}${title}\n\n${text}`);
            };
        }
    }
    
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    setupForms() {
        if (this.forms.login) {
            this.forms.login.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
        
        if (this.forms.signup) {
            this.forms.signup.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup();
            });
        }
    }
    
    togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const icon = toggle.querySelector('svg');
        icon.innerHTML = isPassword ? 
            '<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>' : 
            '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>';
        toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    }
    
    async handleLogin() {
        const form = this.forms.login;
        const btn = form.querySelector('#loginBtn');
        const originalBtnText = btn.innerHTML;
        const loginInput = form.querySelector('#loginEmail').value.trim();
        const password = form.querySelector('#loginPassword').value;
        
        // Clear previous errors
        this.clearFieldErrors(form);
        
        // Validate inputs
        if (!loginInput) {
            this.showFieldError(form.querySelector('#loginEmail'), 'Please enter your username or email');
            return;
        }
        
        if (!password) {
            this.showFieldError(form.querySelector('#loginPassword'), 'Please enter your password');
            return;
        }
        
        try {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Signing in...';
            btn.disabled = true;
            
            const response = await this.fetchWithTimeout(`${this.API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: loginInput, // Send as username (backend handles both cases)
                    password
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid login details');
            }
            
            const result = await response.json();
            
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("userData", JSON.stringify({
                username: result.username,
                fullName: result.fullName,
                email: result.email
            }));
            
            await this.showSuccess({
                title: 'Welcome back!',
                text: 'You have successfully signed in',
                timer: 1500,
                onClose: () => window.location.href = "welcome.html"
            });
        } catch (error) {
            console.error("Login error:", error);
            
            let errorMessage = "We couldn't sign you in";
            let resolution = "Please check your details and try again";
            
            if (error.name === 'AbortError') {
                errorMessage = "Connection timeout";
                resolution = "Please check your internet connection";
            } else if (error.message.includes('credentials') || 
                    error.message.includes('Invalid') || 
                    error.message.includes('not found')) {
                errorMessage = "Incorrect login details";
                resolution = "Check your username/email and password";
            }
            
            this.showError({
                title: errorMessage,
                text: resolution
            });
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    }
    
    async handleSignup() {
        const form = this.forms.signup;
        const btn = form.querySelector('#signupBtn');
        const originalBtnText = btn.innerHTML;
        
        const formData = {
            fullName: form.querySelector('#fullName').value.trim(),
            email: form.querySelector('#signupEmail').value.trim().toLowerCase(),
            username: form.querySelector('#signupUsername').value.trim().toLowerCase(),
            password: form.querySelector('#signupPassword').value,
            confirmPassword: form.querySelector('#confirmPassword').value,
            phone: form.querySelector('#phone').value.trim(),
            terms: form.querySelector('[name="terms"]').checked
        };
        
        // Clear previous errors
        this.clearFieldErrors(form);
        
        // Validate inputs
        if (!formData.fullName) {
            this.showFieldError(form.querySelector('#fullName'), 'Please enter your full name');
            return;
        }
        
        if (!formData.email) {
            this.showFieldError(form.querySelector('#signupEmail'), 'Please enter your email');
            return;
        } else if (!this.validateEmail(formData.email)) {
            this.showFieldError(form.querySelector('#signupEmail'), 'Please enter a valid email address');
            return;
        }
        
        if (!formData.username) {
            this.showFieldError(form.querySelector('#signupUsername'), 'Please choose a username');
            return;
        }
        
        if (!formData.password) {
            this.showFieldError(form.querySelector('#signupPassword'), 'Please create a password');
            return;
        } else if (!this.validatePassword(formData.password)) {
            this.showFieldError(form.querySelector('#signupPassword'), 'Password must contain at least 8 characters with one number and one special character');
            return;
        }
        
        if (!formData.confirmPassword) {
            this.showFieldError(form.querySelector('#confirmPassword'), 'Please confirm your password');
            return;
        } else if (formData.password !== formData.confirmPassword) {
            this.showFieldError(form.querySelector('#confirmPassword'), 'Passwords do not match');
            return;
        }
        
        if (!formData.terms) {
            this.showError({
                title: 'Terms and Conditions',
                text: 'You must agree to our terms and conditions to continue',
                type: 'warning'
            });
            return;
        }
        
        try {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Creating account...';
            btn.disabled = true;
            
            const { confirmPassword, terms, ...submitData } = formData;
            
            const response = await this.fetchWithTimeout(`${this.API_BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            
            const result = await response.json();
            
            await this.showSuccess({
                title: 'Welcome to SwiftEdge!',
                html: `<p>Your account has been successfully created.</p>
                      <p class="text-muted small mt-2">We've sent a welcome email to <strong>${formData.email}</strong></p>`,
                confirmButtonText: 'Continue to Login',
                onClose: () => window.location.href = "login.html"
            });
            
            form.reset();
        } catch (error) {
            console.error("Signup error:", error);
            
            let errorMessage = "We couldn't create your account";
            let resolution = "Please try again";
            
            if (error.name === 'AbortError') {
                errorMessage = "Connection timeout";
                resolution = "Please check your internet connection";
            } else if (error.message.includes('already exists')) {
                if (error.message.includes('email')) {
                    errorMessage = "Email already registered";
                    resolution = "Try logging in or use a different email";
                    this.showFieldError(form.querySelector('#signupEmail'), 'This email is already in use');
                } else if (error.message.includes('username')) {
                    errorMessage = "Username taken";
                    resolution = "Please choose a different username";
                    this.showFieldError(form.querySelector('#signupUsername'), 'Username not available');
                }
            }
            
            this.showError({
                title: errorMessage,
                text: resolution
            });
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    }
    
    async fetchWithTimeout(resource, options = {}) {
        const { timeout = 15000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal  
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }
    
    clearFieldErrors(form) {
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }
    
    showFieldError(inputElement, message) {
        const formGroup = inputElement.closest('.input-group') || inputElement.closest('.form-group');
        if (!formGroup) return;
        
        let errorElement = formGroup.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error text-danger mt-1 small';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        inputElement.classList.add('is-invalid');
        inputElement.focus();
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePassword(password) {
        const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return re.test(password);
    }
    
    showError({ title, text, type = 'error' }) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title,
                text,
                confirmButtonColor: '#4361ee',
            });
        } else {
            alert(`${title}\n\n${text}`);
        }
    }
    
    showSuccess({ title, text, html, timer, confirmButtonText, onClose }) {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                icon: 'success',
                title,
                text,
                html,
                showConfirmButton: !!confirmButtonText,
                confirmButtonText,
                timer,
                timerProgressBar: !!timer,
                willClose: onClose
            });
        } else {
            alert(`${title}\n\n${text || ''}`);
            if (onClose) onClose();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthForms();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed: ', err));
    });
}
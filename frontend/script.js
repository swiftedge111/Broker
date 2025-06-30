
class AuthForms {
    constructor() {
        this.forms = {
            login: document.getElementById('loginForm'),
            signup: document.getElementById('signupForm')
        };
        
        this.init();
    }
    
    async init() {
        if (this.forms.login || this.forms.signup) {
            await this.loadSweetAlert();
            this.setupForms();
        }
    }
    
    async loadSweetAlert() {
        try {
            if (typeof Swal === 'undefined') {
                await Promise.race([
                    this.loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                ]);
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
        // Login Form
        if (this.forms.login) {
            this.forms.login.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
            

            const togglePassword = this.forms.login.querySelector('.toggle-password');
            const passwordInput = this.forms.login.querySelector('#loginPassword');
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility(passwordInput, togglePassword));
        }
        
        // Signup Form
        if (this.forms.signup) {
            this.forms.signup.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup();
            });
            const passwordToggles = this.forms.signup.querySelectorAll('.toggle-password');
            passwordToggles.forEach(toggle => {
                const input = toggle.closest('.input-group').querySelector('input[type="password"]');
                toggle.addEventListener('click', () => this.togglePasswordVisibility(input, toggle));
            });
        }
    }
    
    togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const icon = toggle.querySelector('svg');
        if (isPassword) {
            icon.innerHTML = '<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>';
        } else {
            icon.innerHTML = '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>';
        }
        toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    }
    
    async handleLogin() {
        const form = this.forms.login;
        const btn = form.querySelector('#loginBtn');
        const loginInput = form.querySelector('#loginEmail').value.trim().toLowerCase();
        const password = form.querySelector('#loginPassword').value;
        if (!loginInput || !password) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        try {
            btn.classList.add('is-loading');
            btn.disabled = true;
            
            const loginData = {
                username: loginInput.includes('@') ? undefined : loginInput,
                email: loginInput.includes('@') ? loginInput : undefined,
                password
            };
            Object.keys(loginData).forEach(key => loginData[key] === undefined && delete loginData[key]);
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                signal: AbortSignal.timeout(10000) 
            });
            
            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem("authToken", result.token);
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Redirecting to Welcome Page...',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    willClose: () => {
                        window.location.href = "welcome.html";  
                    }
                });
            } else {
                throw new Error(result.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            this.showError(error.message || "Login failed. Please try again.");
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    }
    
    async handleSignup() {
        const form = this.forms.signup;
        const btn = form.querySelector('#signupBtn');
        
        // Form data collection with validation
        const formData = {
            fullName: form.querySelector('#fullName').value.trim(),
            email: form.querySelector('#signupEmail').value.trim().toLowerCase(),
            username: form.querySelector('#signupUsername').value.trim().toLowerCase(),
            password: form.querySelector('#signupPassword').value,
            confirmPassword: form.querySelector('#confirmPassword').value,
            phone: form.querySelector('#phone').value.trim(),
            terms: form.querySelector('[name="terms"]').checked
        };
        if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        if (!this.validateEmail(formData.email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (!this.validatePassword(formData.password)) {
            this.showError('Password must be at least 8 characters with one number and one special character');
            return;
        }
        
        // Validate terms agreement
        if (!formData.terms) {
            this.showError('You must agree to the terms and conditions');
            return;
        }
        
        try {
            btn.classList.add('is-loading');
            btn.disabled = true;
            const { confirmPassword, terms, ...submitData } = formData;
            
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
                signal: AbortSignal.timeout(15000)  
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Account Created!',
                    html: `
                        <p>Your account has been successfully created.</p>
                        <p class="text-sm text-gray-500 mt-2">A verification email has been sent to ${formData.email}</p>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Continue to Login your Account',
                    willClose: () => {
                        window.location.href = "login.html";
                    }
                });
                
                form.reset();
            } else {
                throw new Error(result.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            this.showError(error.message || "An error occurred during signup. Please try again.");
        } finally {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePassword(password) {
        const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return re.test(password);
    }
    
    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                confirmButtonColor: '#4361ee',
            });
        } else {
            alert(`Error: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthForms();
});

// Service Worker Registration for Performance
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
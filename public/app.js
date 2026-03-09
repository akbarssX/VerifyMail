const emailForm = document.getElementById('emailForm');
const otpForm = document.getElementById('otpForm');
const emailInput = document.getElementById('emailInput');
const otpInput = document.getElementById('otpInput');
const emailMsg = document.getElementById('emailMsg');
const otpMsg = document.getElementById('otpMsg');
const displayEmail = document.getElementById('displayEmail');
const backBtn = document.getElementById('backBtn');

let currentEmail = '';

// Helper to show messages
const showMessage = (element, msg, isError = false) => {
    element.textContent = msg;
    element.className = `message ${isError ? 'error' : 'success'}`;
};

// Switch views
const switchView = (showOtp) => {
    if (showOtp) {
        emailForm.classList.remove('active-form');
        emailForm.classList.add('hidden-form');
        otpForm.classList.remove('hidden-form');
        otpForm.classList.add('active-form');
    } else {
        otpForm.classList.remove('active-form');
        otpForm.classList.add('hidden-form');
        emailForm.classList.remove('hidden-form');
        emailForm.classList.add('active-form');
        otpInput.value = '';
        otpMsg.textContent = '';
    }
};

emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const btn = emailForm.querySelector('button');
    
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();

        if (response.ok) {
            currentEmail = email;
            displayEmail.textContent = email;
            switchView(true);
        } else {
            showMessage(emailMsg, data.error || 'Failed to send OTP.', true);
        }
    } catch (err) {
        showMessage(emailMsg, 'Network error occurred.', true);
    } finally {
        btn.textContent = 'Send OTP Code';
        btn.disabled = false;
    }
});

otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = otpInput.value.trim();
    const btn = otpForm.querySelector('button');

    btn.textContent = 'Verifying...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(otpMsg, 'System Verified! Access Granted.');
            btn.style.display = 'none';
            backBtn.textContent = 'Start Over';
        } else {
            let errorText = data.error;
            if (data.error === 'expired') errorText = 'OTP Expired. Please request a new one.';
            if (data.error === 'invalid_otp') errorText = 'Invalid OTP. Try again.';
            showMessage(otpMsg, errorText, true);
        }
    } catch (err) {
        showMessage(otpMsg, 'Network error occurred.', true);
    } finally {
        btn.textContent = 'Verify System';
        btn.disabled = false;
    }
});

backBtn.addEventListener('click', () => switchView(false));
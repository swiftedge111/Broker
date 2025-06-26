document.addEventListener('DOMContentLoaded', () => {
    // Extract the token from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // console.log("Extracted token from URL:", token); // Debug log for extracted token

    if (token) {
        document.getElementById('token').value = token; // Populate hidden input with token
    } else {
        alert("Invalid link! Token not found.");
    }
});

document.getElementById('update-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`https://swift-edge-backend.onrender.com/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });

        const data = await response.json();
        console.log("Server response:", data);

        if (response.ok) {
            alert('Password updated successfully!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Failed to reset password.');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('An error occurred while resetting your password.');
    }
});

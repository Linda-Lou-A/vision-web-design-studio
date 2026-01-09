// menu.js

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // 1. MOBILE MENU TOGGLE LOGIC
    // ------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    // Note: We use the combined class for mobile, but query for the desktop class 
    // to keep the CSS consistent:
    const navLinks = document.querySelector('.nav-links'); 

    function toggleMenu(event) {
        // Stop propagation just in case, but mainly prevents touch from causing issues
        if (event) {
            event.stopPropagation();
        }
        navLinks.classList.toggle('is-open');
    }

    if (menuToggle) {
        // Attach listener for the standard mouse click
        menuToggle.addEventListener('click', toggleMenu);

        // Attach listener for touch devices (critical for mobile taps)
        // Using { passive: false } for preventDefault if needed, but the click listener is often sufficient now.
        // Let's stick to click for simplicity, but the original touchstart logic can be added back 
        // if a specific device still has issues (we'll focus on click first).
    }

    // ------------------------------------
    // 2. COOKIE CONSENT LOGIC
    // ------------------------------------
    const banner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('cookie-accept');
    const cookieName = 'visionweb_cookie_accepted';

    // Check if the user has already accepted cookies
    if (localStorage.getItem(cookieName) === 'true') {
        if (banner) {
            banner.style.display = 'none';
        }
    }

    // Event listener for the Accept button
    if (acceptButton && banner) {
        acceptButton.addEventListener('click', () => {
            // Set a permanent local storage item
            localStorage.setItem(cookieName, 'true');
            // Hide the banner
            banner.style.display = 'none';
        });
    }
});
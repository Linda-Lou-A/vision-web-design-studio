// contact.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const formspreeUrl = 'https://formspree.io/f/meodnygv'; 

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            formStatus.style.display = 'block';
            formStatus.style.backgroundColor = '#000'; // Black background
            formStatus.style.color = '#fff';
            
            // --- UPDATED: Use translation key for "Sending" message ---
            formStatus.textContent = translateText('form-status-sending'); 
            
            try {
                const response = await fetch(formspreeUrl, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success! 
                    formStatus.style.backgroundColor = '#000'; 
                    
                    // --- UPDATED: Use translation key for "Success" message ---
                    formStatus.textContent = translateText('form-status-success');
                    
                    form.reset(); 
                    form.style.display = 'none'; 
                    
                    // --- UPDATED: Use translation key for header ---
                    const formHeader = document.querySelector('[data-translate="contact-form-h2"]');
                    if(formHeader) {
                        formHeader.textContent = translateText('form-header-sent');
                    }

                } else {
                    // Failure or server error
                    // NOTE: Formspree's error structure might not always align with this
                    // For simplicity, we use a generic error translation.
                    const data = await response.json();
                    
                    formStatus.style.backgroundColor = '#f44336'; // Red for error
                    // --- UPDATED: Use translation key for "Error" message ---
                    formStatus.textContent = translateText('form-status-error'); 
                }
            } catch (error) {
                // Network error
                console.error('Submission error:', error);
                formStatus.style.backgroundColor = '#f44336'; 
                // --- UPDATED: Use translation key for "Network Error" message ---
                formStatus.textContent = translateText('form-status-network-error');
            } finally {
                if (form.style.display !== 'none') {
                     submitButton.disabled = false;
                }
            }
        });
    }
});
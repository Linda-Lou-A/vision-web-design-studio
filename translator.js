// translator.js

// 'languageMap' is assumed to be globally available from the translations.js file
const languageMap = window.translations;
const defaultLang = 'en';

// Get the current language from local storage, or default to 'en'
let currentLang = localStorage.getItem('siteLang') || defaultLang;


// ----------------------------------------------------------------------
// GLOBAL FUNCTION FOR TRANSLATION LOOKUP
// ----------------------------------------------------------------------

/**
 * Retrieves the translation string for a given key in the current language.
 * This function must be GLOBAL (not inside any event listener) so other scripts can use it.
 * @param {string} key The translation key (e.g., 'nav-home').
 * @returns {string} The translated text or the key itself if no translation is found.
 */
function translateText(key) {
    const lang = localStorage.getItem('siteLang') || defaultLang;
    
    // 1. Try to find the translation in the current language
    if (languageMap[lang] && languageMap[lang][key]) {
        return languageMap[lang][key];
    }
    
    // 2. Fallback: Return the default English version
    if (languageMap[defaultLang] && languageMap[defaultLang][key]) {
        return languageMap[defaultLang][key];
    }
    
    // 3. Final fallback: Return the key itself
    return key; 
}


// ----------------------------------------------------------------------
// CORE TRANSLATION FUNCTION (UPDATED)
// ----------------------------------------------------------------------

/**
 * Applies the translation for the specified language across the page.
 * @param {string} lang The language code ('en' or 'es').
 */
function applyTranslation(lang) {
    // Set the current language state and local storage
    currentLang = lang;
    localStorage.setItem('siteLang', lang); // Store the language immediately

    // 1. Update the lang attribute in the HTML tag
    document.documentElement.setAttribute('lang', lang);

    // 2. Translate text content
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (languageMap[lang] && languageMap[lang][key]) {
            // Use innerHTML to allow for HTML tags inside translations (like <strong>)
            element.innerHTML = languageMap[lang][key]; 
        }
    });

    // 3. Translate link URLs
    document.querySelectorAll('[data-translate-link]').forEach(element => {
        const linkKey = element.getAttribute('data-translate-link');
        if (languageMap[lang] && languageMap[lang][linkKey]) {
            element.setAttribute('href', languageMap[lang][linkKey]);
        }
    });
    
    // -------------------------------------------------------------------
    // ✨ NEW STEP 4: Translate Form Fields (Placeholder & Aria-Label)
    // -------------------------------------------------------------------
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        element.setAttribute('placeholder', translateText(key));
    });
    
    document.querySelectorAll('[data-translate-aria]').forEach(element => {
        const key = element.getAttribute('data-translate-aria');
        element.setAttribute('aria-label', translateText(key));
    });

    // -------------------------------------------------------------------
    // ✨ NEW STEP 5: Update SEO/Meta Tags (Title, Description) for ALL Pages
    // -------------------------------------------------------------------
    
    // Determine the page-specific meta keys. Defaults to 'meta-title' for the home page.
    let pageMetaTitleKey = 'meta-title'; // Default key for home page
    let pageMetaDescKey = 'meta-description'; // Default key for home page
    
    // Check if a specific page key is available in the HTML (using a hidden element or similar)
    // A more reliable way is to check the URL or a specific hidden attribute on the body.
    // For simplicity, we'll check for a key in the language map that corresponds to a page.
    // NOTE: This assumes each page has a unique identifier in the HTML or URL.
    
    if (document.body.hasAttribute('data-page-id')) {
        const pageId = document.body.getAttribute('data-page-id'); // e.g., 'about', 'contact'
        pageMetaTitleKey = `${pageId}-meta-title`; // e.g., 'about-meta-title'
        pageMetaDescKey = `${pageId}-meta-description`; // e.g., 'about-meta-description'
    }

    // Update the <title> tag using the determined key
    document.title = translateText(pageMetaTitleKey); 
    
    // Update the <meta name="description"> tag
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', translateText(pageMetaDescKey));
    }
    
    // Update the Open Graph title (<meta property="og:title">)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        // Use the same title key for og:title
        ogTitle.setAttribute('content', translateText(pageMetaTitleKey)); 
    }
    
    // -------------------------------------------------------------------

    // 6. Update flag highlight
    document.querySelectorAll('.lang-switcher img').forEach(img => {
        img.classList.remove('active-lang');
        if (img.getAttribute('data-lang') === lang) {
            img.classList.add('active-lang');
        }
    });
}

// --- Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Apply the current language on page load (this is critical)
    applyTranslation(currentLang);
    
    // Add listeners to the flags
    document.querySelectorAll('.lang-switcher img').forEach(img => {
        // Use a click listener for the flag
        img.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            
            // This modified logic forces the translation to run every time
            // a flag is clicked, ensuring the UI/content is updated.
            applyTranslation(newLang);
        });
    });
});
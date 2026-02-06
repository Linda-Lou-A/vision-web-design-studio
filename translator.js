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
   // -------------------------------------------------------------------
    // -------------------------------------------------------------------
    // -------------------------------------------------------------------
    // ✨ NEW STEP 5: Universal Attribute, Meta Tag & Schema Translator
    // -------------------------------------------------------------------
    
    // 5a. Handle attributes like content, placeholder, and titles
    document.querySelectorAll('[data-translate-attr]').forEach(element => {
        const attrInstruction = element.getAttribute('data-translate-attr');
        
        // This splits "content:key-name" into attribute (content) and key (key-name)
        const [attributeName, translationKey] = attrInstruction.split(':');
        const translatedValue = translateText(translationKey);

        if (translatedValue && translatedValue !== translationKey) {
            // Special case for the browser tab title
            if (element.tagName.toLowerCase() === 'title' || attributeName === 'title-tag') {
                document.title = translatedValue;
            } else {
                // Standard case for meta 'content' or other attributes
                element.setAttribute(attributeName, translatedValue);
            }
        }
    });
// 5b. Handle Schema JSON-LD Translation (Truly Universal Version)
    const schemaTag = document.getElementById('schema-site');
    if (schemaTag && schemaTag.getAttribute('data-translate-schema')) {
        try {
            const [nameKey, descKey] = schemaTag.getAttribute('data-translate-schema').split(':');
            const schemaData = JSON.parse(schemaTag.textContent);
            
            // Function to update fields whether they are top-level or in mainEntity
            const updateField = (obj) => {
                if (obj.name) obj.name = translateText(nameKey);
                
                if (obj.description) {
                    obj.description = translateText(descKey);
                } else if (obj.areaServed) {
                    obj.areaServed = translateText(descKey);
                } else if (obj.jobTitle) {
                    obj.jobTitle = translateText(descKey);
                }
                
                // Special check for ContactPage nested ContactPoints
                if (obj.contactPoint && Array.isArray(obj.contactPoint)) {
                    obj.contactPoint.forEach(cp => {
                        if (cp.areaServed) cp.areaServed = translateText(descKey);
                    });
                }
            };

            // Run update on top level
            updateField(schemaData);
            
            // Run update on mainEntity if it exists (for Contact Page)
            if (schemaData.mainEntity) {
                updateField(schemaData.mainEntity);
            }
            
            schemaTag.textContent = JSON.stringify(schemaData, null, 2);
        } catch (e) {
            console.error("Schema translation error:", e);
        }
    }
    // -------------------------------------------------------------------
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
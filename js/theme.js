(function() {
    'use strict';
    
    const THEME_KEY = 'devtools-theme';
    const themeStylesheet = document.getElementById('theme-stylesheet');
    
    function getBasePath() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p.length > 0 && p !== 'pgs');
        
        // se estiver em uma subpasta
        if (path.includes('/pgs/')) {
            return '../../';
        }
        
        // se estiver em sub-subpasta
        if (parts.length > 2) {
            return '../../'.repeat(parts.length - 1);
        }
        
        return '';
    }
    
    function getCurrentTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }
    
    function setTheme(theme) {
        const themeFile = theme === 'dark' ? 'dark.css' : 'light.css';
        const basePath = getBasePath();
        
        // atualiza o href do stylesheet
        themeStylesheet.href = `${basePath}css/themes/${themeFile}`;
        localStorage.setItem(THEME_KEY, theme);
        
        // update toggle button icon
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // update HTML data attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    function toggleTheme() {
        const current = getCurrentTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }
    
    function attachThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.removeEventListener('click', toggleTheme);
            toggleBtn.addEventListener('click', toggleTheme);
            console.log('Theme toggle attached successfully');
        } else {
            console.warn('Theme toggle button not found, retrying...');
            setTimeout(attachThemeToggle, 100);
        }
    }
    
    function initTheme() {
        const savedTheme = getCurrentTheme();
        setTheme(savedTheme);
        attachThemeToggle();
    }
    
    // init
    document.addEventListener('DOMContentLoaded', initTheme);
    document.addEventListener('themeChanged', attachThemeToggle);
    
    // expor
    window.themeManager = {
        getCurrentTheme,
        setTheme,
        toggleTheme,
        attachThemeToggle,
        getBasePath
    };
})();
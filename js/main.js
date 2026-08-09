(function() {
    'use strict';
    
    // tool data
    const tools = [
        {
            id: 'css-minifier',
            name: 'CSS Minifier',
            description: 'Compress and optimize your CSS code. Remove comments, whitespace, and unnecessary characters.',
            icon: 'fa-brands fa-css3-alt',
            color: '#3b82f6',
            badge: 'Popular',
            path: 'pgs/css-minifier/'
        },
        {
            id: 'js-minifier',
            name: 'JavaScript Minifier',
            description: 'Minify your JavaScript code. Optimize for production with advanced compression techniques.',
            icon: 'fa-brands fa-js',
            color: '#fbbf24',
            badge: 'New',
            path: 'pgs/js-minifier/'
        },
        {
            id: 'html-minifier',
            name: 'HTML Minifier',
            description: 'Clean and compress HTML markup. Reduce file size while maintaining functionality.',
            icon: 'fa-brands fa-html5',
            color: '#f97316',
            badge: 'Beta',
            path: 'pgs/html-minifier.html'
        },
        {
            id: 'json-formatter',
            name: 'JSON Formatter',
            description: 'Format and validate JSON data. Make your JSON readable and debug with ease.',
            icon: 'fa-solid fa-brackets-curly',
            color: '#8b5cf6',
            badge: '',
            path: 'pgs/json-formatter.html'
        },
        {
            id: 'color-converter',
            name: 'Color Converter',
            description: 'Convert between HEX, RGB, HSL, and more. Preview colors in real-time.',
            icon: 'fa-solid fa-palette',
            color: '#ec4899',
            badge: '',
            path: 'pgs/color-converter.html'
        },
        {
            id: 'regex-tester',
            name: 'Regex Tester',
            description: 'Test and debug regular expressions with real-time matching and replacement.',
            icon: 'fa-solid fa-code',
            color: '#06b6d4',
            badge: '',
            path: 'pgs/regex-tester.html'
        }
    ];
    
    // load hder nd footer
    async function loadComponent(selector, file) {
        try {
            const response = await fetch(`components/${file}`);
            const html = await response.text();
            document.querySelector(selector).innerHTML = html;
            
            // aftr hder loads, re-attach thm tggle
            if (file === 'header.html') {
                // wait f/ DOM to update
                setTimeout(() => {
                    if (window.themeManager && window.themeManager.attachThemeToggle) {
                        window.themeManager.attachThemeToggle();
                    }
                }, 50);
            }
            
            return html;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }
    
    // rnder tools grd
    function renderTools() {
        const grid = document.getElementById('tools-grid');
        if (!grid) return;
        
        grid.innerHTML = tools.map(tool => `
            <a href="${tool.path}" class="tool-card bg-card">
                <div class="icon" style="color: ${tool.color}">
                    <i class="${tool.icon}"></i>
                </div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                ${tool.badge ? `<span class="badge">${tool.badge}</span>` : ''}
            </a>
        `).join('');
    }
    
    // mbile menu handler
    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
    
    // set active nav link
    function setActiveNav() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || 
                (currentPath === '/' && href === 'index.html') ||
                (currentPath.endsWith('/') && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // init
    document.addEventListener('DOMContentLoaded', async function() {
        await loadComponent('#main-header', 'header.html');
        await loadComponent('#main-footer', 'footer.html');
        
        setupMobileMenu();
        
        renderTools();
        
        setActiveNav();
    });
})();
(function() {
    'use strict';
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').filter(p => p.length > 0).pop() || 'index.html';
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            link.classList.remove('active');
            
            const linkPage = href.split('/').pop() || 'index.html';
            
            // pg atual
            if (linkPage === currentPage) {
                link.classList.add('active');
                return;
            }
            
            // hm (raiz)
            if (linkPage === 'index.html' && currentPage === 'index.html') {
                link.classList.add('active');
                return;
            }
            
            // corresponde por nome
            if (currentPage.includes(linkPage.replace('.html', ''))) {
                link.classList.add('active');
            }
        });
    }

    // load header and footer
    async function loadComponents() {
        try {
            const [headerRes, footerRes] = await Promise.all([
                fetch('../../components/header.html'),
                fetch('../../components/footer.html')
            ]);
            
            if (headerRes.ok) {
                document.getElementById('main-header').innerHTML = await headerRes.text();
            }
            if (footerRes.ok) {
                document.getElementById('main-footer').innerHTML = await footerRes.text();
            }
            
            // re-attach theme toggle aftr hder loads
            setTimeout(() => {
                if (window.themeManager && window.themeManager.attachThemeToggle) {
                    window.themeManager.attachThemeToggle();
                }
            }, 100);
            
            setActiveNavLink()
            
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    // init
    document.addEventListener('DOMContentLoaded', loadComponents);
})();
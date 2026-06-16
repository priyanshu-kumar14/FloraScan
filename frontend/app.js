/**
 * FloraScan — Main Application Router & Controller
 */

(function () {
    const appContainer = document.getElementById('app');
    const bottomNav = document.getElementById('bottom-nav');
    const navItems = document.querySelectorAll('.bottom-nav__item');

    // App state
    const app = {
        // Navigation helper
        navigate(page, data = null) {
            // Smooth scroll to top on page navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Handle bottom nav visibility and active status
            if (page === 'scan') {
                bottomNav.classList.add('bottom-nav--hidden');
            } else {
                bottomNav.classList.remove('bottom-nav--hidden');
                navItems.forEach(item => {
                    if (item.getAttribute('data-page') === page) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }

            // Render page component
            appContainer.innerHTML = '';
            
            // Add entry animation class
            appContainer.className = 'app-content page-enter';
            
            // Route mapping
            try {
                if (page === 'home' && window.homePage) {
                    window.homePage.render(appContainer, app);
                } else if (page === 'scan' && window.scanPage) {
                    window.scanPage.render(appContainer, app);
                } else if (page === 'result' && window.resultPage) {
                    window.resultPage.render(appContainer, app, data);
                } else if (page === 'history' && window.historyPage) {
                    window.historyPage.render(appContainer, app);
                } else if (page === 'tips' && window.tipsPage) {
                    window.tipsPage.render(appContainer, app);
                } else {
                    // Fallback to home
                    console.warn(`Page controller not found for "${page}", falling back to home.`);
                    if (window.homePage) {
                        window.homePage.render(appContainer, app);
                        this.updateActiveNav('home');
                    }
                }
            } catch (err) {
                console.error(`Error rendering page "${page}":`, err);
                appContainer.innerHTML = `
                    <div class="page-padding text-center mt-xl">
                        <span class="material-symbols-outlined text-display" style="color: var(--error); font-size: 48px;">error</span>
                        <h2 class="text-headline-md mt-md">Render Error</h2>
                        <p class="text-body-md mt-sm" style="color: var(--on-surface-variant)">${err.message}</p>
                        <button class="btn btn--outline mt-lg" id="err-home-btn" style="width: auto;">Back to Home</button>
                    </div>
                `;
                document.getElementById('err-home-btn')?.addEventListener('click', () => {
                    window.location.hash = '#home';
                });
            }
        },

        updateActiveNav(page) {
            navItems.forEach(item => {
                if (item.getAttribute('data-page') === page) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        },

        // Scan history local storage utilities
        getHistory() {
            try {
                const raw = localStorage.getItem('florascan_history');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error("Failed to read local storage history:", e);
                return [];
            }
        },

        saveScan(scan) {
            try {
                const history = this.getHistory();
                const isDuplicate = history.some(item => 
                    item.timestamp === scan.timestamp ||
                    (item.class_name === scan.class_name && Math.abs(item.timestamp - scan.timestamp) < 5000)
                );
                if (!isDuplicate) {
                    history.unshift(scan); // Add to beginning
                    localStorage.setItem('florascan_history', JSON.stringify(history));
                }
            } catch (e) {
                console.error("Failed to save scan to history:", e);
            }
        },

        deleteScan(timestamp) {
            try {
                let history = this.getHistory();
                history = history.filter(item => item.timestamp !== timestamp);
                localStorage.setItem('florascan_history', JSON.stringify(history));
            } catch (e) {
                console.error("Failed to delete scan:", e);
            }
        },

        clearHistory() {
            try {
                localStorage.removeItem('florascan_history');
            } catch (e) {
                console.error("Failed to clear history:", e);
            }
        }
    };

    // Listen to hash routing
    function handleRouting() {
        const hash = window.location.hash || '#home';
        const page = hash.replace('#', '');
        
        // Handle result navigation safely. If we don't have temporary page details, we default to home
        if (page === 'result' && !window.currentScanResult) {
            window.location.hash = '#home';
            return;
        }

        const data = page === 'result' ? window.currentScanResult : null;
        app.navigate(page, data);
    }

    window.addEventListener('hashchange', handleRouting);

    // Initial setup on load
    window.addEventListener('DOMContentLoaded', () => {
        handleRouting();

        // Handle profile image clicks or hamburger menu (simulated actions)
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                alert("FloraScan v1.0.0 — Plant Disease Detection System\nPowered by TensorFlow MobileNetV2");
            });
        }
        
        const avatar = document.querySelector('.top-bar__avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                alert("Garden Profile:\nTotal Scans: " + app.getHistory().length + "\nKeep your garden green!");
            });
        }
    });

    // Share app namespace globally
    window.app = app;
})();

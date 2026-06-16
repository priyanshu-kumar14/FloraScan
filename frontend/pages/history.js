/**
 * FloraScan — History Journal Page Module
 */

(function () {
    const historyPage = {
        render(container, app) {
            let history = app.getHistory();
            let currentFilter = 'all'; // 'all', 'healthy', 'issue'
            let searchQuery = '';

            function renderList() {
                const listContainer = document.getElementById('history-list-container');
                if (!listContainer) return;

                // Filter logic
                let filtered = history.filter(item => {
                    // Filter query
                    const cleanName = item.class_name.replace(/___/g, ' ').replace(/_/g, ' ').toLowerCase();
                    const commonName = (item.solution.common_name || '').toLowerCase();
                    const matchesSearch = cleanName.includes(searchQuery) || commonName.includes(searchQuery);

                    // Filter pill
                    if (currentFilter === 'healthy') {
                        return matchesSearch && item.is_healthy;
                    } else if (currentFilter === 'issue') {
                        return matchesSearch && !item.is_healthy;
                    }
                    return matchesSearch;
                });

                if (filtered.length === 0) {
                    listContainer.innerHTML = `
                        <div class="card p-lg text-center mt-md" style="padding: 32px; border: 1px dashed var(--outline-variant); width: 100%;">
                            <span class="material-symbols-outlined" style="font-size: 48px; color: var(--outline);">search_off</span>
                            <p class="text-body-md mt-sm" style="color: var(--on-surface-variant)">
                                No scans match your current filter.
                            </p>
                        </div>
                    `;
                    return;
                }

                let listHtml = '';
                filtered.forEach(scan => {
                    const date = new Date(scan.timestamp);
                    const formattedDate = date.toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });

                    const cleanClassName = scan.class_name.replace(/___/g, ' ').replace(/_/g, ' ').trim();
                    const displayName = scan.solution.common_name !== "Unknown Class" ? scan.solution.common_name : cleanClassName;

                    listHtml += `
                        <div class="history-entry mt-md" data-timestamp="${scan.timestamp}">
                            <div class="history-entry__thumb">
                                <img src="${scan.image}" alt="${displayName}" />
                            </div>
                            <div class="history-entry__body">
                                <h4 class="history-entry__name truncate">${displayName}</h4>
                                <span class="history-entry__meta">${formattedDate}</span>
                                <div class="history-entry__status">
                                    <span class="chip ${scan.is_healthy ? 'chip--healthy' : 'chip--issue'}">
                                        <span class="material-symbols-outlined" style="font-size: 14px;">
                                            ${scan.is_healthy ? 'check_circle' : 'warning'}
                                        </span>
                                        ${scan.is_healthy ? 'Healthy' : 'Issue'}
                                    </span>
                                </div>
                            </div>
                            <span class="material-symbols-outlined history-entry__arrow">chevron_right</span>
                        </div>
                    `;
                });

                listContainer.innerHTML = listHtml;

                // Add click listeners to entries
                listContainer.querySelectorAll('.history-entry').forEach(entry => {
                    entry.addEventListener('click', () => {
                        const ts = parseInt(entry.getAttribute('data-timestamp'), 10);
                        const match = history.find(item => item.timestamp === ts);
                        if (match) {
                            window.currentScanResult = match;
                            window.location.hash = '#result';
                        }
                    });
                });
            }

            // General page layout
            const totalCount = history.length;
            const healthyCount = history.filter(item => item.is_healthy).length;
            const issueCount = totalCount - healthyCount;

            let html = `
                <!-- Page Title -->
                <div class="page-padding mt-md flex items-center justify-between">
                    <div>
                        <h2 class="text-headline-lg-mobile" style="color: var(--primary);">Journal Log</h2>
                        <p class="text-body-md" style="color: var(--on-surface-variant);">Saved plant diagnostics journal.</p>
                    </div>
                    ${totalCount > 0 ? `
                        <button class="btn btn--outline" id="history-clear-btn" style="width: auto; color: var(--error); border-color: var(--outline-variant); padding: var(--space-sm) var(--space-md);">
                            Clear All
                        </button>
                    ` : ''}
                </div>
            `;

            if (totalCount === 0) {
                html += `
                    <div class="page-padding mt-xl text-center">
                        <div class="card p-xl" style="padding: 40px; border: 1px dashed var(--outline-variant);">
                            <span class="material-symbols-outlined" style="font-size: 64px; color: var(--outline);">menu_book</span>
                            <h3 class="text-headline-md mt-md">Journal Empty</h3>
                            <p class="text-body-md mt-sm" style="color: var(--on-surface-variant); max-width: 320px; margin-left: auto; margin-right: auto;">
                                Diagnostics you perform will be saved here automatically.
                            </p>
                            <button class="btn btn--primary mt-lg" id="history-scan-fallback-btn" style="width: auto;">
                                Start Scanning
                            </button>
                        </div>
                    </div>
                `;
                container.innerHTML = html;
                document.getElementById('history-scan-fallback-btn')?.addEventListener('click', () => {
                    window.location.hash = '#scan';
                });
                return;
            }

            // Search Bar & Filters UI
            html += `
                <div class="page-padding mt-lg">
                    <!-- Search Input -->
                    <div class="search-bar">
                        <span class="material-symbols-outlined search-bar__icon">search</span>
                        <input type="text" id="history-search-input" class="search-bar__input" placeholder="Search plants or diseases..." />
                    </div>

                    <!-- Filter Row -->
                    <div class="filter-row mt-md no-scrollbar">
                        <button class="filter-pill active" data-filter="all">
                            All (${totalCount})
                        </button>
                        <button class="filter-pill" data-filter="healthy">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--secondary);">check_circle</span>
                            Healthy (${healthyCount})
                        </button>
                        <button class="filter-pill" data-filter="issue">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--error);">warning</span>
                            Issues (${issueCount})
                        </button>
                    </div>
                </div>

                <!-- History Entries Container -->
                <div class="page-padding page-section" id="history-list-container">
                    <!-- Rendered Dynamically -->
                </div>
            `;

            container.innerHTML = html;

            // Set up Search Input Handler
            const searchInput = document.getElementById('history-search-input');
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                renderList();
            });

            // Set up Filter Pills Handler
            const filterPills = container.querySelectorAll('.filter-pill');
            filterPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    filterPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    currentFilter = pill.getAttribute('data-filter');
                    renderList();
                });
            });

            // Clear All Button Handler
            const clearBtn = document.getElementById('history-clear-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    if (confirm("Are you sure you want to clear your entire scan journal? This action cannot be undone.")) {
                        app.clearHistory();
                        // Re-render empty state
                        historyPage.render(container, app);
                    }
                });
            }

            // Initial rendering of the entries list
            renderList();
        }
    };

    // Export to global scope
    window.historyPage = historyPage;
})();

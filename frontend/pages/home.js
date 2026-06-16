/**
 * FloraScan — Home Page Module
 */

(function () {
    const homePage = {
        render(container, app) {
            const history = app.getHistory();
            const totalScans = history.length;
            const healthyScans = history.filter(item => item.is_healthy).length;

            // Header Section
            let html = `
                <div class="page-padding page-section">
                    <h2 class="text-headline-lg-mobile mt-md">Hi, Gardener! 👋</h2>
                    <p class="text-body-md mt-xs" style="color: var(--on-surface-variant)">
                        Identify plant diseases instantly with AI-powered leaf scanning.
                    </p>
                </div>
            `;

            // Hero Buttons (Scan Leaf & Upload Photo)
            html += `
                <div class="page-padding page-section">
                    <div class="grid-1-md">
                        <!-- Camera Scan Hero Button -->
                        <div class="hero-btn hero-btn--primary primary-glow" id="hero-scan-btn">
                            <span class="material-symbols-outlined hero-btn__icon">photo_camera</span>
                            <span class="hero-btn__title">Scan Leaf</span>
                            <span class="hero-btn__sub">Use live camera stream</span>
                            <div class="hero-btn__pattern"></div>
                        </div>

                        <!-- Upload Photo Hero Button -->
                        <div class="hero-btn hero-btn--secondary" id="hero-upload-btn">
                            <span class="material-symbols-outlined hero-btn__icon">upload_file</span>
                            <span class="hero-btn__title">Upload Photo</span>
                            <span class="hero-btn__sub">Select image from gallery</span>
                            <div class="hero-btn__pattern"></div>
                        </div>
                    </div>
                    <!-- Hidden input for file selection -->
                    <input type="file" id="home-file-input" class="sr-only" accept="image/*" />
                </div>
            `;

            // Stats Bento Grid
            html += `
                <div class="page-padding page-section">
                    <div class="bento-grid">
                        <div class="bento-card bento-card--secondary">
                            <span class="material-symbols-outlined">bar_chart</span>
                            <div>
                                <div style="font-size: 28px; font-weight: 800;">${totalScans}</div>
                                <div class="bento-card__text">TOTAL SCANS</div>
                            </div>
                        </div>
                        <div class="bento-card bento-card--tertiary">
                            <span class="material-symbols-outlined">health_and_safety</span>
                            <div>
                                <div style="font-size: 28px; font-weight: 800;">${healthyScans}</div>
                                <div class="bento-card__text">HEALTHY PLANTS</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Recent Diagnoses List
            html += `
                <div class="page-padding page-section">
                    <div class="section-header">
                        <h3 class="section-title">Recent Diagnoses</h3>
                        ${totalScans > 0 ? `<span class="section-link" id="view-all-history">View All</span>` : ''}
                    </div>
            `;

            if (totalScans === 0) {
                html += `
                    <div class="card p-lg text-center" style="padding: 24px; border: 1px dashed var(--outline-variant);">
                        <span class="material-symbols-outlined" style="font-size: 36px; color: var(--outline);">potted_plant</span>
                        <p class="text-body-md mt-sm" style="color: var(--on-surface-variant)">
                            No recent scans. Scan a plant leaf to begin tracking your garden's health!
                        </p>
                    </div>
                `;
            } else {
                html += `<div class="detail-list">`;
                // Show last 3 scans
                const recent = history.slice(0, 3);
                recent.forEach((scan, idx) => {
                    const date = new Date(scan.timestamp);
                    const formattedDate = date.toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    // Render list item
                    html += `
                        <div class="detail-list__item" data-index="${idx}">
                            <img src="${scan.image}" alt="${scan.class_name}" style="width: 40px; height: 40px; border-radius: var(--radius); object-fit: cover; flex-shrink: 0;" />
                            <div class="detail-list__body">
                                <h4 class="detail-list__title truncate">${scan.class_name.replace(/___/g, ' ').replace(/_/g, ' ')}</h4>
                                <p class="detail-list__desc">${formattedDate}</p>
                            </div>
                            <span class="chip ${scan.is_healthy ? 'chip--healthy' : 'chip--issue'}">
                                <span class="material-symbols-outlined" style="font-size: 16px;">
                                    ${scan.is_healthy ? 'check_circle' : 'warning'}
                                </span>
                                ${scan.is_healthy ? 'Healthy' : 'Issue'}
                            </span>
                            <span class="material-symbols-outlined detail-list__arrow">chevron_right</span>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            html += `</div>`;

            // Fullscreen Loading Overlay (dynamically added when uploading)
            html += `
                <div class="scan-overlay" id="upload-loading-overlay">
                    <div class="spinner"></div>
                    <div class="scan-overlay__text" id="loading-overlay-text">Uploading Photo...</div>
                </div>
            `;

            container.innerHTML = html;

            // Add Event Listeners
            document.getElementById('hero-scan-btn').addEventListener('click', () => {
                window.location.hash = '#scan';
            });

            const fileInput = document.getElementById('home-file-input');
            document.getElementById('hero-upload-btn').addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (event) {
                    const base64Data = event.target.result;
                    uploadAndPredict(base64Data, file.name);
                };
                reader.readAsDataURL(file);
            });

            // Handle clicking "View All"
            const viewAll = document.getElementById('view-all-history');
            if (viewAll) {
                viewAll.addEventListener('click', () => {
                    window.location.hash = '#history';
                });
            }

            // Handle clicking on recent list items to load result
            const listItems = container.querySelectorAll('.detail-list__item');
            listItems.forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.getAttribute('data-index'), 10);
                    const scan = history[idx];
                    window.currentScanResult = scan;
                    window.location.hash = '#result';
                });
            });

            // Upload and prediction handler
            function uploadAndPredict(base64Data, filename) {
                const overlay = document.getElementById('upload-loading-overlay');
                const overlayText = document.getElementById('loading-overlay-text');
                
                overlay.classList.add('visible');
                overlayText.innerText = "Analyzing Leaf Image...";

                fetch('/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Data })
                })
                .then(res => {
                    if (!res.ok) throw new Error("Server responded with error status");
                    return res.json();
                })
                .then(result => {
                    if (result.error) throw new Error(result.error);
                    
                    const scanRecord = {
                        class_name: result.class_name,
                        confidence: result.confidence,
                        is_healthy: result.is_healthy,
                        solution: result.solution,
                        image: base64Data,
                        timestamp: Date.now()
                    };
                    
                    // Save to history
                    app.saveScan(scanRecord);
                    window.currentScanResult = scanRecord;
                    
                    // Route to results
                    window.location.hash = '#result';
                })
                .catch(err => {
                    console.error("Upload error:", err);
                    alert("Analysis Failed: " + err.message);
                })
                .finally(() => {
                    overlay.classList.remove('visible');
                    // Reset input
                    fileInput.value = '';
                });
            }
        }
    };

    // Export to global scope
    window.homePage = homePage;
})();

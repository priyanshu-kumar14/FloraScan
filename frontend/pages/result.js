/**
 * FloraScan — Result Detail Page Module
 */

(function () {
    const resultPage = {
        render(container, app, data) {
            if (!data) {
                // Safe guard fallback
                window.location.hash = '#home';
                return;
            }

            const { class_name, confidence, is_healthy, solution, image, timestamp } = data;

            // Formatted fallback class name
            const cleanClassName = class_name.replace(/___/g, ' ').replace(/_/g, ' ').trim();
            const displayName = solution.common_name !== "Unknown Class" ? solution.common_name : cleanClassName;

            // Generate HTML structure
            let html = `
                <!-- Top Toolbar/Header -->
                <div class="page-padding mt-md flex items-center justify-between" style="padding-top: 8px;">
                    <button class="btn btn--outline" id="result-back-btn" style="width: auto; padding: var(--space-sm) var(--space-md); display: flex; align-items: center; gap: 4px;">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <h2 class="text-headline-md" style="color: var(--primary);">Analysis Details</h2>
                    <button class="btn btn--outline" id="result-delete-btn" style="width: auto; border-color: var(--error); color: var(--error); padding: var(--space-sm) var(--space-md);">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>

                <!-- Capture Image Container -->
                <div class="page-padding mt-md page-section">
                    <div class="result-image">
                        <img src="${image}" alt="Captured Plant Leaf" />
                        <div class="result-image__scan-line"></div>
                        <span class="result-image__chip chip ${is_healthy ? 'chip--healthy' : 'chip--issue'}">
                            <span class="material-symbols-outlined" style="font-size: 16px;">
                                ${is_healthy ? 'check_circle' : 'warning'}
                            </span>
                            ${is_healthy ? 'Healthy' : 'Issue'}
                        </span>
                    </div>
                </div>

                <!-- Analysis Summary Card -->
                <div class="page-padding page-section">
                    <div class="result-card">
                        <div class="result-card__header">
                            <div>
                                <div class="result-card__label">DIAGNOSIS</div>
                                <h3 class="result-card__disease">${displayName}</h3>
                                <p class="result-card__scientific"><em>${solution.cause || 'No specific cause identified.'}</em></p>
                            </div>
                            
                            <!-- Confidence Ring -->
                            <div class="confidence-ring" title="AI confidence score">
                                <div class="confidence-ring__value ${is_healthy ? 'confidence-ring__value--success' : 'confidence-ring__value--error'}">
                                    0%
                                </div>
                                <svg viewBox="0 0 36 36">
                                    <path class="confidence-ring__track" stroke="var(--outline-variant)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="confidence-ring__fill" id="result-confidence-fill" stroke="${is_healthy ? 'var(--secondary)' : 'var(--error)'}" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                            </div>
                        </div>

                        <!-- Severity Bar -->
                        <div class="severity-bar">
                            <div class="severity-bar__header text-caption">
                                <span>Estimated Severity</span>
                                <span id="severity-label" style="font-weight: 600;">None</span>
                            </div>
                            <div class="severity-bar__track">
                                <div class="severity-bar__fill" id="result-severity-fill" style="width: 0%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Breakdown List -->
                <div class="page-padding page-section">
                    <h3 class="text-headline-md mb-md" style="color: var(--primary);">Care & Treatment Guide</h3>
                    <div class="detail-list">
                        
                        <!-- Symptoms -->
                        <div class="detail-list__item" style="cursor: default; background: transparent;">
                            <div class="detail-list__icon detail-list__icon--green">
                                <span class="material-symbols-outlined">visibility</span>
                            </div>
                            <div class="detail-list__body">
                                <h4 class="detail-list__title">Identified Symptoms</h4>
                                <p class="text-body-md mt-xs" style="color: var(--on-surface-variant); line-height: 1.5;">
                                    ${solution.symptoms || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <!-- Treatment -->
                        <div class="detail-list__item" style="cursor: default; background: transparent;">
                            <div class="detail-list__icon detail-list__icon--teal">
                                <span class="material-symbols-outlined">medical_services</span>
                            </div>
                            <div class="detail-list__body">
                                <h4 class="detail-list__title">Treatment Solution</h4>
                                <p class="text-body-md mt-xs" style="color: var(--on-surface-variant); line-height: 1.5;">
                                    ${solution.treatment || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <!-- Prevention -->
                        <div class="detail-list__item" style="cursor: default; background: transparent; border-bottom: none;">
                            <div class="detail-list__icon detail-list__icon--mint">
                                <span class="material-symbols-outlined">shield</span>
                            </div>
                            <div class="detail-list__body">
                                <h4 class="detail-list__title">Prevention Strategy</h4>
                                <p class="text-body-md mt-xs" style="color: var(--on-surface-variant); line-height: 1.5;">
                                    ${solution.prevention || 'N/A'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Primary Action Button -->
                <div class="page-padding page-section" style="padding-bottom: 40px;">
                    <button class="btn btn--primary" id="result-done-btn">
                        Return to Dashboard
                    </button>
                </div>
            `;

            container.innerHTML = html;

            // Trigger animations on load (setTimeout helps trigger browser transition)
            setTimeout(() => {
                // Animate Confidence Ring Value
                const confValue = container.querySelector('.confidence-ring__value');
                let count = 0;
                const targetCount = Math.round(confidence);
                const counterInterval = setInterval(() => {
                    if (count >= targetCount) {
                        confValue.innerText = `${targetCount}%`;
                        clearInterval(counterInterval);
                    } else {
                        count += Math.ceil(targetCount / 20);
                        if (count > targetCount) count = targetCount;
                        confValue.innerText = `${count}%`;
                    }
                }, 20);

                // Animate SVG Stroke
                const fillCircle = document.getElementById('result-confidence-fill');
                if (fillCircle) {
                    fillCircle.setAttribute('stroke-dasharray', `${targetCount}, 100`);
                }

                // Animate Severity Bar
                const sevFill = document.getElementById('result-severity-fill');
                const sevLabel = document.getElementById('severity-label');
                if (sevFill && sevLabel) {
                    if (is_healthy) {
                        sevFill.style.width = '10%';
                        sevFill.style.backgroundColor = 'var(--secondary)';
                        sevLabel.innerText = 'None (0/3)';
                    } else {
                        // Calculate severity based on confidence
                        if (confidence > 80) {
                            sevFill.style.width = '95%';
                            sevFill.style.backgroundColor = 'var(--error)';
                            sevLabel.innerText = 'High (3/3)';
                        } else if (confidence > 60) {
                            sevFill.style.width = '60%';
                            sevFill.style.backgroundColor = '#e67e22'; // Orange
                            sevLabel.innerText = 'Moderate (2/3)';
                        } else {
                            sevFill.style.width = '30%';
                            sevFill.style.backgroundColor = '#f1c40f'; // Yellow
                            sevLabel.innerText = 'Low (1/3)';
                        }
                    }
                }
            }, 100);

            // Add Event Listeners
            document.getElementById('result-back-btn').addEventListener('click', () => {
                history.back();
            });

            document.getElementById('result-done-btn').addEventListener('click', () => {
                window.location.hash = '#home';
            });

            document.getElementById('result-delete-btn').addEventListener('click', () => {
                if (confirm("Are you sure you want to delete this scan from history?")) {
                    app.deleteScan(timestamp);
                    window.location.hash = '#home';
                }
            });
        }
    };

    // Export to global scope
    window.resultPage = resultPage;
})();

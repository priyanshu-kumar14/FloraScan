/**
 * FloraScan — Scan Page Module
 */

(function () {
    const scanPage = {
        render(container, app) {
            let activeStream = null;
            let flashOn = false;

            // Render Scan View UI
            let html = `
                <div class="scan-page">
                    <video id="scan-video-el" class="scan-video" autoplay playsinline></video>
                    <div class="scan-gradient"></div>
                    <div class="scan-ui">
                        <!-- Header -->
                        <header class="scan-header">
                            <button class="scan-header__btn" id="scan-close-btn">
                                <span class="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div class="scan-header__center">
                                <h2 class="scan-header__title">FloraScan</h2>
                                <span class="scan-header__sub">AI Scanner</span>
                            </div>
                            <button class="scan-header__btn" id="scan-flash-btn">
                                <span class="material-symbols-outlined">flash_off</span>
                            </button>
                        </header>

                        <!-- Guide Brackets -->
                        <div class="scan-guide">
                            <div class="scan-brackets">
                                <span></span>
                                <div class="scan-brackets__glow"></div>
                            </div>
                            <div class="scan-guide__hint">
                                <span class="scan-guide__pill" id="scan-hint-text">Fit leaf inside brackets</span>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="scan-controls">
                            <div class="scan-controls__row">
                                <!-- Gallery Picker -->
                                <div class="scan-controls__side" id="scan-gallery-btn" style="cursor: pointer;">
                                    <button class="scan-controls__side-btn">
                                        <span class="material-symbols-outlined">photo_library</span>
                                    </button>
                                    <span class="scan-controls__side-label">GALLERY</span>
                                </div>

                                <!-- Shutter Button -->
                                <button class="scan-shutter" id="scan-shutter-btn" disabled>
                                    <div class="scan-shutter__ring"></div>
                                    <div class="scan-shutter__btn">
                                        <div class="scan-shutter__inner"></div>
                                    </div>
                                </button>

                                <!-- Static Guide Button -->
                                <div class="scan-controls__side" id="scan-guide-btn" style="cursor: pointer;">
                                    <button class="scan-controls__side-btn">
                                        <span class="material-symbols-outlined">info</span>
                                    </button>
                                    <span class="scan-controls__side-label">GUIDE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Hidden elements for capture and gallery fallback -->
                    <canvas id="scan-capture-canvas" class="sr-only"></canvas>
                    <input type="file" id="scan-file-input" class="sr-only" accept="image/*" />

                    <!-- Scanning Laser Overlay -->
                    <div class="scan-overlay" id="scan-loading-overlay">
                        <div class="scan-overlay__bar"></div>
                        <div class="scan-overlay__text">Scanning Leaf...</div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            const video = document.getElementById('scan-video-el');
            const shutterBtn = document.getElementById('scan-shutter-btn');
            const hintText = document.getElementById('scan-hint-text');
            const fileInput = document.getElementById('scan-file-input');

            // 1. Initialise camera
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })
            .then(stream => {
                activeStream = stream;
                video.srcObject = stream;
                shutterBtn.disabled = false;
            })
            .catch(err => {
                console.warn("Camera access failed, falling back to gallery-only scanner:", err);
                hintText.innerText = "Camera not available. Use GALLERY to upload.";
                hintText.parentElement.style.bottom = "-2rem";
                
                // Show visual camera blocked overlay or styling
                video.style.background = "#012d1d";
                const placeholderIcon = document.createElement('span');
                placeholderIcon.className = 'material-symbols-outlined';
                placeholderIcon.innerText = 'videocam_off';
                placeholderIcon.style.cssText = `
                    position: absolute;
                    top: 40%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 72px;
                    color: rgba(255, 255, 255, 0.15);
                `;
                video.parentElement.insertBefore(placeholderIcon, video);
            });

            // 2. Shut down camera when page transitions
            function stopCamera() {
                if (activeStream) {
                    activeStream.getTracks().forEach(track => track.stop());
                    activeStream = null;
                }
            }

            window.addEventListener('hashchange', function cleanup() {
                if (window.location.hash !== '#scan') {
                    stopCamera();
                    window.removeEventListener('hashchange', cleanup);
                }
            });

            // 3. Shutter Capture Event
            shutterBtn.addEventListener('click', () => {
                if (!activeStream || video.paused) return;

                const canvas = document.getElementById('scan-capture-canvas');
                const ctx = canvas.getContext('2d');

                // Match canvas aspect ratio and dimensions to video stream
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Data = canvas.toDataURL('image/jpeg');

                // Post prediction
                predictImage(base64Data);
            });

            // 4. Close/Back Button
            document.getElementById('scan-close-btn').addEventListener('click', () => {
                stopCamera();
                window.location.hash = '#home';
            });

            // 5. Gallery Pick Button
            document.getElementById('scan-gallery-btn').addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (event) {
                    predictImage(event.target.result);
                };
                reader.readAsDataURL(file);
            });

            // 6. Flash Toggle (Simulated UI toggle + check track capability if present)
            const flashBtn = document.getElementById('scan-flash-btn');
            flashBtn.addEventListener('click', () => {
                flashOn = !flashOn;
                flashBtn.querySelector('span').innerText = flashOn ? 'flash_on' : 'flash_off';
                
                // Try applying to stream track if supported
                if (activeStream) {
                    const track = activeStream.getVideoTracks()[0];
                    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
                    if (capabilities.torch) {
                        track.applyConstraints({
                            advanced: [{ torch: flashOn }]
                        }).catch(err => console.warn("Failed to toggle camera flash torch:", err));
                    }
                }
            });

            // 7. Guide Button
            document.getElementById('scan-guide-btn').addEventListener('click', () => {
                alert("Scan Guide:\n\n1. Place the affected leaf in a well-lit area.\n2. Avoid shadows or crowded background leaves.\n3. Keep the camera flat and aligned with the leaf surface.\n4. Ensure the entire leaf fits within the screen guidelines.");
            });

            // API predict function
            function predictImage(base64Data) {
                const overlay = document.getElementById('scan-loading-overlay');
                overlay.classList.add('visible');

                // Stop the camera once captured to save CPU/battery resources
                stopCamera();

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

                    app.saveScan(scanRecord);
                    window.currentScanResult = scanRecord;
                    window.location.hash = '#result';
                })
                .catch(err => {
                    console.error("Scan error:", err);
                    alert("Analysis Failed: " + err.message);
                    // Return back to scan state if error occurs
                    window.location.hash = '#home';
                })
                .finally(() => {
                    overlay.classList.remove('visible');
                });
            }
        }
    };

    // Export to global scope
    window.scanPage = scanPage;
})();

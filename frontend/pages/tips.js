/**
 * FloraScan — Garden Care Tips Page Module
 */

(function () {
    const tipsPage = {
        render(container, app) {
            const tipsData = [
                {
                    id: 1,
                    title: "Preventing Tomato Early Blight",
                    tag: "Organic",
                    tagClass: "tip-card__tag--organic",
                    tagIcon: "eco",
                    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600",
                    desc: "Learn how crop rotation, mulching, and proper plant spacing can halt the Alternaria solani fungus before it takes hold in your garden.",
                    time: "3 min read",
                    fullContent: `
                        <h3>Understanding Tomato Early Blight</h3>
                        <p>Early Blight is caused by the fungus <em>Alternaria solani</em> and is one of the most common tomato diseases. It first appears as small brown spots with concentric rings (target pattern) on older lower leaves. If left unchecked, it causes yellowing, defoliation, and reduces yield.</p>
                        
                        <h4>1. Crop Rotation</h4>
                        <p>Rotate solanaceous crops (tomatoes, peppers, potatoes, eggplants) every 2–3 years. Do not plant them in the same spot consecutively, as fungal spores overwinter in soil debris.</p>
                        
                        <h4>2. Apply Mulch</h4>
                        <p>Apply a thick layer of straw, wood chips, or plastic mulch around the base of tomato plants. This acts as a physical barrier, preventing soil-borne spores from splashing onto lower leaves during rain or watering.</p>
                        
                        <h4>3. Prune and Space Properly</h4>
                        <p>Space plants at least 24–36 inches apart to allow good airflow. Prune the bottom 12–18 inches of leaves once the plant is established to prevent contact with the soil.</p>
                    `
                },
                {
                    id: 2,
                    title: "Spider Mite Organic Control",
                    tag: "Pest Control",
                    tagClass: "tip-card__tag--pest",
                    tagIcon: "bug_report",
                    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
                    desc: "Look for fine webbing and yellow stippling on leaf undersides. Learn how to control mite outbreaks using natural organic spray remedies.",
                    time: "4 min read",
                    fullContent: `
                        <h3>Controlling Two-Spotted Spider Mites Organically</h3>
                        <p>Spider mites are tiny arachnids that feed on plant sap, sucking nutrients from leaves. In dry, warm conditions, populations explode rapidly, leaving fine webbing and causing leaves to turn brown, dry, and drop off.</p>
                        
                        <h4>1. Natural Water Blast</h4>
                        <p>For minor infestations, blast the undersides of the leaves with a strong stream of water from your garden hose. This physically knocks off the mites and destroys their webbing, interrupting their breeding cycle.</p>
                        
                        <h4>2. Introduce Beneficial Predators</h4>
                        <p>Release predatory mites (such as <em>Phytoseiulus persimilis</em>) or ladybugs into your garden. They feed on spider mites and keep the population under control without chemical sprays.</p>
                        
                        <h4>3. Apply Neem Oil or Insecticidal Soap</h4>
                        <p>Spray a diluted organic neem oil solution or insecticidal soap directly on the undersides of leaves in the evening. Repeat every 7 days until the infestation clears. Avoid spraying in direct sun to prevent leaf sunburn.</p>
                    `
                },
                {
                    id: 3,
                    title: "Watering Best Practices",
                    tag: "Garden Care",
                    tagClass: "tip-card__tag--care",
                    tagIcon: "water_drop",
                    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600",
                    desc: "Overhead watering spreads destructive fungal spores. Discover why drip irrigation and morning watering can save your plants' lives.",
                    time: "2 min read",
                    fullContent: `
                        <h3>Smart Watering for Disease Prevention</h3>
                        <p>Many plant pathogens, especially fungi and oomycetes (like Late Blight), need water on leaf surfaces to germinate and infect. How and when you water directly influences disease pressure in your garden.</p>
                        
                        <h4>1. Avoid Overhead Sprinklers</h4>
                        <p>Use drip irrigation, soaker hoses, or water directly at the base of the plant with a watering can. Keeping leaves completely dry is the number one way to prevent leaf spot diseases.</p>
                        
                        <h4>2. Water Early in the Morning</h4>
                        <p>If you must water overhead, do so between 5:00 AM and 8:00 AM. This ensures that the warm morning sun evaporates any moisture on the leaves quickly. Never water in the evening, as leaves will remain damp overnight.</p>
                        
                        <h4>3. Maintain Consistent Soil Moisture</h4>
                        <p>Fluctuations in soil moisture cause physiological stress, leading to blossom-end rot in tomatoes or skin splitting in root crops. Mulch helps regulate and maintain stable moisture levels.</p>
                    `
                }
            ];

            let html = `
                <!-- Title Header -->
                <div class="page-padding mt-md page-section">
                    <h2 class="text-headline-lg-mobile" style="color: var(--primary);">Care Resources</h2>
                    <p class="text-body-md" style="color: var(--on-surface-variant)">
                        Professional tips and practices for maintaining a disease-free garden.
                    </p>
                </div>

                <!-- Articles Grid -->
                <div class="page-padding page-section">
                    <div class="tips-grid">
            `;

            tipsData.forEach(tip => {
                html += `
                    <div class="tip-card" data-id="${tip.id}">
                        <div class="tip-card__image">
                            <img src="${tip.image}" alt="${tip.title}" />
                            <span class="tip-card__tag ${tip.tagClass}">
                                <span class="material-symbols-outlined">${tip.tagIcon}</span>
                                ${tip.tag}
                            </span>
                        </div>
                        <div class="tip-card__body">
                            <h4 class="tip-card__title truncate">${tip.title}</h4>
                            <p class="tip-card__desc">${tip.desc}</p>
                            <div class="tip-card__footer">
                                <span class="tip-card__link" style="cursor: pointer;">
                                    Read Article
                                    <span class="material-symbols-outlined">arrow_forward</span>
                                </span>
                                <span class="tip-card__time">${tip.time}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            // Newsletter CTA card
            html += `
                <div class="page-padding page-section" style="padding-bottom: 40px;">
                    <div class="newsletter">
                        <span class="material-symbols-outlined newsletter__icon">mail</span>
                        <h3 class="newsletter__title">FloraScan Newsletter</h3>
                        <p class="newsletter__desc">
                            Subscribe to receive weekly care guides, disease outbreak alerts, and seasonal gardening advice.
                        </p>
                        <form class="newsletter__form" id="newsletter-form" onsubmit="return false;">
                            <input type="email" class="newsletter__input" id="newsletter-email" placeholder="Enter your email address" required />
                            <button type="submit" class="newsletter__btn" id="newsletter-submit-btn">Subscribe Now</button>
                        </form>
                    </div>
                </div>

                <!-- Article Modal Detail Overlay -->
                <div class="scan-overlay" id="article-modal" style="background: rgba(0,0,0,0.6); pointer-events: none; justify-content: flex-end;">
                    <div style="background: var(--surface-bright); width: 100%; max-width: 600px; border-top-left-radius: var(--radius-xl); border-top-right-radius: var(--radius-xl); padding: var(--space-lg); pointer-events: auto; display: flex; flex-direction: column; max-height: 85dvh; overflow-y: auto;" id="article-modal-content">
                        <!-- Content rendered dynamically -->
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Setup Article Modal Handlers
            const modal = document.getElementById('article-modal');
            const modalContent = document.getElementById('article-modal-content');

            container.querySelectorAll('.tip-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = parseInt(card.getAttribute('data-id'), 10);
                    const tip = tipsData.find(item => item.id === id);
                    if (!tip) return;

                    modalContent.innerHTML = `
                        <div class="flex justify-between items-center mb-md">
                            <span class="chip chip--primary" style="font-size: 12px; padding: 2px 8px;">
                                <span class="material-symbols-outlined" style="font-size: 14px;">${tip.tagIcon}</span>
                                ${tip.tag}
                            </span>
                            <button id="modal-close-btn" class="btn btn--outline" style="width: auto; padding: 4px 8px; border-radius: var(--radius-full);">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <img src="${tip.image}" alt="${tip.title}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: var(--radius-md); margin-bottom: var(--space-md);" />
                        <h2 class="text-headline-lg-mobile" style="color: var(--primary); margin-bottom: var(--space-sm);">${tip.title}</h2>
                        <div class="article-text-content" style="color: var(--on-surface-variant); font-size: 15px; line-height: 1.6;">
                            ${tip.fullContent}
                        </div>
                    `;

                    // Show Modal
                    modal.classList.add('visible');
                    modal.style.pointerEvents = 'auto';

                    // Attach Close Button
                    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
                });
            });

            // Close modal helper
            function closeModal() {
                modal.classList.remove('visible');
                modal.style.pointerEvents = 'none';
            }

            // Close on clicking backdrop
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Newsletter submit handler
            const newsletterForm = document.getElementById('newsletter-form');
            const emailInput = document.getElementById('newsletter-email');
            const submitBtn = document.getElementById('newsletter-submit-btn');

            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = emailInput.value.trim();
                if (!email) return;

                submitBtn.disabled = true;
                submitBtn.innerText = "Subscribing...";

                // Mock API Delay
                setTimeout(() => {
                    alert(`Subscribed successfully!\nWe've registered ${email} for the weekly FloraScan Newsletter.`);
                    emailInput.value = '';
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Subscribe Now";
                }, 1000);
            });
        }
    };

    // Export to global scope
    window.tipsPage = tipsPage;
})();

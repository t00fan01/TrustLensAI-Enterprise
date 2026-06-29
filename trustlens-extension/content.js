// Configured endpoints for background and manual scanning
const BACKGROUND_BLOCK_API = "https://trustlens-blocker-api.onrender.com/analyze";
const MANUAL_SCAN_API = "https://trustlens-manual-api.onrender.com/analyze";

// Inject search result indicators
function injectTrustLensShields() {
    const searchResults = document.querySelectorAll('a h3');
    const logoUrl = chrome.runtime.getURL("logo.png");

    searchResults.forEach(header => {
        const linkElement = header.closest('a');

        if (linkElement && !linkElement.hasAttribute('data-trustlens-injected')) {
            linkElement.setAttribute('data-trustlens-injected', 'true');

            const container = document.createElement('span');
            container.style.position = 'relative';
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.marginLeft = '8px';
            container.style.verticalAlign = 'middle';

            container.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            const shieldBtn = document.createElement('img');
            shieldBtn.src = logoUrl;
            shieldBtn.style.width = '20px';
            shieldBtn.style.height = '20px';
            shieldBtn.style.cursor = 'pointer';
            shieldBtn.style.borderRadius = '6px';
            shieldBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)';
            shieldBtn.style.transition = 'transform 0.2s ease';
            shieldBtn.style.backgroundColor = '#ffffff';
            shieldBtn.style.border = '1px solid #e2e8f0';

            shieldBtn.onmouseover = () => shieldBtn.style.transform = 'scale(1.1)';
            shieldBtn.onmouseout = () => shieldBtn.style.transform = 'scale(1)';

            const popup = document.createElement('div');
            popup.style.display = 'none';
            popup.style.position = 'absolute';
            popup.style.width = '340px';
            popup.style.backgroundColor = '#0f172a';
            popup.style.color = '#e4e4e7';
            popup.style.border = '1px solid #1e293b';
            popup.style.borderRadius = '14px';
            popup.style.boxShadow = '0 25px 50px rgba(0,0,0,0.9)';
            popup.style.zIndex = '2147483647';
            popup.style.fontFamily = '"Inter", "Segoe UI", Roboto, Arial, sans-serif';
            popup.style.overflow = 'hidden';
            popup.style.cursor = 'default';

            document.body.appendChild(popup);
            container.appendChild(shieldBtn);
            header.appendChild(container);

            const positionPopup = () => {
                const rect = shieldBtn.getBoundingClientRect();
                popup.style.top = (rect.bottom + window.scrollY + 8) + 'px';
                popup.style.left = (rect.left + window.scrollX) + 'px';
            };

            container.addEventListener('mouseenter', () => {
                if (popup.innerHTML !== '') {
                    positionPopup();
                    popup.style.display = 'block';
                }
            });
            container.addEventListener('mouseleave', () => {
                popup.style.display = 'none';
            });

            shieldBtn.addEventListener('click', async () => {
                const targetUrl = linkElement.href;
                positionPopup();
                popup.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #a1a1aa;">
                        <div style="font-weight: 700; font-size: 16px;">Scanning Link... 🧠</div>
                        <div style="font-size: 13px; margin-top: 6px;">Analyzing intent with AI Guardian</div>
                    </div>
                `;
                popup.style.display = 'block';

                try {
                    // Fetch manual scan results
                    const response = await fetch(MANUAL_SCAN_API, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: targetUrl, text_content: "Inline Google Search Scan" })
                    });
                    const data = await response.json();

                    let headerBg = data.classification === "Safe" ? '#0d9488' : (data.classification === "Warning" ? '#d97706' : '#dc2626');
                    let textColor = data.classification === "Safe" ? '#000000' : '#ffffff';
                    let icon = data.classification === "Safe" ? '✅' : (data.classification === "Warning" ? '⚠️' : '🚨');
                    let accentColor = "#00b3b3";

                    popup.innerHTML = `
                        <div style="background-color: ${headerBg}; padding: 16px; text-align: center; color: ${textColor}; border-bottom: 1px solid rgba(0,0,0,0.1);">
                            <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; margin-bottom: 4px;">TRUSTLENS AI</div>
                            <div style="font-size: 22px; font-weight: 900;">${icon} This link is ${data.classification}</div>
                        </div>
                        <div style="padding: 20px; font-size: 14px; line-height: 1.6; color: #cbd5e1; background-color: #0f172a;">
                            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
                                <span style="color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Risk Score</span>
                                <strong style="color: ${accentColor}; font-size: 24px; font-weight: 900;">${data.risk_score}/100</strong>
                            </div>
                            <div style="font-weight: 700; color: #f1f5f9; margin-bottom: 10px; font-size: 15px;">AI Security Reasoning:</div>
                            <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 14px;">
                                ${data.reasons.map(r => `
                                    <li style="margin-bottom: 8px; position: relative; padding-left: 10px;">
                                        <div style="position: absolute; left: -18px; top: 7px; width: 6px; height: 6px; background-color: ${accentColor}; border-radius: 50%;"></div>
                                        ${r}
                                    </li>`).join('')}
                            </ul>
                        </div>
                    `;
                    shieldBtn.style.border = `2px solid ${headerBg}`;
                } catch (error) {
                    popup.innerHTML = `
                        <div style="padding: 20px; color: #ef4444; text-align: center; font-weight: bold;">⚠️ Connection Error.</div>
                        <div style="padding: 0 20px 20px 20px; color: #a1a1aa; text-align: center; font-size: 13px;">Manual scanner engine busy or rate limited. Try clicking again!</div>
                    `;
                }
            });
        }
    });
}

// Background page scanner
async function activePageScanner() {
    const currentUrl = window.location.href;
    const currentHost = window.location.hostname;

    // Check safe domains
    const safeHosts = [
        "google.com", "localhost", "vercel.app", "onrender.com",
        "youtube.com", "github.com", "linkedin.com", "wikipedia.org",
        "geeksforgeeks.org", "stackoverflow.com", "osfhackthone.in"
    ];

    if (safeHosts.some(safe => currentHost.includes(safe))) {
        return;
    }

    // Check session cache
    const cacheKey = `trustlens_scanned_${currentHost}`;
    if (sessionStorage.getItem(cacheKey)) {
        console.log("TrustLens: Local cache hit. Domain safe for session.");
        return;
    }

    try {
        const pageText = document.body.innerText.substring(0, 1500);

        // Fetch background scan results
        const response = await fetch(BACKGROUND_BLOCK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentUrl, text_content: pageText })
        });

        const data = await response.json();

        // Cache scan result
        sessionStorage.setItem(cacheKey, 'true');

        if (data.classification === "Warning" || data.classification === "High Risk" || data.classification === "Scam") {
            triggerFullScreenBlocker(data);
        }
    } catch (error) {
        console.log("TrustLens: Background scanner engine rate-limited. Actively protected, but skipping background scan for this new site.");
    }
}

function triggerFullScreenBlocker(data) {
    const logoUrl = chrome.runtime.getURL("logo.png");

    const blocker = document.createElement('div');
    blocker.style.position = 'fixed';
    blocker.style.top = '0';
    blocker.style.left = '0';
    blocker.style.width = '100vw';
    blocker.style.height = '100vh';
    blocker.style.backgroundColor = '#7f1d1d';
    blocker.style.zIndex = '2147483647';
    blocker.style.display = 'flex';
    blocker.style.flexDirection = 'column';
    blocker.style.justifyContent = 'center';
    blocker.style.alignItems = 'center';
    blocker.style.fontFamily = '"Inter", "Segoe UI", Roboto, Arial, sans-serif';
    blocker.style.backdropFilter = 'blur(10px)';

    blocker.innerHTML = `
        <div style="max-width: 600px; text-align: center; background-color: #991b1b; padding: 40px; border-radius: 16px; box-shadow: 0 25px 50px rgba(0,0,0,0.6); border: 1px solid #f87171;">
            <img src="${logoUrl}" style="width: 64px; height: 64px; margin-bottom: 20px; border-radius: 12px; background: white; padding: 4px;" />
            <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 16px 0; color: white;">🚨 Deceptive Site Ahead</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #fecaca;">
                TrustLens AI has flagged this site as <strong>${data.classification}</strong> (Risk Score: ${data.risk_score}/100).
                Attackers on this site might try to trick you into installing software, revealing passwords, or stealing financial data.
            </p>
            
            <div style="background-color: #7f1d1d; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 32px; border: 1px solid #b91c1c;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #f87171; text-transform: uppercase; letter-spacing: 1px;">AI Reasoning:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #fca5a5; line-height: 1.5;">
                    ${data.reasons.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
                </ul>
            </div>
            
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button id="tl-back-safety" style="background-color: white; color: #991b1b; border: none; padding: 14px 28px; font-size: 16px; font-weight: 900; border-radius: 8px; cursor: pointer;">Back to Safety</button>
                <button id="tl-proceed" style="background-color: transparent; color: #fca5a5; border: 1px solid #fca5a5; padding: 14px 28px; font-size: 14px; border-radius: 8px; cursor: pointer;">Proceed Anyway (Unsafe)</button>
            </div>
        </div>
    `;

    document.body.appendChild(blocker);

    document.getElementById('tl-back-safety').addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    });

    document.getElementById('tl-proceed').addEventListener('click', () => {
        blocker.remove();
    });
}

// Init scanner based on host
if (window.location.hostname.includes("google.com")) {
    setTimeout(injectTrustLensShields, 1500);
} else {
    setTimeout(activePageScanner, 1000);
}
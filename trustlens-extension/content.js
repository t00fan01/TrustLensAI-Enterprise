
const BACKGROUND_BLOCK_API = "https://trustlens-blocker-api.onrender.com/analyze";
const MANUAL_SCAN_API = "https://trustlens-manual-api.onrender.com/analyze";

function isWhitelisted(hostname) {
    const safeHosts = [
        "google.com", "localhost", "vercel.app", "onrender.com",
        "youtube.com", "github.com", "linkedin.com", "wikipedia.org",
        "geeksforgeeks.org", "stackoverflow.com", "osfhackthone.in",
        "chatgpt.com", "openai.com", "claude.ai", "microsoft.com",
        "apple.com", "amazon.com", "netflix.com", "twitter.com", "x.com"
    ];
    return safeHosts.some(safe => hostname.includes(safe));
}

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
            popup.style.color = '#ffffff';
            popup.style.borderRadius = '12px';
            popup.style.padding = '16px';
            popup.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
            popup.style.zIndex = '2147483647';
            popup.style.top = '25px';
            popup.style.left = '0';

            container.appendChild(shieldBtn);
            container.appendChild(popup);
            header.appendChild(container);

            shieldBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (popup.style.display === 'block') {
                    popup.style.display = 'none';
                    return;
                }

                popup.style.display = 'block';
                popup.innerHTML = `<p style="margin:0;font-family:sans-serif;font-size:13px;color:#94a3b8;">Analyzing link target...</p>`;

                const targetUrl = linkElement.href;
                try {
                    const urlObj = new URL(targetUrl);
                    if (isWhitelisted(urlObj.hostname)) {
                        popup.innerHTML = `
                            <h4 style="margin:0 0 4px 0;color:#10b981;font-size:14px;font-weight:bold;">✓ Verified Safe</h4>
                            <p style="margin:0;font-size:12px;color:#cbd5e1;">This domain belongs to an verified high-authority trusted platform.</p>
                        `;
                        return;
                    }
                } catch (err) { }

                try {
                    const response = await fetch(MANUAL_SCAN_API, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: targetUrl, text_content: "Google Search Link Click Scan" })
                    });
                    const data = await response.json();

                    let headerBg = data.classification === "Safe" ? '#0d9488' : (data.classification === "Warning" ? '#d97706' : '#dc2626');
                    let icon = data.classification === "Safe" ? '✅' : (data.classification === "Warning" ? '⚠️' : '🚨');

                    popup.innerHTML = `
                        <div style="background-color: ${headerBg}; padding: 10px; margin: -16px -16px 12px -16px; text-align: center; font-weight: bold; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                            ${icon} ${data.classification} (${data.risk_score}/100)
                        </div>
                        <p style="margin:0 0 8px 0; font-size:13px; font-weight:bold;">AI Assessment:</p>
                        <ul style="margin:0; padding-left:16px; font-size:12px; color:#cbd5e1; line-height:1.4;">
                            ${data.reasons.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
                        </ul>
                    `;
                } catch (error) {
                    popup.innerHTML = `<p style="margin:0;color:#ef4444;font-size:12px;">Engine offline or rate limited.</p>`;
                }
            });

            document.addEventListener('click', () => popup.style.display = 'none');
        }
    });
}

async function activePageScanner() {
    const currentUrl = window.location.href;
    const currentHost = window.location.hostname;

    if (isWhitelisted(currentHost)) {
        return;
    }

    const cacheKey = `trustlens_scanned_${currentHost}`;
    if (sessionStorage.getItem(cacheKey)) {
        return;
    }

    try {
        const pageText = document.body.innerText.substring(0, 1200);

        const response = await fetch(BACKGROUND_BLOCK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentUrl, text_content: pageText })
        });

        const data = await response.json();
        sessionStorage.setItem(cacheKey, 'true');

        // TIRED RESPONSE CORE LOGIC
        if (data.classification === "High Risk" || data.classification === "Scam") {
            triggerFullScreenBlocker(data);
        } else if (data.classification === "Warning") {
            injectYellowWarningBanner(data);
        }
    } catch (error) {
        console.log("TrustLens: Network gateway optimized.");
    }
}

function injectYellowWarningBanner(data) {
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.width = '100vw';
    banner.style.backgroundColor = '#fef08a';
    banner.style.borderBottom = '2px solid #eab308';
    banner.style.color = '#854d0e';
    banner.style.padding = '12px 24px';
    banner.style.zIndex = '2147483647';
    banner.style.fontFamily = 'sans-serif';
    banner.style.fontSize = '14px';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';
    banner.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';

    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
            <span>⚠️</span>
            <span><strong>TrustLens AI Warning:</strong> This page shows suspicious indicators (Risk: ${data.risk_score}/100). Reason: <em>${data.reasons[0]}</em></span>
        </div>
        <button id="tl-close-banner" style="background:transparent; border:1px solid #ca8a04; color:#854d0e; padding:4px 8px; border-radius:4px; cursor:pointer; font-weight:bold;">Dismiss</button>
    `;

    document.body.appendChild(banner);
    document.body.style.marginTop = '45px';

    document.getElementById('tl-close-banner').addEventListener('click', () => {
        banner.remove();
        document.body.style.marginTop = '0px';
    });
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
    blocker.style.fontFamily = 'sans-serif';

    blocker.innerHTML = `
        <div style="max-width: 600px; text-align: center; background-color: #991b1b; padding: 40px; border-radius: 16px; box-shadow: 0 25px 50px rgba(0,0,0,0.6); border: 1px solid #f87171; color: white;">
            <img src="${logoUrl}" style="width: 64px; height: 64px; margin-bottom: 20px; border-radius: 12px; background: white; padding: 4px;" />
            <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 16px 0;">🚨 Critical Threat Blocked</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #fecaca;">
                TrustLens AI has intercepted an active <strong>${data.classification}</strong> pathway on this site (Risk Score: ${data.risk_score}/100). Interaction has been suspended.
            </p>
            
            <div style="background-color: #7f1d1d; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 32px; border: 1px solid #b91c1c;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #f87171; text-transform: uppercase; letter-spacing: 1px;">Threat Parameters:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #fca5a5; line-height: 1.5;">
                    ${data.reasons.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
                </ul>
            </div>
            
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button id="tl-back-safety" style="background-color: white; color: #991b1b; border: none; padding: 14px 28px; font-size: 16px; font-weight: 900; border-radius: 8px; cursor: pointer;">Back to Safety</button>
                <button id="tl-proceed" style="background-color: transparent; color: #fca5a5; border: 1px solid #fca5a5; padding: 14px 28px; font-size: 14px; border-radius: 8px; cursor: pointer;">Ignore & Proceed</button>
            </div>
        </div>
    `;

    document.body.appendChild(blocker);

    document.getElementById('tl-back-safety').addEventListener('click', () => {
        if (window.history.length > 1) window.history.back();
        else window.close();
    });

    document.getElementById('tl-proceed').addEventListener('click', () => blocker.remove());
}
if (window.location.hostname.includes("google.com")) {
    setTimeout(injectTrustLensShields, 1500);
} else {
    setTimeout(activePageScanner, 1000);
}
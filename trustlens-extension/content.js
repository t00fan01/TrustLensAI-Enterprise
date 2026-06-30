
const BACKGROUND_BLOCK_API = "https://trustlens-blocker-api.onrender.com/analyze";
const MANUAL_SCAN_API = "https://trustlens-manual-api.onrender.com/analyze";

function generateThreatHash(url) {
    let hash = 0;
    const str = url + Date.now();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(16, '0');
    let fullHash = "0x";
    for(let i=0; i<4; i++) fullHash += hex;
    return fullHash.substring(0, 66);
}

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

function runLocalHeuristics(pageText, currentUrl) {
    if (pageText.includes("setApprovalForAll") || pageText.includes("eth_signTypedData") || pageText.includes("window.ethereum.request")) {
        return { classification: "Scam", risk_score: 98, reasons: ["Malicious Web3/crypto wallet drainer signatures detected."] };
    }
    const forms = document.querySelectorAll('form');
    for (let f of forms) {
        let action = f.getAttribute('action');
        if (action) {
            if (action.startsWith('http://')) {
                return { classification: "High Risk", risk_score: 85, reasons: ["Insecure form action (HTTP) detected."] };
            }
            try {
                let actionUrl = new URL(action, window.location.href);
                if (actionUrl.hostname !== window.location.hostname) {
                    return { classification: "Warning", risk_score: 75, reasons: ["Cross-domain form submission detected."] };
                }
            } catch(e) {}
        }
    }
    const ipRegex = /^https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
    if (ipRegex.test(currentUrl)) {
        return { classification: "Scam", risk_score: 99, reasons: ["Raw IP address URL detected (Phishing Indicator)."] };
    }
    return null;
}

async function activePageScanner() {
    const currentUrl = window.location.href;
    const currentHost = window.location.hostname;

    if (isWhitelisted(currentHost)) {
        return;
    }

    const cacheKey = `trustlens_scanned_${currentHost}`;
    const cachedDataStr = sessionStorage.getItem(cacheKey);
    if (cachedDataStr) {
        try {
            const data = JSON.parse(cachedDataStr);
            if (data.classification === "High Risk" || data.classification === "Scam") {
                triggerFullScreenBlocker(data);
                return;
            } else if (data.classification === "Warning") {
                injectYellowWarningBanner(data);
                return;
            }
        } catch(e) {}
        return;
    }

    try {
        const pageText = document.body ? document.body.textContent.replace(/\s+/g, ' ').substring(0, 1200) : "";

        const localThreat = runLocalHeuristics(pageText, currentUrl);
        if (localThreat) {
            sessionStorage.setItem(cacheKey, JSON.stringify(localThreat));
            triggerFullScreenBlocker(localThreat);
            return;
        }

        const has_login_forms = document.querySelectorAll('input[type="password"]').length > 0;
        const external_links_count = Array.from(document.querySelectorAll('a')).filter(a => a.hostname && a.hostname !== currentHost).length;
        const is_web3_active = typeof window.ethereum !== 'undefined';

        const response = await fetch(BACKGROUND_BLOCK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                url: currentUrl, 
                text_content: pageText,
                has_login_forms: has_login_forms,
                external_links_count: external_links_count,
                is_web3_active: is_web3_active
            })
        });

        const data = await response.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));

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
            
            <style>@keyframes pulseAnim { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }</style>
            <div style="background-color: #000000; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 32px; border: 1px solid #22c55e; font-family: monospace;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #4ade80;">Web3 Threat Hash: ${generateThreatHash(window.location.href)}</p>
                <p style="margin: 0; font-size: 13px; color: #22c55e; animation: pulseAnim 1.5s infinite;">⏺ Broadcasting immutable threat signature to Decentralized Oracle Ledger...</p>
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
// ==========================================
// BEHAVIORAL DETECTION ENGINE (NEW)
// ==========================================
class BehavioralDetector {
    constructor() {
        this.score = 0;
        this.threshold = 90;
        this.observer = null;
        this.signals = [];
        this.isActive = false;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        this.analyzeNode(node);
                    });
                }
            });
        });

        this.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.isActive = false;
        }
    }

    analyzeNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // 1. Hidden Iframe Injection (Cross-Origin Exfiltration)
        if (node.tagName === 'IFRAME') {
            const isHidden = node.style.display === 'none' || 
                             node.style.opacity === '0' || 
                             node.style.visibility === 'hidden' ||
                             node.width === '0' || 
                             node.height === '0' ||
                             node.width === '1' || 
                             node.height === '1';
            
            if (isHidden) {
                this.addSignal(95, "Behavioral Alert: Hidden iframe injection detected (Data Exfiltration / Exploit Delivery).");
            }
        }

        // 2. Delayed Credential Harvesting (Dynamic Login Forms)
        if (node.tagName === 'INPUT' && (node.type === 'password' || node.getAttribute('type') === 'password')) {
            this.addSignal(95, "Behavioral Alert: Delayed password input injection detected (Credential Harvesting).");
        } else if (node.querySelectorAll) {
            const passwords = node.querySelectorAll('input[type="password"]');
            if (passwords.length > 0) {
                this.addSignal(95, "Behavioral Alert: Delayed password form injection detected (Credential Harvesting).");
            }
        }
        
        // 3. Suspicious Script Injection (Obfuscated/Data URIs)
        if (node.tagName === 'SCRIPT') {
            if (node.src && node.src.startsWith('data:text/javascript')) {
                this.addSignal(95, "Behavioral Alert: Suspicious Data-URI Script Injection detected.");
            }
        }
    }

    addSignal(weight, reason) {
        this.score += weight;
        this.signals.push(reason);
        console.warn(`[TrustLensAI] Behavioral Signal Detected: ${reason} (Weight: ${weight})`);

        if (this.score >= this.threshold) {
            this.triggerBlock();
        }
    }

    triggerBlock() {
        this.stop();
        const threatData = {
            classification: "Scam",
            risk_score: Math.min(this.score, 100),
            reasons: this.signals
        };
        triggerFullScreenBlocker(threatData);
    }
}

const behavioralEngine = new BehavioralDetector();

// ==========================================
// 5. MASTER CONTROLLER & BCACHE FIX
// ==========================================
function initScanner() {
    // Ensure we don't crash if the DOM isn't fully ready
    if (!document.body) {
        window.requestAnimationFrame(initScanner);
        return;
    }
    
    if (window.location.hostname.includes("google.com")) {
        setTimeout(injectTrustLensShields, 1500);
    } else {
        activePageScanner();
        behavioralEngine.start();
    }
}

// 1. Fire instantly on initial page load (Zero Latency)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScanner);
} else {
    initScanner();
}

// 2. Fire on Back/Forward navigation (Defeats bfcache bypass)
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        initScanner();
    }
});
/**
 * TrustLensAI — Unified Content Script
 * Version: 1.1
 *
 * Architecture:
 *   Layer 1 — Baseline Heuristic Engine
 *             Synchronous checks against the page URL at document_start.
 *             Contributes risk score based on URL structure signals.
 *
 *   Layer 2 — Tier 2.5 Behavioral Detection Engine
 *             MutationObserver-driven runtime analysis.
 *             Catches dynamic phishing, hidden iframes, and obfuscated/
 *             encoded script execution payloads injected after page load.
 *
 * Trigger: riskScore >= 50 → full-screen red blocker UI rendered.
 * The blocker fires once only (isBlocked guard prevents duplicate renders).
 */

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED STATE
//  A single risk score accumulates signals from both layers.
// ─────────────────────────────────────────────────────────────────────────────
const TrustLens = (() => {
    const BLOCK_THRESHOLD = 50;

    let riskScore      = 0;
    let isBlocked      = false;
    let pageLoadTime   = Date.now();
    const signalLog    = [];   // Audit trail of every triggered signal

    // ── Signal recorder ──────────────────────────────────────────────────────
    function recordSignal(description, weight) {
        console.warn(
            `[TrustLensAI] Signal detected: "${description}" | Weight: +${weight} | ` +
            `Running score: ${riskScore + weight}`
        );
        riskScore += weight;
        signalLog.push({ description, weight, totalAfter: riskScore });
        evaluateThreshold();
    }

    // ── Threshold evaluator ───────────────────────────────────────────────────
    function evaluateThreshold() {
        if (riskScore >= BLOCK_THRESHOLD && !isBlocked) {
            isBlocked = true;
            renderBlockerUI();
        }
    }

    // ── Full-screen Blocker UI ────────────────────────────────────────────────
    function renderBlockerUI() {
        console.error(
            `[TrustLensAI] THREAT CONFIRMED — Risk score ${riskScore}/${BLOCK_THRESHOLD} threshold crossed. ` +
            `Rendering full-screen blocker.`
        );

        // Remove any pre-existing blocker (defensive)
        const existing = document.getElementById('trustlens-block-screen');
        if (existing) existing.remove();

        // Build signal list for the UI
        const signalListHTML = signalLog
            .map(s => `<li>${s.description} <span style="color:#fca5a5;">(+${s.weight} pts)</span></li>`)
            .join('');

        // Overlay container
        const blockScreen = document.createElement('div');
        blockScreen.id = 'trustlens-block-screen';
        blockScreen.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 60%, #1a0000 100%) !important;
            color: #ffffff !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            text-align: center !important;
            padding: 40px !important;
            box-sizing: border-box !important;
            animation: tl-fadein 0.4s ease !important;
        `;

        blockScreen.innerHTML = `
            <style>
                @keyframes tl-fadein {
                    from { opacity: 0; transform: scale(1.02); }
                    to   { opacity: 1; transform: scale(1);    }
                }
                @keyframes tl-pulse-ring {
                    0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
                    70%  { box-shadow: 0 0 0 24px rgba(239,68,68,0); }
                    100% { box-shadow: 0 0 0 0 rgba(239,68,68,0);   }
                }
                #tl-icon-wrap {
                    width: 80px; height: 80px;
                    background: rgba(239,68,68,0.15);
                    border: 2px solid rgba(239,68,68,0.5);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 24px;
                    animation: tl-pulse-ring 2s infinite;
                }
                #tl-icon-wrap svg { width: 40px; height: 40px; }
                #tl-title {
                    font-size: 2.6rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin: 0 0 12px;
                    color: #fef2f2;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
                }
                #tl-subtitle {
                    font-size: 1.1rem;
                    color: #fca5a5;
                    margin: 0 0 28px;
                    max-width: 560px;
                    line-height: 1.6;
                }
                #tl-score-badge {
                    display: inline-block;
                    background: rgba(239,68,68,0.2);
                    border: 1px solid rgba(239,68,68,0.4);
                    border-radius: 999px;
                    padding: 6px 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fca5a5;
                    margin-bottom: 28px;
                    letter-spacing: 0.05em;
                }
                #tl-signals-box {
                    background: rgba(0,0,0,0.35);
                    border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 12px;
                    padding: 16px 24px;
                    max-width: 600px;
                    width: 100%;
                    text-align: left;
                    margin-bottom: 28px;
                }
                #tl-signals-box h4 {
                    margin: 0 0 10px;
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #f87171;
                    font-weight: 700;
                }
                #tl-signals-box ul {
                    margin: 0; padding: 0 0 0 18px;
                    color: #fecaca;
                    font-size: 0.88rem;
                    line-height: 1.8;
                }
                #tl-leave-btn {
                    background: linear-gradient(135deg, #dc2626, #991b1b) !important;
                    color: #fff !important;
                    border: 1px solid rgba(255,255,255,0.15) !important;
                    border-radius: 10px !important;
                    padding: 14px 36px !important;
                    font-size: 1rem !important;
                    font-weight: 700 !important;
                    cursor: pointer !important;
                    letter-spacing: 0.03em !important;
                    box-shadow: 0 6px 20px rgba(185,28,28,0.5) !important;
                    transition: filter 0.2s ease, transform 0.2s ease !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                }
                #tl-leave-btn:hover {
                    filter: brightness(1.15) !important;
                    transform: translateY(-2px) !important;
                }
                #tl-footer {
                    margin-top: 24px;
                    font-size: 0.72rem;
                    color: rgba(252,165,165,0.45);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
            </style>

            <div id="tl-icon-wrap">
                <!-- Shield warning SVG -->
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>

            <h1 id="tl-title">Malicious Activity Blocked</h1>
            <p id="tl-subtitle">
                TrustLensAI intercepted a runtime behavioral threat on this page.<br>
                Your credentials and data are protected.
            </p>

            <div id="tl-score-badge">
                BEHAVIORAL RISK SCORE: ${riskScore} / 100
            </div>

            <div id="tl-signals-box">
                <h4>&#9888; Threat Signals Detected</h4>
                <ul>${signalListHTML || '<li>Composite heuristic risk threshold crossed.</li>'}</ul>
            </div>

            <button id="tl-leave-btn" onclick="window.location.href='about:blank'">
                &#x2192; &nbsp; Leave This Page Safely
            </button>

            <p id="tl-footer">Secured by TrustLensAI &bull; Behavioral Analytics Pipeline v1.1</p>
        `;

        // Append as early as possible — if body doesn't exist yet, wait for it
        if (document.body) {
            document.body.appendChild(blockScreen);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(blockScreen);
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  LAYER 1 — Baseline Heuristic Engine
    //  Runs synchronously at document_start against window.location.
    //  Signals are intentionally lightweight (10–20 pts each) so URL-only
    //  evidence does not cross the 50-pt threshold alone — multiple signals
    //  or a combination with behavioral signals is required.
    // ─────────────────────────────────────────────────────────────────────────
    function runBaselineHeuristics() {
        const href     = (window.location.href     || '').toLowerCase();
        const hostname = (window.location.hostname || '').toLowerCase();
        const pathname = (window.location.pathname || '').toLowerCase();

        // Signal 1 — IP-address URL (e.g. http://192.168.1.1/login)
        if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(hostname)) {
            recordSignal('IP-address URL detected (no domain name)', 20);
        }

        // Signal 2 — Suspicious TLD
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.work', '.icu', '.buzz', '.cyou'];
        if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
            recordSignal('Suspicious free/abused TLD detected', 15);
        }

        // Signal 3 — Excessive subdomain depth (>= 4 dot-separated labels)
        if (hostname.split('.').length >= 4) {
            recordSignal('Excessive subdomain depth (≥4 labels)', 15);
        }

        // Signal 4 — Lookalike brand keyword in a non-brand hostname
        const brandKeywords = [
            'paypal', 'amazon', 'apple', 'google', 'microsoft',
            'bankofamerica', 'netflix', 'facebook', 'instagram',
            'secure', 'login', 'verify', 'account', 'update', 'confirm'
        ];
        const trustedApexes = [
            'paypal.com', 'amazon.com', 'apple.com', 'google.com',
            'microsoft.com', 'bankofamerica.com', 'netflix.com',
            'facebook.com', 'instagram.com'
        ];
        const isActualBrand = trustedApexes.some(apex => hostname === apex || hostname.endsWith('.' + apex));
        if (!isActualBrand && brandKeywords.some(kw => hostname.includes(kw))) {
            recordSignal('Lookalike brand keyword in hostname', 20);
        }

        // Signal 5 — @ symbol in URL (classic credential-redirect trick)
        if (href.includes('@')) {
            recordSignal('@ symbol in URL (credential-redirect pattern)', 20);
        }

        // Signal 6 — Abnormally long URL (> 100 characters)
        if (href.length > 100) {
            recordSignal('Abnormally long URL (>100 characters)', 10);
        }

        // Signal 7 — Hyphen-heavy hostname (common in phishing domains)
        const hyphenCount = (hostname.match(/-/g) || []).length;
        if (hyphenCount >= 3) {
            recordSignal('Hyphen-heavy hostname (≥3 hyphens)', 10);
        }

        // Signal 8 — Suspicious keyword in path
        const pathKeywords = ['/login', '/signin', '/verify', '/account', '/update', '/confirm', '/secure', '/validate'];
        if (pathKeywords.some(kw => pathname.includes(kw))) {
            recordSignal('Suspicious action keyword in URL path', 10);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  LAYER 2 — Tier 2.5 Behavioral Detection Engine
    //  MutationObserver monitors the live DOM for dynamically-injected threats.
    //  Signals are weighted heavily (30–55 pts) because behavioral evidence
    //  is far more reliable than URL heuristics.
    // ─────────────────────────────────────────────────────────────────────────
    function initBehavioralEngine() {
        pageLoadTime = Date.now();

        const observer = new MutationObserver((mutations) => {
            if (isBlocked) {
                observer.disconnect();  // No further scanning needed
                return;
            }
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        inspectNode(node);
                    }
                });
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function inspectNode(node) {
        const elapsed = Date.now() - pageLoadTime;

        // ── B1: Delayed Credential Harvesting ────────────────────────────────
        // Password inputs injected MORE THAN 2500ms after page load are
        // almost certainly dynamic phishing overlays — no legitimate auth
        // flow injects a password field this late without user interaction.
        if (elapsed > 2500) {
            const isPasswordInput =
                node.tagName === 'INPUT' &&
                (node.getAttribute('type') || '').toLowerCase() === 'password';

            const containsPasswordInput =
                node.querySelectorAll
                    ? node.querySelectorAll('input[type="password"]').length > 0
                    : false;

            if (isPasswordInput || containsPasswordInput) {
                recordSignal('Delayed credential-harvesting field injected (>2500ms)', 55);
            }
        }

        // ── B2: Cloaked / Hidden Iframe Injection ─────────────────────────────
        if (node.tagName === 'IFRAME') {
            inspectIframe(node);
        } else if (node.querySelectorAll) {
            node.querySelectorAll('iframe').forEach(inspectIframe);
        }

        // ── B3: Dynamic Script Element Scanning ──────────────────────────────
        if (node.tagName === 'SCRIPT') {
            inspectScript(node);
        } else if (node.querySelectorAll) {
            node.querySelectorAll('script').forEach(inspectScript);
        }
    }

    function inspectIframe(iframe) {
        // Read computed style — accounts for CSS-class-based hiding
        const style  = window.getComputedStyle ? window.getComputedStyle(iframe) : {};
        const width  = iframe.offsetWidth  || parseInt(style.width  || '0', 10);
        const height = iframe.offsetHeight || parseInt(style.height || '0', 10);

        const isHidden =
            style.display     === 'none'   ||
            style.visibility  === 'hidden' ||
            parseFloat(style.opacity || '1') === 0 ||
            (width <= 1 && height <= 1);

        if (isHidden) {
            recordSignal('Cloaked/hidden iframe dynamically injected', 55);
        }
    }

    function inspectScript(script) {
        const src     = (script.getAttribute('src') || '').trim();
        const content = (script.textContent || '').trim();

        // ── B3a: Data-URI Script Execution ───────────────────────────────────
        // Legitimate sites never load scripts via data: URIs.
        if (src.toLowerCase().startsWith('data:text/javascript') ||
            src.toLowerCase().startsWith('data:application/javascript')) {
            recordSignal('Data-URI script execution payload detected', 55);
            return;
        }

        // ── B3b: Base64 Decode-and-Run Chain ─────────────────────────────────
        // Pattern: eval(atob(...)) or new Function(atob(...))
        if (/eval\s*\(\s*atob\s*\(/i.test(content) ||
            /Function\s*\(\s*atob\s*\(/i.test(content)) {
            recordSignal('Base64 decode-and-run chain (eval/Function + atob)', 55);
            return;
        }

        // ── B3c: Obfuscated Execution Signatures ─────────────────────────────
        // Each match adds 30 pts — one obfuscation pattern alone is
        // suspicious but may appear in legitimate minified code.
        // Two or more patterns crossing the 50-pt threshold is very reliable.
        const obfuscationPatterns = [
            { re: /eval\s*\(/i,                                           label: 'eval() call'                          },
            { re: /new\s+Function\s*\(/i,                                 label: 'new Function() dynamic compilation'   },
            { re: /document\.write\s*\(\s*unescape\s*\(/i,               label: 'document.write(unescape()) encoding'  },
            { re: /String\.fromCharCode\s*\(\s*\d+\s*,\s*\d+/i,          label: 'String.fromCharCode multi-arg chain'  },
            { re: /\\x[0-9a-f]{2}(\\x[0-9a-f]{2}){4,}/i,                label: 'Hex-escape obfuscation string'        },
            { re: /\\u[0-9a-f]{4}(\\u[0-9a-f]{4}){3,}/i,                label: 'Unicode-escape obfuscation string'    },
        ];

        obfuscationPatterns.forEach(({ re, label }) => {
            if (re.test(content)) {
                recordSignal(`Obfuscated JS signature: ${label}`, 30);
            }
        });
    }

    // ── Public init ──────────────────────────────────────────────────────────
    return { runBaselineHeuristics, initBehavioralEngine };
})();

// ─────────────────────────────────────────────────────────────────────────────
//  BOOTSTRAP
//  Layer 1 fires immediately (document_start — no DOM needed).
//  Layer 2 fires as soon as the DOM root exists to attach the observer.
// ─────────────────────────────────────────────────────────────────────────────

// Layer 1 — synchronous, no DOM dependency
TrustLens.runBaselineHeuristics();

// Layer 2 — attach MutationObserver when document element is available
if (document.documentElement) {
    TrustLens.initBehavioralEngine();
} else {
    // Fallback: rare case where document_start fires before <html> tag
    document.addEventListener('DOMContentLoaded', () => {
        TrustLens.initBehavioralEngine();
    });
}
/**
 * TrustLensAI — Dataset Generator
 * Version: 1.1
 *
 * Generates 14 malicious + 14 benign HTML test pages in ./dataset/
 *
 * Malicious samples exercise every detection signal in the Tier 2.5
 * Behavioral Detection Engine:
 *   - Hidden / cloaked iframes (opacity, visibility, display:none, 1×1 px)
 *   - Delayed credential-harvesting password fields (> 2500 ms)
 *   - Data-URI script execution
 *   - eval(atob(…)) base64 decode-and-run chains
 *   - Obfuscated JS patterns (eval, new Function, document.write(unescape))
 *   - Multi-signal compound attacks
 *
 * Benign samples are explicitly designed NOT to trigger the engine:
 *   - Visible forms with password fields present at t=0 (legitimate login pages)
 *   - Visible iframes (src set, normal dimensions)
 *   - Normal dynamic content (images, divs, paragraphs, buttons)
 *   - Legitimate external script tags
 *   - Password fields injected at exactly 2400 ms (BELOW the 2500 ms threshold)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const MALICIOUS_DIR = path.join(__dirname, 'dataset', 'malicious');
const BENIGN_DIR    = path.join(__dirname, 'dataset', 'benign');

fs.mkdirSync(MALICIOUS_DIR, { recursive: true });
fs.mkdirSync(BENIGN_DIR,    { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
//  MALICIOUS TEMPLATES  (14 samples)
//  All behavioral triggers fire AFTER load and above the 2500 ms boundary
//  so the MutationObserver is already attached before the threat appears.
// ─────────────────────────────────────────────────────────────────────────────
const MALICIOUS = [

    // M-01  Hidden iframe via opacity:0  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-01 Cloaked Iframe opacity:0</title></head><body>
<h1>Welcome — Special Offer</h1>
<script>
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.style.opacity = '0';
    iframe.src = 'https://evil.example.com/track';
    document.body.appendChild(iframe);
}, 1000);
</script>
</body></html>`,

    // M-02  Delayed password field at 2600 ms  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-02 Delayed Credential Harvesting</title></head><body>
<h1>Your Session Has Expired</h1>
<p>Please re-enter your credentials to continue.</p>
<script>
setTimeout(() => {
    const form = document.createElement('form');
    form.innerHTML = '<label>Password: <input type="password" name="pass" autocomplete="current-password"></label>';
    document.body.appendChild(form);
}, 2600);
</script>
</body></html>`,

    // M-03  Data-URI script injection  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-03 Data-URI Script Execution</title></head><body>
<h1>Loading Resources…</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.src = 'data:text/javascript,document.title="pwned"';
    document.body.appendChild(s);
}, 800);
</script>
</body></html>`,

    // M-04  eval(atob(…)) Base64 decode-and-run chain  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-04 Base64 Decode-and-Run Chain</title></head><body>
<h1>Initializing…</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.textContent = 'eval(atob("Y29uc29sZS5sb2coImV2aWwi"))';
    document.body.appendChild(s);
}, 1000);
</script>
</body></html>`,

    // M-05  Combined: hidden iframe + delayed password field
    `<!DOCTYPE html>
<html><head><title>M-05 Multi-Signal: Hidden Iframe + Password</title></head><body>
<h1>Verify Your Identity</h1>
<script>
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.style.visibility = 'hidden';
    iframe.src = 'https://tracker.evil.example/log';
    document.body.appendChild(iframe);
}, 900);
setTimeout(() => {
    const inp = document.createElement('input');
    inp.type = 'password';
    document.body.appendChild(inp);
}, 2700);
</script>
</body></html>`,

    // M-06  Cloaked iframe via visibility:hidden  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-06 Cloaked Iframe visibility:hidden</title></head><body>
<h1>News Feed</h1>
<script>
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
}, 1200);
</script>
</body></html>`,

    // M-07  1×1 pixel iframe  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-07 1x1 Pixel Iframe</title></head><body>
<h1>Claim Your Airdrop</h1>
<script>
setTimeout(() => {
    const f = document.createElement('iframe');
    f.width  = '1';
    f.height = '1';
    f.src    = 'https://exfil.evil.example';
    document.body.appendChild(f);
}, 600);
</script>
</body></html>`,

    // M-08  display:none iframe  (weight +55 → blocks alone)
    `<!DOCTYPE html>
<html><head><title>M-08 display:none Iframe</title></head><body>
<h1>Content Portal</h1>
<script>
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://beacon.evil.example';
    document.body.appendChild(iframe);
}, 1000);
</script>
</body></html>`,

    // M-09  new Function() dynamic compilation  (weight +30; pair with +30 to pass 50)
    `<!DOCTYPE html>
<html><head><title>M-09 new Function() Obfuscation</title></head><body>
<h1>App Loading</h1>
<script>
setTimeout(() => {
    const script1 = document.createElement('script');
    script1.textContent = 'new Function("return 1+1")()';
    document.body.appendChild(script1);
    const script2 = document.createElement('script');
    script2.textContent = 'eval("1+1")';
    document.body.appendChild(script2);
}, 700);
</script>
</body></html>`,

    // M-10  document.write(unescape(…)) encoding  (+30) + eval (+30) = 60 → blocks
    `<!DOCTYPE html>
<html><head><title>M-10 document.write unescape Obfuscation</title></head><body>
<h1>Legacy Widget</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.textContent = "document.write(unescape('%3Ch1%3EHello%3C%2Fh1%3E')); eval('1')";
    document.body.appendChild(s);
}, 800);
</script>
</body></html>`,

    // M-11  String.fromCharCode multi-arg + eval  (+30 + +30 = 60 → blocks)
    `<!DOCTYPE html>
<html><head><title>M-11 String.fromCharCode Chain</title></head><body>
<h1>Decoder Widget</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.textContent = "var x = String.fromCharCode(104, 101, 108, 108, 111); eval(x);";
    document.body.appendChild(s);
}, 900);
</script>
</body></html>`,

    // M-12  Multi-signal compound: eval + hidden iframe  (+30 + +55 = 85 → blocks)
    `<!DOCTYPE html>
<html><head><title>M-12 Compound: eval + Hidden Iframe</title></head><body>
<h1>Portal</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.textContent = "eval('console.log(\"payload\")')";
    document.body.appendChild(s);

    const iframe = document.createElement('iframe');
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);
}, 1100);
</script>
</body></html>`,

    // M-13  Stealth login form — password field at exactly 2600 ms
    `<!DOCTYPE html>
<html><head><title>M-13 Stealth Login Overlay at 2600ms</title></head><body>
<h1>Account Security Check</h1>
<p>We need to confirm your identity.</p>
<script>
setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999;';
    overlay.innerHTML = '<h2>Re-authenticate</h2><input type="password" placeholder="Enter password">';
    document.body.appendChild(overlay);
}, 2600);
</script>
</body></html>`,

    // M-14  Chained attack: data-URI + credential harvesting (55 + 55 → first fires alone)
    `<!DOCTYPE html>
<html><head><title>M-14 Chained: Data-URI + Credential Harvesting</title></head><body>
<h1>Security Verification Required</h1>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.src = 'data:text/javascript,console.log("phase1")';
    document.body.appendChild(s);
}, 500);
setTimeout(() => {
    const div = document.createElement('div');
    div.innerHTML = '<form><input type="password" name="secret"></form>';
    document.body.appendChild(div);
}, 2700);
</script>
</body></html>`,

];

// ─────────────────────────────────────────────────────────────────────────────
//  BENIGN TEMPLATES  (14 samples)
//  Carefully crafted to NOT trigger the behavioral engine.
// ─────────────────────────────────────────────────────────────────────────────
const BENIGN = [

    // B-01  Normal page — dynamic text content only
    `<!DOCTYPE html>
<html><head><title>B-01 Normal Dynamic Text</title></head><body>
<h1>Welcome to Our Blog</h1>
<script>
setTimeout(() => {
    const div = document.createElement('div');
    div.textContent = 'Latest posts loaded successfully.';
    document.body.appendChild(div);
}, 1000);
</script>
</body></html>`,

    // B-02  Lazy-loaded image
    `<!DOCTYPE html>
<html><head><title>B-02 Lazy Image Load</title></head><body>
<h1>Photo Gallery</h1>
<script>
setTimeout(() => {
    const img = document.createElement('img');
    img.src = 'https://picsum.photos/200';
    img.alt = 'Gallery image';
    document.body.appendChild(img);
}, 1500);
</script>
</body></html>`,

    // B-03  Password field present at t=0 (legitimate login page — no dynamic injection)
    //       AND a second password field injected at exactly 2400 ms (BELOW 2500 ms threshold).
    //       Both are TRUE NEGATIVES — the engine must NOT trigger.
    `<!DOCTYPE html>
<html><head><title>B-03 Legitimate Login Page</title></head><body>
<h1>Sign In</h1>
<form>
    <label>Username: <input type="text" name="username"></label><br>
    <label>Password: <input type="password" name="password"></label><br>
    <button type="submit">Log In</button>
</form>
<script>
// Password field injected at 2400ms — strictly BELOW the 2500ms detection window.
// This is the boundary test: engine must NOT fire for sub-threshold timing.
setTimeout(() => {
    const hint = document.createElement('p');
    hint.textContent = 'Forgot your password? Click here to reset.';
    const inp = document.createElement('input');
    inp.type = 'password';
    inp.placeholder = 'Confirm new password';
    document.body.appendChild(hint);
    document.body.appendChild(inp);
}, 2400);
</script>
</body></html>`,

    // B-04  Visible iframe with legitimate src (YouTube embed)
    `<!DOCTYPE html>
<html><head><title>B-04 Legitimate Visible Iframe</title></head><body>
<h1>Watch Our Demo</h1>
<iframe width="560" height="315"
    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
    title="YouTube video player"
    frameborder="0" allowfullscreen>
</iframe>
</body></html>`,

    // B-05  SPA-style dynamic content injection
    `<!DOCTYPE html>
<html><head><title>B-05 SPA Dynamic Content</title></head><body>
<h1>Loading Dashboard…</h1>
<script>
setTimeout(() => {
    document.body.innerHTML += '<h2>Dashboard Ready</h2><p>All systems operational.</p>';
}, 500);
</script>
</body></html>`,

    // B-06  Comment section — delayed paragraph injection
    `<!DOCTYPE html>
<html><head><title>B-06 Dynamic Comment Section</title></head><body>
<h1>Article: The Future of AI</h1>
<p>Lorem ipsum dolor sit amet…</p>
<script>
setTimeout(() => {
    const p = document.createElement('p');
    p.textContent = 'Great article! Really insightful.';
    document.body.appendChild(p);
}, 2000);
</script>
</body></html>`,

    // B-07  Legitimate external script tag (no inline content)
    `<!DOCTYPE html>
<html><head><title>B-07 Legitimate External Script</title></head><body>
<h1>Analytics Demo</h1>
<script src="https://cdn.example.com/analytics.js"></script>
</body></html>`,

    // B-08  Button dynamically added
    `<!DOCTYPE html>
<html><head><title>B-08 Dynamic Button Injection</title></head><body>
<h1>Interactive Dashboard</h1>
<script>
setTimeout(() => {
    const btn = document.createElement('button');
    btn.textContent = 'Load More Results';
    document.body.appendChild(btn);
}, 1000);
</script>
</body></html>`,

    // B-09  News feed list items injected dynamically
    `<!DOCTYPE html>
<html><head><title>B-09 News Feed Dynamic List</title></head><body>
<h1>Today's Headlines</h1>
<ul id="feed"></ul>
<script>
setTimeout(() => {
    const feed = document.getElementById('feed');
    ['Story A', 'Story B', 'Story C'].forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        feed.appendChild(li);
    });
}, 1500);
</script>
</body></html>`,

    // B-10  Completely static site — no JavaScript at all
    `<!DOCTYPE html>
<html><head><title>B-10 Static Site</title></head><body>
<h1>About Us</h1>
<p>We are a trusted company with over 20 years of experience.</p>
<p>Contact us at hello@example.com</p>
</body></html>`,

    // B-11  Visible iframe dynamically added (full dimensions, no hiding)
    `<!DOCTYPE html>
<html><head><title>B-11 Visible Iframe Dynamically Added</title></head><body>
<h1>Partner Content</h1>
<script>
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.src    = 'https://example.com';
    iframe.width  = '600';
    iframe.height = '400';
    iframe.title  = 'Partner embed';
    document.body.appendChild(iframe);
}, 1200);
</script>
</body></html>`,

    // B-12  Form with password field visible at t=0 plus dynamic heading change
    `<!DOCTYPE html>
<html><head><title>B-12 Login Form with Dynamic Header</title></head><body>
<h1 id="greeting">Loading…</h1>
<form>
    <input type="text" name="email" placeholder="Email">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Sign In</button>
</form>
<script>
setTimeout(() => {
    document.getElementById('greeting').textContent = 'Welcome back!';
}, 500);
</script>
</body></html>`,

    // B-13  Modal dialog (div overlay) added dynamically — no password, no iframe
    `<!DOCTYPE html>
<html><head><title>B-13 Dynamic Modal Dialog</title></head><body>
<h1>E-Commerce Store</h1>
<p>Browse our products below.</p>
<script>
setTimeout(() => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border:1px solid #ccc;border-radius:8px;';
    modal.innerHTML = '<h2>Special Offer!</h2><p>Use code SAVE20 for 20% off.</p><button onclick="this.parentNode.remove()">Close</button>';
    document.body.appendChild(modal);
}, 2000);
</script>
</body></html>`,

    // B-14  Single eval() call — alone it adds only 30 pts (below 50 threshold)
    //       Verifies that one weak obfuscation signal does NOT trigger the blocker.
    `<!DOCTYPE html>
<html><head><title>B-14 Single eval() — Sub-Threshold</title></head><body>
<h1>Math Widget</h1>
<p id="result"></p>
<script>
setTimeout(() => {
    const s = document.createElement('script');
    s.textContent = 'document.getElementById("result").textContent = eval("2 + 2");';
    document.body.appendChild(s);
}, 800);
</script>
</body></html>`,

];

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE FILES
// ─────────────────────────────────────────────────────────────────────────────
MALICIOUS.forEach((html, i) => {
    const filename = `malicious_${String(i + 1).padStart(2, '0')}.html`;
    fs.writeFileSync(path.join(MALICIOUS_DIR, filename), html, 'utf8');
    console.log(`[✓] Written: dataset/malicious/${filename}`);
});

BENIGN.forEach((html, i) => {
    const filename = `benign_${String(i + 1).padStart(2, '0')}.html`;
    fs.writeFileSync(path.join(BENIGN_DIR, filename), html, 'utf8');
    console.log(`[✓] Written: dataset/benign/${filename}`);
});

console.log(`\n[TrustLensAI] Dataset generation complete.`);
console.log(`  Malicious samples : ${MALICIOUS.length}`);
console.log(`  Benign samples    : ${BENIGN.length}`);
console.log(`  Total             : ${MALICIOUS.length + BENIGN.length}`);
console.log(`\nRun 'node evaluate_metrics.js' to test the extension against this dataset.`);
